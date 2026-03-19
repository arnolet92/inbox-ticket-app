import { Router, type IRouter } from "express";
import { db, ticketTypesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { insertTicketTypeSchema } from "@workspace/db";

const router: IRouter = Router();

router.get("/ticket-types", async (req, res) => {
  try {
    const { eventId } = req.query as Record<string, string>;
    let ticketTypes = await db.select().from(ticketTypesTable);
    if (eventId) ticketTypes = ticketTypes.filter(t => t.eventId === parseInt(eventId));
    res.json(ticketTypes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ticket types" });
  }
});

router.post("/ticket-types", async (req, res) => {
  try {
    const data = insertTicketTypeSchema.parse(req.body);
    const [ticketType] = await db.insert(ticketTypesTable).values(data).returning();
    res.status(201).json(ticketType);
  } catch (error) {
    res.status(400).json({ error: "Invalid ticket type data" });
  }
});

export default router;
