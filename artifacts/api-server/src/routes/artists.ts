import { Router, type IRouter } from "express";
import { eq, sql, and, gte, lte, ilike } from "drizzle-orm";
import {
  db, artistProfilesTable, usersTable, reviewsTable, tracksTable,
  followsTable, userBadgesTable,
} from "@workspace/db";
import { requireAuth, optionalAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

function buildArtistCard(profile: typeof artistProfilesTable.$inferSelect, user: typeof usersTable.$inferSelect, followersCount: number, badges: string[]) {
  return {
    id: profile.id,
    displayName: user.displayName,
    artistType: profile.artistType,
    genres: profile.genres,
    country: profile.country,
    city: profile.city,
    coverImageUrl: profile.coverImageUrl,
    avatarUrl: user.avatarUrl,
    rating: profile.rating,
    reviewCount: profile.reviewCount,
    followersCount,
    verified: profile.verified === 1,
    xp: user.xp,
    level: user.level,
    bookingPrice: profile.bookingPrice,
  };
}

// GET /artists
router.get("/artists", optionalAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const { q, genre, country, city, artistType, verified, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 50);
  const offset = (pageNum - 1) * limitNum;

  let profiles = await db.select().from(artistProfilesTable)
    .leftJoin(usersTable, eq(artistProfilesTable.userId, usersTable.id))
    .limit(limitNum).offset(offset);

  // Filter in JS for simplicity
  let filtered = profiles.filter(({ artist_profiles: p, users: u }) => {
    if (!p || !u) return false;
    if (country && p.country.toLowerCase() !== country.toLowerCase()) return false;
    if (city && p.city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
    if (artistType && p.artistType !== artistType) return false;
    if (verified === "true" && p.verified !== 1) return false;
    if (genre && !p.genres.some((g: string) => g.toLowerCase().includes(genre.toLowerCase()))) return false;
    if (q && !u.displayName.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const artists = await Promise.all(
    filtered.map(async ({ artist_profiles: p, users: u }) => {
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followingId, p!.userId));
      return buildArtistCard(p!, u!, Number(count), []);
    })
  );

  res.json({ artists, total: artists.length, page: pageNum, limit: limitNum });
});

// GET /artists/trending
router.get("/artists/trending", async (_req, res): Promise<void> => {
  const profiles = await db.select().from(artistProfilesTable)
    .leftJoin(usersTable, eq(artistProfilesTable.userId, usersTable.id))
    .orderBy(sql`${artistProfilesTable.rating} desc`)
    .limit(12);

  const result = await Promise.all(profiles.map(async ({ artist_profiles: p, users: u }) => {
    if (!p || !u) return null;
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followingId, p.userId));
    return buildArtistCard(p, u, Number(count), []);
  }));
  res.json(result.filter(Boolean));
});

// GET /artists/rising
router.get("/artists/rising", async (_req, res): Promise<void> => {
  const profiles = await db.select().from(artistProfilesTable)
    .leftJoin(usersTable, eq(artistProfilesTable.userId, usersTable.id))
    .orderBy(sql`${artistProfilesTable.created_at} desc`)
    .limit(12);

  const result = await Promise.all(profiles.map(async ({ artist_profiles: p, users: u }) => {
    if (!p || !u) return null;
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followingId, p.userId));
    return buildArtistCard(p, u, Number(count), []);
  }));
  res.json(result.filter(Boolean));
});

// GET /artists/top-producers
router.get("/artists/top-producers", async (_req, res): Promise<void> => {
  const profiles = await db.select().from(artistProfilesTable)
    .leftJoin(usersTable, eq(artistProfilesTable.userId, usersTable.id))
    .where(eq(artistProfilesTable.artistType, "producer"))
    .limit(10);

  const result = await Promise.all(profiles.map(async ({ artist_profiles: p, users: u }) => {
    if (!p || !u) return null;
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followingId, p.userId));
    return buildArtistCard(p, u, Number(count), []);
  }));
  res.json(result.filter(Boolean));
});

