import { Router, type IRouter } from "express";
import { eq, or, sql } from "drizzle-orm";
import { db, bookingsTable, usersTable, artistProfilesTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

async function formatBooking(b: typeof bookingsTable.$inferSelect) {
  const [artistUser] = await db.select().from(usersTable)
    .leftJoin(artistProfilesTable, eq(artistProfilesTable.id, b.artistId))
    .where(eq(artistProfilesTable.id, b.artistId));
  const [clientUser] = await db.select().from(usersTable).where(eq(usersTable.id, b.clientId));

  return {
    id: b.id, artistId: b.artistId,
    artistName: artistUser?.users?.displayName || "Artist",
    artistAvatarUrl: artistUser?.users?.avatarUrl || null,
    clientId: b.clientId, clientName: clientUser?.displayName || "Client",
    eventType: b.eventType, eventDate: b.eventDate.toISOString(),
    location: b.location, budget: b.budget, status: b.status,
    message: b.message, createdAt: b.createdAt.toISOString(),
  };
}

// GET /bookings
router.get("/bookings", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  // Get artist profile id for this user if they are an artist
  const [myProfile] = await db.select().from(artistProfilesTable).where(eq(artistProfilesTable.userId, req.dbUserId!));
  const myArtistId = myProfile?.id;

  let bookings;
  if (myArtistId) {
    bookings = await db.select().from(bookingsTable).where(
      or(eq(bookingsTable.clientId, req.dbUserId!), eq(bookingsTable.artistId, myArtistId))
    ).orderBy(sql`${bookingsTable.created_at} desc`);
  } else {
    bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.clientId, req.dbUserId!))
      .orderBy(sql`${bookingsTable.created_at} desc`);
  }

  const results = await Promise.all(bookings.map(formatBooking));
  res.json(results);
});

// POST /bookings
router.post("/bookings", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const { artistId, eventType, eventDate, location, budget, message } = req.body;
  if (!artistId || !eventType || !eventDate || !location || !budget) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }

  const [booking] = await db.insert(bookingsTable).values({
    artistId, clientId: req.dbUserId!, eventType, eventDate: new Date(eventDate),
    location, budget, message: message || "",
  }).returning();

  res.status(201).json(await formatBooking(booking));
});

// GET /bookings/:bookingId
router.get("/bookings/:bookingId", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const bookingId = parseInt(Array.isArray(req.params.bookingId) ? req.params.bookingId[0] : req.params.bookingId, 10);
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId));
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json(await formatBooking(booking));
});

// PATCH /bookings/:bookingId/status
router.patch("/bookings/:bookingId/status", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const bookingId = parseInt(Array.isArray(req.params.bookingId) ? req.params.bookingId[0] : req.params.bookingId, 10);
  const { status } = req.body;
  if (!status) { res.status(400).json({ error: "Status required" }); return; }

  const [booking] = await db.update(bookingsTable).set({ status }).where(eq(bookingsTable.id, bookingId)).returning();
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json(await formatBooking(booking));
});

export default router;
