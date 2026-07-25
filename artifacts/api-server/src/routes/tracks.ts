import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, tracksTable, artistProfilesTable, usersTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

// GET /tracks
router.get("/tracks", async (req, res): Promise<void> => {
  const { genre, type, artistId, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page, 10);
  const limitNum = Math.min(parseInt(limit, 10), 50);
  const offset = (pageNum - 1) * limitNum;

  let tracks = await db.select().from(tracksTable)
    .leftJoin(artistProfilesTable, eq(tracksTable.artistId, artistProfilesTable.id))
    .leftJoin(usersTable, eq(artistProfilesTable.userId, usersTable.id))
    .orderBy(sql`${tracksTable.plays} desc`)
    .limit(limitNum).offset(offset);

  if (genre) tracks = tracks.filter(({ tracks: t }) => t.genre.toLowerCase().includes(genre.toLowerCase()));
  if (type) tracks = tracks.filter(({ tracks: t }) => t.trackType === type);
  if (artistId) tracks = tracks.filter(({ tracks: t }) => t.artistId === parseInt(artistId, 10));

  res.json(tracks.map(({ tracks: t, users: u }) => ({
    ...t, artistName: u?.displayName || "Unknown", createdAt: t.createdAt.toISOString(),
  })));
});

// POST /tracks
router.post("/tracks", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const { title, genre, trackType, durationSeconds, coverUrl, audioUrl, price } = req.body;
  if (!title || !genre) { res.status(400).json({ error: "Title and genre required" }); return; }

  // Find artist profile
  const [profile] = await db.select().from(artistProfilesTable).where(eq(artistProfilesTable.userId, req.dbUserId!));
  if (!profile) { res.status(400).json({ error: "Artist profile required" }); return; }

  const [track] = await db.insert(tracksTable).values({
    artistId: profile.id, title, genre, trackType: trackType || "single",
    durationSeconds: durationSeconds || 0, coverUrl: coverUrl || "", audioUrl, price,
  }).returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.dbUserId!));
  res.status(201).json({ ...track, artistName: user.displayName, createdAt: track.createdAt.toISOString() });
});

// GET /tracks/:trackId
router.get("/tracks/:trackId", async (req, res): Promise<void> => {
  const trackId = parseInt(Array.isArray(req.params.trackId) ? req.params.trackId[0] : req.params.trackId, 10);
  const [row] = await db.select().from(tracksTable)
    .leftJoin(artistProfilesTable, eq(tracksTable.artistId, artistProfilesTable.id))
    .leftJoin(usersTable, eq(artistProfilesTable.userId, usersTable.id))
    .where(eq(tracksTable.id, trackId));

  if (!row) { res.status(404).json({ error: "Track not found" }); return; }
  res.json({ ...row.tracks, artistName: row.users?.displayName || "Unknown", createdAt: row.tracks.createdAt.toISOString() });
});

// DELETE /tracks/:trackId
router.delete("/tracks/:trackId", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const trackId = parseInt(Array.isArray(req.params.trackId) ? req.params.trackId[0] : req.params.trackId, 10);
  await db.delete(tracksTable).where(eq(tracksTable.id, trackId));
  res.sendStatus(204);
});

export default router;
