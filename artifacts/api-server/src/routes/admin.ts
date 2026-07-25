import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, desc, sql, count, sum } from "drizzle-orm";
import { db, ticketsTable, eventsTable, usersTable, bookingsTable, artistProfilesTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

/* ─── requireAdmin middleware ─────────────────────────── */
function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.dbUserRole !== "admin") {
    res.status(403).json({ error: "Forbidden: admin access required" });
    return;
  }
  next();
}

/* ─── GET /admin/stats ───────────────────────────────── */
router.get("/admin/stats", requireAuth, requireAdmin as any, async (_req, res): Promise<void> => {
  const [ticketStats] = await db
    .select({
      totalTicketsSold: sql<number>`coalesce(sum(${ticketsTable.quantity}), 0)`,
      totalOrders: count(ticketsTable.id),
    })
    .from(ticketsTable);

  const [revenueStats] = await db
    .select({
      totalRevenue: sql<number>`coalesce(sum(${eventsTable.ticketPrice} * ${ticketsTable.quantity}), 0)`,
    })
    .from(ticketsTable)
    .leftJoin(eventsTable, eq(ticketsTable.eventId, eventsTable.id));

  const [bookingStats] = await db
    .select({ totalBookings: count(bookingsTable.id) })
    .from(bookingsTable);

  const [userStats] = await db
    .select({ totalUsers: count(usersTable.id) })
    .from(usersTable);

  const [eventStats] = await db
    .select({ totalEvents: count(eventsTable.id) })
    .from(eventsTable);

  res.json({
    totalTicketsSold: Number(ticketStats.totalTicketsSold),
    totalOrders: Number(ticketStats.totalOrders),
    totalRevenue: Number(revenueStats.totalRevenue),
    totalBookings: Number(bookingStats.totalBookings),
    totalUsers: Number(userStats.totalUsers),
    totalEvents: Number(eventStats.totalEvents),
  });
});

/* ─── GET /admin/tickets ─────────────────────────────── */
router.get("/admin/tickets", requireAuth, requireAdmin as any, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(ticketsTable)
    .leftJoin(eventsTable, eq(ticketsTable.eventId, eventsTable.id))
    .leftJoin(usersTable, eq(ticketsTable.userId, usersTable.id))
    .orderBy(desc(ticketsTable.purchasedAt))
    .limit(500);

  res.json(
    rows.map(({ tickets: t, events: e, users: u }) => ({
      id: t.id,
      eventId: t.eventId,
      eventTitle: e?.title ?? "Unknown Event",
      eventDate: e?.eventDate?.toISOString() ?? null,
      venue: e?.venue ?? null,
      city: e?.city ?? null,
      ticketPrice: e?.ticketPrice ?? 0,
      userId: t.userId,
      buyerName: u?.displayName ?? "Unknown User",
      buyerAvatar: u?.avatarUrl ?? null,
      quantity: t.quantity,
      totalValue: (e?.ticketPrice ?? 0) * t.quantity,
      qrCode: t.qrCode,
      purchasedAt: t.purchasedAt.toISOString(),
    }))
  );
});

/* ─── GET /admin/bookings ────────────────────────────── */
router.get("/admin/bookings", requireAuth, requireAdmin as any, async (_req, res): Promise<void> => {
  const bookings = await db
    .select()
    .from(bookingsTable)
    .orderBy(desc(bookingsTable.createdAt))
    .limit(500);

  const results = await Promise.all(
    bookings.map(async (b) => {
      const [artistRow] = await db
        .select()
        .from(usersTable)
        .leftJoin(artistProfilesTable, eq(artistProfilesTable.userId, usersTable.id))
        .where(eq(artistProfilesTable.id, b.artistId));

      const [clientRow] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, b.clientId));

      return {
        id: b.id,
        artistId: b.artistId,
        artistName: artistRow?.users?.displayName ?? "Artist",
        artistAvatar: artistRow?.users?.avatarUrl ?? null,
        clientId: b.clientId,
        clientName: clientRow?.displayName ?? "Client",
        clientAvatar: clientRow?.avatarUrl ?? null,
        eventType: b.eventType,
        eventDate: b.eventDate.toISOString(),
        location: b.location,
        budget: b.budget,
        status: b.status,
        message: b.message,
        createdAt: b.createdAt.toISOString(),
      };
    })
  );

  res.json(results);
});

/* ─── PATCH /admin/bookings/:id/status ──────────────── */
router.patch("/admin/bookings/:id/status", requireAuth, requireAdmin as any, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body as { status: string };
  if (!status) { res.status(400).json({ error: "Status required" }); return; }

  const [updated] = await db
    .update(bookingsTable)
    .set({ status })
    .where(eq(bookingsTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json({ id: updated.id, status: updated.status });
});

/* ─── PATCH /admin/events/:id/status ────────────────── */
router.patch("/admin/events/:id/status", requireAuth, requireAdmin as any, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body as { status: string };
  if (!status) { res.status(400).json({ error: "Status required" }); return; }

  const [updated] = await db
    .update(eventsTable)
    .set({ status })
    .where(eq(eventsTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Event not found" }); return; }
  res.json({ id: updated.id, status: updated.status });
});

/* ─── GET /admin/users ───────────────────────────────── */
router.get("/admin/users", requireAuth, requireAdmin as any, async (_req, res): Promise<void> => {
  const users = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt))
    .limit(500);

  res.json(
    users.map((u) => ({
      id: u.id,
      clerkId: u.clerkId,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      role: u.role,
      xp: u.xp,
      level: u.level,
      createdAt: u.createdAt.toISOString(),
    }))
  );
});

/* ─── PATCH /admin/users/:id/role ────────────────────── */
router.patch("/admin/users/:id/role", requireAuth, requireAdmin as any, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { role } = req.body as { role: string };
  if (!role) { res.status(400).json({ error: "Role required" }); return; }

  const [updated] = await db
    .update(usersTable)
    .set({ role })
    .where(eq(usersTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ id: updated.id, role: updated.role });
});

export default router;
