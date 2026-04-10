import { pgTable, serial, text, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ordersTable } from "./orders";

export const paymentMethodEnum = pgEnum("payment_method", ["orange_money", "mvola", "mastercard"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "success", "failed", "refunded"]);

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  method: paymentMethodEnum("method").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("MGA"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  transactionRef: text("transaction_ref"),
  phoneNumber: text("phone_number"),
  cardLast4: text("card_last4"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
