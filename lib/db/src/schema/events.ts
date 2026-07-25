import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  organizerId: integer("organizer_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  ticketPrice: integer("ticket_price").notNull().default(0),
  totalTickets: integer("total_tickets").notNull().default(100),
  soldTickets: integer("sold_tickets").notNull().default(0),
  coverImageUrl: text("cover_image_url").notNull().default(""),
  status: text("status").notNull().default("upcoming"),
  featured: integer("featured").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  qrCode: text("qr_code").notNull(),
  purchasedAt: timestamp("purchased_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