// GET /artists/top-djs
router.get("/artists/top-djs", async (_req, res): Promise<void> => {
  const profiles = await db.select().from(artistProfilesTable)
    .leftJoin(usersTable, eq(artistProfilesTable.userId, usersTable.id))
    .where(eq(artistProfilesTable.artistType, "dj"))
    .limit(10);

  const result = await Promise.all(profiles.map(async ({ artist_profiles: p, users: u }) => {
    if (!p || !u) return null;
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followingId, p.userId));
    return buildArtistCard(p, u, Number(count), []);
  }));
  res.json(result.filter(Boolean));
});

// GET /artists/me
router.get("/artists/me", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const [profile] = await db.select().from(artistProfilesTable).where(eq(artistProfilesTable.userId, req.dbUserId!));
  if (!profile) { res.status(404).json({ error: "Artist profile not found" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.dbUserId!));
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followingId, req.dbUserId!));
  const tracks = await db.select().from(tracksTable).where(eq(tracksTable.artistId, profile.id)).limit(20);

  res.json({
    ...buildArtistCard(profile, user, Number(count), []),
    bio: profile.bio, languages: profile.languages,
    socialLinks: { instagram: profile.instagramUrl, twitter: profile.twitterUrl, youtube: profile.youtubeUrl, spotify: profile.spotifyUrl, soundcloud: profile.soundcloudUrl, tiktok: profile.tiktokUrl },
    tracks: tracks.map((t) => ({ ...t, artistName: user.displayName, createdAt: t.createdAt.toISOString() })),
    badges: [],
    isFollowedByMe: false,
  });
});

// PUT /artists/me
router.put("/artists/me", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const { displayName, artistType, genres, languages, country, city, bio, coverImageUrl, avatarUrl, bookingPrice, socialLinks } = req.body;

  let [profile] = await db.select().from(artistProfilesTable).where(eq(artistProfilesTable.userId, req.dbUserId!));
  if (!profile) {
    [profile] = await db.insert(artistProfilesTable).values({
      userId: req.dbUserId!, artistType: artistType || "artist", genres: genres || [], languages: languages || [],
      country: country || "", city, bio: bio || "", coverImageUrl: coverImageUrl || "",
      bookingPrice, instagramUrl: socialLinks?.instagram, twitterUrl: socialLinks?.twitter,
      youtubeUrl: socialLinks?.youtube, spotifyUrl: socialLinks?.spotify,
      soundcloudUrl: socialLinks?.soundcloud, tiktokUrl: socialLinks?.tiktok,
    }).returning();
  } else {
    const updates: Record<string, unknown> = {};
    if (artistType) updates.artistType = artistType;
    if (genres) updates.genres = genres;
    if (languages) updates.languages = languages;
    if (country) updates.country = country;
    if (city !== undefined) updates.city = city;
    if (bio !== undefined) updates.bio = bio;
    if (coverImageUrl) updates.coverImageUrl = coverImageUrl;
    if (bookingPrice !== undefined) updates.bookingPrice = bookingPrice;
    if (socialLinks) {
      if (socialLinks.instagram !== undefined) updates.instagramUrl = socialLinks.instagram;
      if (socialLinks.twitter !== undefined) updates.twitterUrl = socialLinks.twitter;
      if (socialLinks.youtube !== undefined) updates.youtubeUrl = socialLinks.youtube;
      if (socialLinks.spotify !== undefined) updates.spotifyUrl = socialLinks.spotify;
      if (socialLinks.soundcloud !== undefined) updates.soundcloudUrl = socialLinks.soundcloud;
      if (socialLinks.tiktok !== undefined) updates.tiktokUrl = socialLinks.tiktok;
    }
    [profile] = await db.update(artistProfilesTable).set(updates).where(eq(artistProfilesTable.id, profile.id)).returning();
  }

  if (displayName) {
    await db.update(usersTable).set({ displayName, role: "artist" }).where(eq(usersTable.id, req.dbUserId!));
    if (avatarUrl) await db.update(usersTable).set({ avatarUrl }).where(eq(usersTable.id, req.dbUserId!));
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.dbUserId!));
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followingId, req.dbUserId!));
  const tracks = await db.select().from(tracksTable).where(eq(tracksTable.artistId, profile.id)).limit(20);

  res.json({
    ...buildArtistCard(profile, user, Number(count), []),
    bio: profile.bio, languages: profile.languages,
    socialLinks: { instagram: profile.instagramUrl, twitter: profile.twitterUrl, youtube: profile.youtubeUrl, spotify: profile.spotifyUrl, soundcloud: profile.soundcloudUrl, tiktok: profile.tiktokUrl },
    tracks: tracks.map((t) => ({ ...t, artistName: user.displayName, createdAt: t.createdAt.toISOString() })),
    badges: [],
    isFollowedByMe: false,
  });
});

