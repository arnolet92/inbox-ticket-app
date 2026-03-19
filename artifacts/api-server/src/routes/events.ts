import { Router, type IRouter } from "express";
import { db, eventsTable, ticketTypesTable } from "@workspace/db";
import { eq, like, and, or } from "drizzle-orm";
import { insertEventSchema } from "@workspace/db";

const router: IRouter = Router();

router.get("/events", async (req, res) => {
  try {
    const { category, status, search } = req.query as Record<string, string>;
    let events = await db.select().from(eventsTable);

    if (category) events = events.filter(e => e.category === category);
    if (status) events = events.filter(e => e.status === status);
    if (search) events = events.filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase())
    );

    const withTickets = await Promise.all(events.map(async (event) => {
      const ticketTypes = await db.select().from(ticketTypesTable).where(eq(ticketTypesTable.eventId, event.id));
      return { ...event, ticketTypes };
    }));

    res.json(withTickets);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
    if (!event) return void res.status(404).json({ error: "Event not found" });

    const ticketTypes = await db.select().from(ticketTypesTable).where(eq(ticketTypesTable.eventId, id));
    res.json({ ...event, ticketTypes });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

router.post("/events", async (req, res) => {
  try {
    const data = insertEventSchema.parse(req.body);
    const [event] = await db.insert(eventsTable).values(data).returning();
    res.status(201).json({ ...event, ticketTypes: [] });
  } catch (error) {
    res.status(400).json({ error: "Invalid event data" });
  }
});

router.put("/events/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertEventSchema.parse(req.body);
    const [event] = await db.update(eventsTable).set(data).where(eq(eventsTable.id, id)).returning();
    if (!event) return void res.status(404).json({ error: "Event not found" });
    const ticketTypes = await db.select().from(ticketTypesTable).where(eq(ticketTypesTable.eventId, id));
    res.json({ ...event, ticketTypes });
  } catch (error) {
    res.status(400).json({ error: "Invalid event data" });
  }
});

router.delete("/events/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(eventsTable).where(eq(eventsTable.id, id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
