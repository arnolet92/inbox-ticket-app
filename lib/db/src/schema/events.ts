import { pgTable, serial, text, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventStatusEnum = pgEnum("event_status", ["upcoming", "ongoing", "past", "cancelled"]);

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  imageUrl: text("image_url"),
  status: eventStatusEnum("status").notNull().default("upcoming"),
  totalCapacity: integer("total_capacity").notNull(),
  soldTickets: integer("sold_tickets").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true, soldTickets: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