// GET /artists/:artistId
router.get("/artists/:artistId", optionalAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const artistId = parseInt(Array.isArray(req.params.artistId) ? req.params.artistId[0] : req.params.artistId, 10);
  const [profile] = await db.select().from(artistProfilesTable).where(eq(artistProfilesTable.id, artistId));
  if (!profile) { res.status(404).json({ error: "Artist not found" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, profile.userId));
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followingId, profile.userId));
  const tracks = await db.select().from(tracksTable).where(eq(tracksTable.artistId, profile.id)).limit(20);

  let isFollowedByMe = false;
  if (req.dbUserId) {
    const existing = await db.select().from(followsTable)
      .where(and(eq(followsTable.followerId, req.dbUserId), eq(followsTable.followingId, profile.userId)));
    isFollowedByMe = existing.length > 0;
  }

  res.json({
    ...buildArtistCard(profile, user, Number(count), []),
    bio: profile.bio, languages: profile.languages,
    socialLinks: { instagram: profile.instagramUrl, twitter: profile.twitterUrl, youtube: profile.youtubeUrl, spotify: profile.spotifyUrl, soundcloud: profile.soundcloudUrl, tiktok: profile.tiktokUrl },
    tracks: tracks.map((t) => ({ ...t, artistName: user.displayName, createdAt: t.createdAt.toISOString() })),
    badges: [],
    isFollowedByMe,
  });
});

// GET /artists/:artistId/reviews
router.get("/artists/:artistId/reviews", async (req, res): Promise<void> => {
  const artistId = parseInt(Array.isArray(req.params.artistId) ? req.params.artistId[0] : req.params.artistId, 10);
  const reviews = await db.select().from(reviewsTable)
    .leftJoin(usersTable, eq(reviewsTable.reviewerId, usersTable.id))
    .where(eq(reviewsTable.artistId, artistId))
    .orderBy(sql`${reviewsTable.created_at} desc`);

  res.json(reviews.map(({ reviews: r, users: u }) => ({
    id: r.id, artistId: r.artistId, reviewerId: r.reviewerId,
    reviewerName: u?.displayName || "Anonymous", reviewerAvatarUrl: u?.avatarUrl || null,
    rating: r.rating, comment: r.comment, createdAt: r.createdAt.toISOString(),
  })));
});

// POST /artists/:artistId/reviews
router.post("/artists/:artistId/reviews", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const artistId = parseInt(Array.isArray(req.params.artistId) ? req.params.artistId[0] : req.params.artistId, 10);
  const { rating, comment } = req.body;
  if (!rating || !comment) { res.status(400).json({ error: "Rating and comment required" }); return; }

  const [review] = await db.insert(reviewsTable).values({
    artistId, reviewerId: req.dbUserId!, rating, comment,
  }).returning();

  // Update artist average rating
  const allReviews = await db.select().from(reviewsTable).where(eq(reviewsTable.artistId, artistId));
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await db.update(artistProfilesTable).set({ rating: avgRating, reviewCount: allReviews.length }).where(eq(artistProfilesTable.id, artistId));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.dbUserId!));
  res.status(201).json({
    id: review.id, artistId: review.artistId, reviewerId: review.reviewerId,
    reviewerName: user.displayName, reviewerAvatarUrl: user.avatarUrl,
    rating: review.rating, comment: review.comment, createdAt: review.createdAt.toISOString(),
  });
});

export default router;
