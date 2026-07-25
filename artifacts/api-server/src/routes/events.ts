import { Router, type IRouter } from "express";
import { eq, sql, gt } from "drizzle-orm";
import { db, eventsTable, ticketsTable, usersTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";
import crypto from "crypto";

const router: IRouter = Router();

function formatEvent(e: typeof eventsTable.$inferSelect, organizerName = "Organizer") {
  return {
    id: e.id, organizerId: e.organizerId, organizerName,
    title: e.title, description: e.description, venue: e.venue,
    city: e.city, country: e.country,
    eventDate: e.eventDate.toISOString(), ticketPrice: e.ticketPrice,
    totalTickets: e.totalTickets, soldTickets: e.soldTickets,
    coverImageUrl: e.coverImageUrl, status: e.status,
    featured: e.featured === 1, artists: [],
    createdAt: e.createdAt.toISOString(),
  };
}

// GET /events
router.get("/events", async (req, res): Promise<void> => {
  const { city, country, upcoming, page = "1", limit = "20" } = req.query as Record<string, string>;
  let events = await db.select().from(eventsTable)
    .leftJoin(usersTable, eq(eventsTable.organizerId, usersTable.id))
    .orderBy(sql`${eventsTable.event_date} asc`).limit(50);

  let filtered = events;
  if (city) filtered = filtered.filter(({ events: e }) => e.city.toLowerCase().includes(city.toLowerCase()));
  if (country) filtered = filtered.filter(({ events: e }) => e.country.toLowerCase().includes(country.toLowerCase()));
  if (upcoming === "true") filtered = filtered.filter(({ events: e }) => e.status === "upcoming");

  res.json(filtered.map(({ events: e, users: u }) => formatEvent(e, u?.displayName)));
});

// GET /events/featured
router.get("/events/featured", async (_req, res): Promise<void> => {
  const events = await db.select().from(eventsTable)
    .leftJoin(usersTable, eq(eventsTable.organizerId, usersTable.id))
    .where(eq(eventsTable.featured, 1)).limit(6);
  res.json(events.map(({ events: e, users: u }) => formatEvent(e, u?.displayName)));
});

// GET /events/upcoming
router.get("/events/upcoming", async (_req, res): Promise<void> => {
  const now = new Date();
  const events = await db.select().from(eventsTable)
    .leftJoin(usersTable, eq(eventsTable.organizerId, usersTable.id))
    .where(eq(eventsTable.status, "upcoming"))
    .orderBy(sql`${eventsTable.event_date} asc`).limit(10);
  res.json(events.map(({ events: e, users: u }) => formatEvent(e, u?.displayName)));
});

// POST /events
router.post("/events", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const { title, description, venue, city, country, eventDate, ticketPrice, totalTickets, coverImageUrl } = req.body;
  if (!title || !venue || !city || !country || !eventDate) { res.status(400).json({ error: "Missing required fields" }); return; }

  const [event] = await db.insert(eventsTable).values({
    organizerId: req.dbUserId!, title, description: description || "", venue, city, country,
    eventDate: new Date(eventDate), ticketPrice: ticketPrice || 0,
    totalTickets: totalTickets || 100, coverImageUrl: coverImageUrl || "",
  }).returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.dbUserId!));
  res.status(201).json(formatEvent(event, user.displayName));
});

// GET /events/:eventId
router.get("/events/:eventId", async (req, res): Promise<void> => {
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  const [row] = await db.select().from(eventsTable)
    .leftJoin(usersTable, eq(eventsTable.organizerId, usersTable.id))
    .where(eq(eventsTable.id, eventId));
  if (!row) { res.status(404).json({ error: "Event not found" }); return; }
  res.json(formatEvent(row.events, row.users?.displayName));
});

// POST /events/:eventId/buy-ticket
router.post("/events/:eventId/buy-ticket", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  const { quantity = 1 } = req.body;

  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));
  if (!event) { res.status(404).json({ error: "Event not found" }); return; }
  if (event.soldTickets + quantity > event.totalTickets) { res.status(400).json({ error: "Not enough tickets" }); return; }

  await db.update(eventsTable).set({ soldTickets: event.soldTickets + quantity }).where(eq(eventsTable.id, eventId));
  const qrCode = crypto.randomBytes(16).toString("hex");

  const [ticket] = await db.insert(ticketsTable).values({
    eventId, userId: req.dbUserId!, quantity, qrCode,
  }).returning();

  res.status(201).json({ id: ticket.id, eventId: ticket.eventId, userId: ticket.userId, qrCode: ticket.qrCode, purchasedAt: ticket.purchasedAt.toISOString() });
});

export default router;
