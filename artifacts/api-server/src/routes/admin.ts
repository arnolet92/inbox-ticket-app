import { Router, type IRouter } from "express";
import { db, ordersTable, eventsTable, ticketTypesTable, paymentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/admin/stats", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable);
    const events = await db.select().from(eventsTable);
    const payments = await db.select().from(paymentsTable);

    const confirmedOrders = orders.filter(o => o.status === "confirmed");
    const totalRevenue = confirmedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const totalTicketsSold = confirmedOrders.reduce((sum, o) => sum + o.quantity, 0);
    const activeEvents = events.filter(e => e.status === "upcoming" || e.status === "ongoing").length;
    const pendingOrders = orders.filter(o => o.status === "pending").length;

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthOrders = confirmedOrders.filter(o => new Date(o.createdAt) >= thisMonth);
    const lastMonthOrders = confirmedOrders.filter(o => new Date(o.createdAt) >= lastMonth && new Date(o.createdAt) < thisMonth);

    const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

    const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
    const ordersGrowth = lastMonthOrders.length > 0
      ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100
      : 0;

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      totalTicketsSold,
      totalEvents: events.length,
      activeEvents,
      pendingOrders,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      ordersGrowth: Math.round(ordersGrowth * 10) / 10,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/admin/revenue-by-month", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable);
    const confirmedOrders = orders.filter(o => o.status === "confirmed");

    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const now = new Date();
    const result = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthOrders = confirmedOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= date && d < nextDate;
      });
      result.push({
        month: months[date.getMonth()],
        revenue: monthOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0),
        orders: monthOrders.length,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch revenue data" });
  }
});

router.get("/admin/sales-by-event", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable);
    const events = await db.select().from(eventsTable);
    const confirmedOrders = orders.filter(o => o.status === "confirmed");

    const totalRevenue = confirmedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

    const byEvent = events.map(event => {
      const eventOrders = confirmedOrders.filter(o => o.eventId === event.id);
      const revenue = eventOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
      const ticketsSold = eventOrders.reduce((sum, o) => sum + o.quantity, 0);
      return {
        eventId: event.id,
        eventTitle: event.title,
        ticketsSold,
        revenue,
        percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100 * 10) / 10 : 0,
      };
    }).filter(e => e.ticketsSold > 0).sort((a, b) => b.revenue - a.revenue);

    res.json(byEvent);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event sales" });
  }
});

router.get("/admin/payment-methods", async (req, res) => {
  try {
    const payments = await db.select().from(paymentsTable);
    const successPayments = payments.filter(p => p.status === "success");
    const totalAmount = successPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const methods = ["orange_money", "mvola", "mastercard"] as const;
    const result = methods.map(method => {
      const methodPayments = successPayments.filter(p => p.method === method);
      const amount = methodPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      return {
        method,
        count: methodPayments.length,
        amount,
        percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100 * 10) / 10 : 0,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment method stats" });
  }
});

export default router;
