import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const artistProfilesTable = pgTable("artist_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  artistType: text("artist_type").notNull().default("artist"),
  genres: text("genres").array().notNull().default([]),
  languages: text("languages").array().notNull().default([]),
  country: text("country").notNull().default(""),
  city: text("city"),
  bio: text("bio").notNull().default(""),
  coverImageUrl: text("cover_image_url").notNull().default(""),
  bookingPrice: integer("booking_price"),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  verified: integer("verified").notNull().default(0),
  instagramUrl: text("instagram_url"),
  twitterUrl: text("twitter_url"),
  youtubeUrl: text("youtube_url"),
  spotifyUrl: text("spotify_url"),
  soundcloudUrl: text("soundcloud_url"),
  tiktokUrl: text("tiktok_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  rating: real("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertArtistProfileSchema = createInsertSchema(artistProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertArtistProfile = z.infer<typeof insertArtistProfileSchema>;
export type ArtistProfile = typeof artistProfilesTable.$inferSelect;

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
