import { Router, type IRouter } from "express";
import { db, ordersTable, eventsTable, ticketTypesTable, paymentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const createOrderSchema = z.object({
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional().nullable(),
  ticketTypeId: z.number(),
  quantity: z.number().min(1),
  paymentMethod: z.enum(["orange_money", "mvola", "mastercard"]),
});

router.get("/orders", async (req, res) => {
  try {
    const { status, eventId, customerEmail, customerPhone } = req.query as Record<string, string>;
    let orders = await db.select().from(ordersTable);
    if (status) orders = orders.filter(o => o.status === status);
    if (eventId) orders = orders.filter(o => o.eventId === parseInt(eventId));
    if (customerEmail) orders = orders.filter(o => o.customerEmail.toLowerCase() === customerEmail.toLowerCase());
    if (customerPhone) orders = orders.filter(o => o.customerPhone?.replace(/\s/g, "") === customerPhone.replace(/\s/g, ""));

    const enriched = await Promise.all(orders.map(async (order) => {
      const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, order.eventId));
      const [ticketType] = await db.select().from(ticketTypesTable).where(eq(ticketTypesTable.id, order.ticketTypeId));
      const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.orderId, order.id));
      return { ...order, event: event || null, ticketType: ticketType || null, payment: payment || null };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) return void res.status(404).json({ error: "Order not found" });

    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, order.eventId));
    const [ticketType] = await db.select().from(ticketTypesTable).where(eq(ticketTypesTable.id, order.ticketTypeId));
    const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.orderId, order.id));
    res.json({ ...order, event: event || null, ticketType: ticketType || null, payment: payment || null });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const [ticketType] = await db.select().from(ticketTypesTable).where(eq(ticketTypesTable.id, data.ticketTypeId));
    if (!ticketType) return void res.status(404).json({ error: "Ticket type not found" });

    const totalAmount = parseFloat(ticketType.price) * data.quantity;
    const [order] = await db.insert(ordersTable).values({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone ?? null,
      ticketTypeId: data.ticketTypeId,
      eventId: ticketType.eventId,
      quantity: data.quantity,
      totalAmount: totalAmount.toFixed(2),
      currency: ticketType.currency,
      status: "pending",
    }).returning();

    res.status(201).json({ ...order, event: null, ticketType, payment: null });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Invalid order data" });
  }
});

export default router;
