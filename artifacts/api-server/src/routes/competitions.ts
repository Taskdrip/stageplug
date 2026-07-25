import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, competitionsTable, competitionEntriesTable, competitionVotesTable, usersTable, artistProfilesTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

async function getTopEntries(competitionId: number, limit = 10) {
  const entries = await db.select().from(competitionEntriesTable)
    .leftJoin(usersTable, eq(competitionEntriesTable.artistId, usersTable.id))
    .where(eq(competitionEntriesTable.competitionId, competitionId))
    .orderBy(desc(competitionEntriesTable.votes))
    .limit(limit);

  return entries.map(({ competition_entries: e, users: u }, idx) => ({
    id: e.id, competitionId: e.competitionId, artistId: e.artistId,
    artistName: u?.displayName || "Artist", artistAvatarUrl: u?.avatarUrl || null,
    submissionUrl: e.submissionUrl, votes: e.votes, rank: idx + 1,
  }));
}

// GET /competitions
router.get("/competitions", async (_req, res): Promise<void> => {
  const competitions = await db.select().from(competitionsTable)
    .orderBy(desc(competitionsTable.createdAt));

  const result = await Promise.all(competitions.map(async (c) => {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(competitionEntriesTable).where(eq(competitionEntriesTable.competitionId, c.id));
    const topEntries = await getTopEntries(c.id, 3);
    return {
      id: c.id, title: c.title, category: c.category, description: c.description,
      coverImageUrl: c.coverImageUrl, status: c.status, prizePool: c.prizePool,
      endsAt: c.endsAt.toISOString(), entriesCount: Number(count),
      topEntries, createdAt: c.createdAt.toISOString(),
    };
  }));

  res.json(result);
});

// GET /competitions/:competitionId
router.get("/competitions/:competitionId", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const competitionId = parseInt(Array.isArray(req.params.competitionId) ? req.params.competitionId[0] : req.params.competitionId, 10);
  const [c] = await db.select().from(competitionsTable).where(eq(competitionsTable.id, competitionId));
  if (!c) { res.status(404).json({ error: "Competition not found" }); return; }

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(competitionEntriesTable).where(eq(competitionEntriesTable.competitionId, c.id));
  const topEntries = await getTopEntries(c.id);

  // Check if current user has an entry
  const [myEntryRow] = await db.select().from(competitionEntriesTable)
    .where(eq(competitionEntriesTable.competitionId, competitionId));
  const myEntry = myEntryRow ? {
    id: myEntryRow.id, competitionId: myEntryRow.competitionId,
    artistId: myEntryRow.artistId, artistName: "", artistAvatarUrl: null,
    submissionUrl: myEntryRow.submissionUrl, votes: myEntryRow.votes, rank: null,
  } : undefined;

  res.json({
    id: c.id, title: c.title, category: c.category, description: c.description,
    coverImageUrl: c.coverImageUrl, status: c.status, prizePool: c.prizePool,
    endsAt: c.endsAt.toISOString(), entriesCount: Number(count),
    myEntry, topEntries, createdAt: c.createdAt.toISOString(),
  });
});

// POST /competitions/:competitionId/enter
router.post("/competitions/:competitionId/enter", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const competitionId = parseInt(Array.isArray(req.params.competitionId) ? req.params.competitionId[0] : req.params.competitionId, 10);

  const [existing] = await db.select().from(competitionEntriesTable)
    .where(eq(competitionEntriesTable.competitionId, competitionId));
  if (existing) { res.json({ id: existing.id, competitionId: existing.competitionId, artistId: existing.artistId, artistName: "", artistAvatarUrl: null, submissionUrl: existing.submissionUrl, votes: existing.votes, rank: null }); return; }

  const [entry] = await db.insert(competitionEntriesTable).values({
    competitionId, artistId: req.dbUserId!, votes: 0,
  }).returning();

  res.json({ id: entry.id, competitionId: entry.competitionId, artistId: entry.artistId, artistName: "", artistAvatarUrl: null, submissionUrl: entry.submissionUrl, votes: entry.votes, rank: null });
});

// POST /competitions/:competitionId/vote/:entryId
router.post("/competitions/:competitionId/vote/:entryId", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const entryId = parseInt(Array.isArray(req.params.entryId) ? req.params.entryId[0] : req.params.entryId, 10);

  const [existing] = await db.select().from(competitionVotesTable)
    .where(eq(competitionVotesTable.entryId, entryId));

  if (existing) {
    await db.delete(competitionVotesTable).where(eq(competitionVotesTable.id, existing.id));
    const [entry] = await db.update(competitionEntriesTable).set({ votes: sql`${competitionEntriesTable.votes} - 1` }).where(eq(competitionEntriesTable.id, entryId)).returning();
    res.json({ voted: false, votes: entry.votes });
  } else {
    await db.insert(competitionVotesTable).values({ entryId, userId: req.dbUserId! });
    const [entry] = await db.update(competitionEntriesTable).set({ votes: sql`${competitionEntriesTable.votes} + 1` }).where(eq(competitionEntriesTable.id, entryId)).returning();
    res.json({ voted: true, votes: entry.votes });
  }
});

export default router;
