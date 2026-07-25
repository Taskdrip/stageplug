import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import {
  db,
  usersTable,
  followsTable,
  userBadgesTable,
  artistProfilesTable,
} from "@workspace/db";

/** Resolve an artist profile ID → the user ID stored in followsTable.
 *  Returns null when the profile doesn't exist. */
async function resolveArtistUserId(profileId: number): Promise<number | null> {
  const [profile] = await db
    .select({ userId: artistProfilesTable.userId })
    .from(artistProfilesTable)
    .where(eq(artistProfilesTable.id, profileId));
  return profile?.userId ?? null;
}
import { requireAuth, optionalAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

// GET /users/me
router.get("/users/me", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.dbUserId!));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const badges = await db.select().from(userBadgesTable).where(eq(userBadgesTable.userId, user.id));
  const [{ count: followersCount }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followingId, user.id));
  const [{ count: followingCount }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followerId, user.id));

  res.json({
    id: user.id,
    clerkId: user.clerkId,
    role: user.role,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    xp: user.xp,
    level: user.level,
    badges: badges.map((b) => b.badge),
    followersCount: Number(followersCount),
    followingCount: Number(followingCount),
    createdAt: user.createdAt.toISOString(),
  });
});

// PUT /users/me
router.put("/users/me", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const { displayName, bio, avatarUrl, role } = req.body;
  const updates: Record<string, unknown> = {};
  if (displayName) updates.displayName = displayName;
  if (bio !== undefined) updates.bio = bio;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (role) updates.role = role;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.dbUserId!)).returning();
  res.json({ ...user, badges: [], followersCount: 0, followingCount: 0, createdAt: user.createdAt.toISOString() });
});

// GET /users/:userId
router.get("/users/:userId", async (req, res): Promise<void> => {
  const userId = parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId, 10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const badges = await db.select().from(userBadgesTable).where(eq(userBadgesTable.userId, user.id));
  const [{ count: followersCount }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followingId, user.id));
  const [{ count: followingCount }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followerId, user.id));

  res.json({
    id: user.id, clerkId: user.clerkId, role: user.role, displayName: user.displayName,
    avatarUrl: user.avatarUrl, bio: user.bio, xp: user.xp, level: user.level,
    badges: badges.map((b) => b.badge),
    followersCount: Number(followersCount), followingCount: Number(followingCount),
    createdAt: user.createdAt.toISOString(),
  });
});

// POST /users/me/follow/:artistId  (:artistId is the artist PROFILE id)
router.post("/users/me/follow/:artistId", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const profileId = parseInt(Array.isArray(req.params.artistId) ? req.params.artistId[0] : req.params.artistId, 10);
  // Translate profile id → user id (the canonical key stored in followsTable)
  const followingUserId = await resolveArtistUserId(profileId);
  if (!followingUserId) { res.status(404).json({ error: "Artist not found" }); return; }

  const existing = await db.select().from(followsTable)
    .where(and(eq(followsTable.followerId, req.dbUserId!), eq(followsTable.followingId, followingUserId)));
  if (existing.length === 0) {
    await db.insert(followsTable).values({ followerId: req.dbUserId!, followingId: followingUserId });
    // Award XP to the follower
    await db.update(usersTable).set({ xp: sql`${usersTable.xp} + 5` }).where(eq(usersTable.id, req.dbUserId!));
  }
  res.json({ following: true });
});

// DELETE /users/me/follow/:artistId  (:artistId is the artist PROFILE id)
router.delete("/users/me/follow/:artistId", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const profileId = parseInt(Array.isArray(req.params.artistId) ? req.params.artistId[0] : req.params.artistId, 10);
  // Translate profile id → user id
  const followingUserId = await resolveArtistUserId(profileId);
  if (!followingUserId) { res.status(404).json({ error: "Artist not found" }); return; }

  await db.delete(followsTable)
    .where(and(eq(followsTable.followerId, req.dbUserId!), eq(followsTable.followingId, followingUserId)));
  res.json({ following: false });
});

// GET /users/me/following
router.get("/users/me/following", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const follows = await db.select().from(followsTable).where(eq(followsTable.followerId, req.dbUserId!));
  const artistIds = follows.map((f) => f.followingId);
  if (artistIds.length === 0) { res.json([]); return; }

  const artists: unknown[] = [];
  for (const id of artistIds) {
    const [profile] = await db.select().from(artistProfilesTable).where(eq(artistProfilesTable.userId, id));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (profile && user) {
      const [{ count: followersCount }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followingId, id));
      artists.push({
        id: profile.id, displayName: user.displayName, artistType: profile.artistType,
        genres: profile.genres, country: profile.country, city: profile.city,
        coverImageUrl: profile.coverImageUrl, avatarUrl: user.avatarUrl,
        rating: profile.rating, reviewCount: profile.reviewCount,
        followersCount: Number(followersCount), verified: profile.verified === 1,
        xp: user.xp, level: user.level, bookingPrice: profile.bookingPrice,
      });
    }
  }
  res.json(artists);
});

export default router;
