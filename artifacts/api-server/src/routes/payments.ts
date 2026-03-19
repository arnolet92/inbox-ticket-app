import { Router, type IRouter } from "express";
import { db, paymentsTable, ordersTable, ticketTypesTable, eventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const createPaymentSchema = z.object({
  orderId: z.number(),
  method: z.enum(["orange_money", "mvola", "mastercard"]),
  phoneNumber: z.string().optional().nullable(),
  cardNumber: z.string().optional().nullable(),
  cardExpiry: z.string().optional().nullable(),
  cardCvv: z.string().optional().nullable(),
});

router.get("/payments", async (req, res) => {
  try {
    const { method, status } = req.query as Record<string, string>;
    let payments = await db.select().from(paymentsTable);
    if (method) payments = payments.filter(p => p.method === method);
    if (status) payments = payments.filter(p => p.status === status);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

router.post("/payments", async (req, res) => {
  try {
    const data = createPaymentSchema.parse(req.body);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, data.orderId));
    if (!order) return void res.status(404).json({ error: "Order not found" });

    const transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const cardLast4 = data.cardNumber ? data.cardNumber.slice(-4) : null;

    const [payment] = await db.insert(paymentsTable).values({
      orderId: data.orderId,
      method: data.method,
      amount: order.totalAmount,
      currency: order.currency,
      status: "success",
      transactionRef,
      phoneNumber: data.phoneNumber ?? null,
      cardLast4,
    }).returning();

    await db.update(ordersTable).set({ status: "confirmed" }).where(eq(ordersTable.id, data.orderId));

    const [ticketType] = await db.select().from(ticketTypesTable).where(eq(ticketTypesTable.id, order.ticketTypeId));
    if (ticketType) {
      await db.update(ticketTypesTable)
        .set({ soldCount: ticketType.soldCount + order.quantity })
        .where(eq(ticketTypesTable.id, ticketType.id));

      await db.update(eventsTable)
        .set({ soldTickets: (await db.select().from(eventsTable).where(eq(eventsTable.id, order.eventId)))[0].soldTickets + order.quantity })
        .where(eq(eventsTable.id, order.eventId));
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Payment failed" });
  }
});

export default router;
