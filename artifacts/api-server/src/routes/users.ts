import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import {
  db,
  usersTable,
  followsTable,
  userBadgesTable,
  artistProfilesTable,
} from "@workspace/db";
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

// POST /users/me/follow/:artistId
router.post("/users/me/follow/:artistId", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const artistId = parseInt(Array.isArray(req.params.artistId) ? req.params.artistId[0] : req.params.artistId, 10);
  // Check if already following
  const existing = await db.select().from(followsTable)
    .where(eq(followsTable.followerId, req.dbUserId!));
  const alreadyFollowing = existing.find((f) => f.followingId === artistId);
  if (!alreadyFollowing) {
    await db.insert(followsTable).values({ followerId: req.dbUserId!, followingId: artistId });
    // Award XP
    await db.update(usersTable).set({ xp: sql`${usersTable.xp} + 5` }).where(eq(usersTable.id, req.dbUserId!));
  }
  res.json({ following: true });
});

// DELETE /users/me/follow/:artistId
router.delete("/users/me/follow/:artistId", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const artistId = parseInt(Array.isArray(req.params.artistId) ? req.params.artistId[0] : req.params.artistId, 10);
  await db.delete(followsTable)
    .where(eq(followsTable.followerId, req.dbUserId!));
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
