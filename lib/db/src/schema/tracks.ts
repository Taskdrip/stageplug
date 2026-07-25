import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tracksTable = pgTable("tracks", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").notNull(),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  trackType: text("track_type").notNull().default("single"),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  coverUrl: text("cover_url").notNull().default(""),
  audioUrl: text("audio_url"),
  price: integer("price"),
  plays: integer("plays").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTrackSchema = createInsertSchema(tracksTable).omit({ id: true, createdAt: true });
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Track = typeof tracksTable.$inferSelect;
