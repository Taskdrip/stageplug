import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import {
  db, usersTable, artistProfilesTable, tracksTable, bookingsTable,
  followsTable, notificationsTable, eventsTable, userBadgesTable,
} from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

// GET /dashboard/artist
router.get("/dashboard/artist", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const [profile] = await db.select().from(artistProfilesTable).where(eq(artistProfilesTable.userId, req.dbUserId!));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.dbUserId!));

  const artistId = profile?.id;
  const [{ count: followersCount }] = await db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followingId, req.dbUserId!));

  let totalTracks = 0, totalPlays = 0, totalBookings = 0, pendingBookings = 0;

  if (artistId) {
    const [{ count: tc }] = await db.select({ count: sql<number>`count(*)` }).from(tracksTable).where(eq(tracksTable.artistId, artistId));
    const [{ sum: plays }] = await db.select({ sum: sql<number>`coalesce(sum(plays), 0)` }).from(tracksTable).where(eq(tracksTable.artistId, artistId));
    const [{ count: bc }] = await db.select({ count: sql<number>`count(*)` }).from(bookingsTable).where(eq(bookingsTable.artistId, artistId));
    const [{ count: pc }] = await db.select({ count: sql<number>`count(*)` }).from(bookingsTable).where(eq(bookingsTable.artistId, artistId));
    totalTracks = Number(tc);
    totalPlays = Number(plays);
    totalBookings = Number(bc);
    pendingBookings = Number(pc);
  }

  const recentBookings = artistId
    ? (await db.select().from(bookingsTable).where(eq(bookingsTable.artistId, artistId)).orderBy(sql`${bookingsTable.created_at} desc`).limit(5)).map((b) => ({
        id: b.id, artistId: b.artistId, artistName: user.displayName, artistAvatarUrl: user.avatarUrl,
        clientId: b.clientId, clientName: "Client", eventType: b.eventType,
        eventDate: b.eventDate.toISOString(), location: b.location, budget: b.budget,
        status: b.status, message: b.message, createdAt: b.createdAt.toISOString(),
      }))
    : [];

  const recentNotifications = (await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, req.dbUserId!))
    .orderBy(sql`${notificationsTable.created_at} desc`).limit(5)
  ).map((n) => ({
    id: n.id, userId: n.userId, type: n.type, title: n.title, message: n.message,
    read: n.read === 1, referenceId: n.referenceId, referenceType: n.referenceType,
    createdAt: n.createdAt.toISOString(),
  }));

  const badges = await db.select().from(userBadgesTable).where(eq(userBadgesTable.userId, req.dbUserId!));

  res.json({
    totalEarnings: 0,
    totalBookings,
    pendingBookings,
    totalFollowers: Number(followersCount),
    totalTracks,
    totalPlays,
    xp: user.xp,
    level: user.level,
    badges: badges.map((b) => b.badge),
    recentBookings,
    recentNotifications,
  });
});

// GET /dashboard/platform-stats
router.get("/dashboard/platform-stats", async (_req, res): Promise<void> => {
  const [{ count: totalArtists }] = await db.select({ count: sql<number>`count(*)` }).from(artistProfilesTable);
  const [{ count: totalFans }] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "fan"));
  const [{ count: totalEvents }] = await db.select({ count: sql<number>`count(*)` }).from(eventsTable);
  const [{ count: totalBookings }] = await db.select({ count: sql<number>`count(*)` }).from(bookingsTable);
  const [{ count: totalTracks }] = await db.select({ count: sql<number>`count(*)` }).from(tracksTable);

  res.json({
    totalArtists: Number(totalArtists),
    totalFans: Number(totalFans),
    totalEvents: Number(totalEvents),
    totalBookings: Number(totalBookings),
    totalTracks: Number(totalTracks),
  });
});

// GET /dashboard/leaderboard
router.get("/dashboard/leaderboard", async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable)
    .orderBy(sql`${usersTable.xp} desc`)
    .limit(20);

  const result = await Promise.all(users.map(async (u, idx) => {
    const badges = await db.select().from(userBadgesTable).where(eq(userBadgesTable.userId, u.id));
    return {
      rank: idx + 1,
      userId: u.id,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      xp: u.xp,
      level: u.level,
      role: u.role,
      badges: badges.map((b) => b.badge),
    };
  }));

  res.json(result);
});

export default router;
