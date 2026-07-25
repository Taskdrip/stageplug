import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const competitionsTable = pgTable("competitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull().default(""),
  coverImageUrl: text("cover_image_url"),
  status: text("status").notNull().default("open"),
  prizePool: integer("prize_pool").notNull().default(0),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const competitionEntriesTable = pgTable("competition_entries", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id").notNull(),
  artistId: integer("artist_id").notNull(),
  submissionUrl: text("submission_url"),
  votes: integer("votes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const competitionVotesTable = pgTable("competition_votes", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCompetitionSchema = createInsertSchema(competitionsTable).omit({ id: true, createdAt: true });
export type InsertCompetition = z.infer<typeof insertCompetitionSchema>;
export type Competition = typeof competitionsTable.$inferSelect;
