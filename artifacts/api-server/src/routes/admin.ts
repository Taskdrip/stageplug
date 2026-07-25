import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, desc, sql, count } from "drizzle-orm";
import {
  db, pool, ticketsTable, eventsTable, usersTable, bookingsTable,
  artistProfilesTable, competitionsTable,
} from "@workspace/db";
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

  const [artistStats] = await db
    .select({ totalArtists: count(artistProfilesTable.id) })
    .from(artistProfilesTable);

  const [compStats] = await db
    .select({ totalCompetitions: count(competitionsTable.id) })
    .from(competitionsTable);

  res.json({
    totalTicketsSold: Number(ticketStats.totalTicketsSold),
    totalOrders: Number(ticketStats.totalOrders),
    totalRevenue: Number(revenueStats.totalRevenue),
    totalBookings: Number(bookingStats.totalBookings),
    totalUsers: Number(userStats.totalUsers),
    totalEvents: Number(eventStats.totalEvents),
    totalArtists: Number(artistStats.totalArtists),
    totalCompetitions: Number(compStats.totalCompetitions),
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

/* ─── GET /admin/events ──────────────────────────────── */
router.get("/admin/events", requireAuth, requireAdmin as any, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(eventsTable)
    .leftJoin(usersTable, eq(eventsTable.organizerId, usersTable.id))
    .orderBy(desc(eventsTable.createdAt))
    .limit(500);

  res.json(rows.map(({ events: e, users: u }) => ({
    id: e.id,
    organizerId: e.organizerId,
    organizerName: u?.displayName ?? "Unknown",
    title: e.title,
    description: e.description,
    venue: e.venue,
    city: e.city,
    country: e.country,
    eventDate: e.eventDate.toISOString(),
    ticketPrice: e.ticketPrice,
    totalTickets: e.totalTickets,
    soldTickets: e.soldTickets,
    coverImageUrl: e.coverImageUrl,
    status: e.status,
    featured: e.featured === 1,
    createdAt: e.createdAt.toISOString(),
  })));
});

/* ─── PATCH /admin/events/:id ────────────────────────── */
router.patch("/admin/events/:id", requireAuth, requireAdmin as any, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { title, description, venue, city, country, eventDate, ticketPrice, totalTickets, coverImageUrl, status, featured } = req.body;

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (venue !== undefined) updates.venue = venue;
  if (city !== undefined) updates.city = city;
  if (country !== undefined) updates.country = country;
  if (eventDate !== undefined) updates.eventDate = new Date(eventDate);
  if (ticketPrice !== undefined) updates.ticketPrice = Number(ticketPrice);
  if (totalTickets !== undefined) updates.totalTickets = Number(totalTickets);
  if (coverImageUrl !== undefined) updates.coverImageUrl = coverImageUrl;
  if (status !== undefined) updates.status = status;
  if (featured !== undefined) updates.featured = featured ? 1 : 0;

  const [updated] = await db.update(eventsTable).set(updates).where(eq(eventsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Event not found" }); return; }

  res.json({
    id: updated.id, title: updated.title, description: updated.description,
    venue: updated.venue, city: updated.city, country: updated.country,
    eventDate: updated.eventDate.toISOString(), ticketPrice: updated.ticketPrice,
    totalTickets: updated.totalTickets, soldTickets: updated.soldTickets,
    coverImageUrl: updated.coverImageUrl, status: updated.status,
    featured: updated.featured === 1,
  });
});

/* ─── DELETE /admin/events/:id ───────────────────────── */
router.delete("/admin/events/:id", requireAuth, requireAdmin as any, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const [deleted] = await db.delete(eventsTable).where(eq(eventsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Event not found" }); return; }
  res.json({ success: true });
});

/* ─── GET /admin/artists ─────────────────────────────── */
router.get("/admin/artists", requireAuth, requireAdmin as any, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(artistProfilesTable)
    .leftJoin(usersTable, eq(artistProfilesTable.userId, usersTable.id))
    .orderBy(desc(artistProfilesTable.createdAt))
    .limit(500);

  res.json(rows.map(({ artist_profiles: p, users: u }) => ({
    id: p.id,
    userId: p.userId,
    displayName: u?.displayName ?? "Unknown",
    avatarUrl: u?.avatarUrl ?? null,
    artistType: p.artistType,
    genres: p.genres,
    country: p.country,
    city: p.city,
    bio: p.bio,
    coverImageUrl: p.coverImageUrl,
    bookingPrice: p.bookingPrice,
    rating: p.rating,
    reviewCount: p.reviewCount,
    verified: p.verified === 1,
    createdAt: p.createdAt.toISOString(),
  })));
});

/* ─── PATCH /admin/artists/:id ───────────────────────── */
router.patch("/admin/artists/:id", requireAuth, requireAdmin as any, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { artistType, genres, country, city, bio, coverImageUrl, bookingPrice, verified, displayName } = req.body;

  const profileUpdates: Record<string, unknown> = {};
  if (artistType !== undefined) profileUpdates.artistType = artistType;
  if (genres !== undefined) profileUpdates.genres = genres;
  if (country !== undefined) profileUpdates.country = country;
  if (city !== undefined) profileUpdates.city = city;
  if (bio !== undefined) profileUpdates.bio = bio;
  if (coverImageUrl !== undefined) profileUpdates.coverImageUrl = coverImageUrl;
  if (bookingPrice !== undefined) profileUpdates.bookingPrice = Number(bookingPrice);
  if (verified !== undefined) profileUpdates.verified = verified ? 1 : 0;

  const [updatedProfile] = await db
    .update(artistProfilesTable)
    .set(profileUpdates)
    .where(eq(artistProfilesTable.id, id))
    .returning();

  if (!updatedProfile) { res.status(404).json({ error: "Artist not found" }); return; }

  // Optionally update display name on the user record
  if (displayName) {
    await db.update(usersTable).set({ displayName }).where(eq(usersTable.id, updatedProfile.userId));
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updatedProfile.userId));
  res.json({
    id: updatedProfile.id,
    userId: updatedProfile.userId,
    displayName: user?.displayName ?? "Unknown",
    artistType: updatedProfile.artistType,
    genres: updatedProfile.genres,
    country: updatedProfile.country,
    city: updatedProfile.city,
    bio: updatedProfile.bio,
    bookingPrice: updatedProfile.bookingPrice,
    verified: updatedProfile.verified === 1,
  });
});

/* ─── GET /admin/competitions ────────────────────────── */
router.get("/admin/competitions", requireAuth, requireAdmin as any, async (_req, res): Promise<void> => {
  const comps = await db
    .select()
    .from(competitionsTable)
    .orderBy(desc(competitionsTable.createdAt))
    .limit(500);

  res.json(comps.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    description: c.description,
    coverImageUrl: c.coverImageUrl,
    status: c.status,
    prizePool: c.prizePool,
    endsAt: c.endsAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
  })));
});

/* ─── PATCH /admin/competitions/:id ─────────────────── */
router.patch("/admin/competitions/:id", requireAuth, requireAdmin as any, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { title, category, description, coverImageUrl, status, prizePool, endsAt } = req.body;

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (category !== undefined) updates.category = category;
  if (description !== undefined) updates.description = description;
  if (coverImageUrl !== undefined) updates.coverImageUrl = coverImageUrl;
  if (status !== undefined) updates.status = status;
  if (prizePool !== undefined) updates.prizePool = Number(prizePool);
  if (endsAt !== undefined) updates.endsAt = new Date(endsAt);

  const [updated] = await db.update(competitionsTable).set(updates).where(eq(competitionsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Competition not found" }); return; }

  res.json({
    id: updated.id, title: updated.title, category: updated.category,
    description: updated.description, status: updated.status,
    prizePool: updated.prizePool, endsAt: updated.endsAt.toISOString(),
  });
});

/* ─── DELETE /admin/competitions/:id ────────────────── */
router.delete("/admin/competitions/:id", requireAuth, requireAdmin as any, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const [deleted] = await db.delete(competitionsTable).where(eq(competitionsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Competition not found" }); return; }
  res.json({ success: true });
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

/* ─── POST /admin/seed ───────────────────────────────── */
router.post("/admin/seed", requireAuth, requireAdmin as any, async (_req, res): Promise<void> => {
  try {
    const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const GENRES = ["Afrobeats","Hip-Hop","R&B","Amapiano","House","Drill","Jazz","Pop","Electronic","Gospel"];
    const COUNTRIES = ["Nigeria","Ghana","South Africa","Kenya","UK","USA","France","Brazil"];
    const CITIES: Record<string, string[]> = {
      Nigeria: ["Lagos","Abuja","Port Harcourt"], Ghana: ["Accra","Kumasi"],
      "South Africa": ["Johannesburg","Cape Town","Durban"], Kenya: ["Nairobi","Mombasa"],
      UK: ["London","Manchester","Birmingham"], USA: ["New York","Los Angeles","Atlanta","Chicago"],
      France: ["Paris","Lyon"], Brazil: ["São Paulo","Rio de Janeiro"],
    };
    const UNSPLASH_ARTISTS = [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
      "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=400&q=80",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80",
      "https://images.unsplash.com/photo-1452723312111-3a7d0db0e4c5?w=400&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80",
      "https://images.unsplash.com/photo-1468359601543-843bfaef291a?w=400&q=80",
      "https://images.unsplash.com/photo-1547956283-5c9e47e61dc5?w=400&q=80",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80",
      "https://images.unsplash.com/photo-1520052205864-92d242b3a76b?w=400&q=80",
      "https://images.unsplash.com/photo-1550051997-6f06b11a3c96?w=400&q=80",
      "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=400&q=80",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    ];
    const COVERS = [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
    ];
    const EVENT_COVERS = [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80",
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
    ];

    const artistDefs = [
      { name: "Zara Pulse", type: "Singer" }, { name: "DJ Krome", type: "DJ" },
      { name: "Kwame Nova", type: "Rapper" }, { name: "Sola Beats", type: "Producer" },
      { name: "Amara Sky", type: "Singer" }, { name: "Luca D'Amico", type: "DJ" },
      { name: "TJ Highgrade", type: "MC" }, { name: "Yemi Waves", type: "Singer" },
      { name: "Phantom Sound", type: "Producer" }, { name: "Nadia Volt", type: "Rapper" },
      { name: "Kofi Riddim", type: "Instrumentalist" }, { name: "Aisha Luxe", type: "Singer" },
      { name: "Dre Konnect", type: "Rapper" }, { name: "Selene Groove", type: "Singer" },
      { name: "Marco Techno", type: "DJ" }, { name: "Blessing MC", type: "MC" },
    ];
    const bios = [
      "Born in the crossroads of soul and innovation, I've been crafting sounds that move people since I picked up my first mic.",
      "From underground clubs to festival mainstages, every set I play is a journey. I live for the moment the crowd becomes one entity.",
      "My production style is a fusion of traditional African rhythms and modern electronic textures. I've worked with artists across 12 countries.",
      "Hip-hop is my language. I use it to tell stories from the streets that shaped me.",
      "Every performance is a spiritual experience. I channel energy from the crowd and send it back amplified.",
      "Genre boundaries mean nothing to me. I pull from jazz, electronic, and traditional Afro sounds.",
    ];
    const trackSets = [
      ["Midnight Rush","Golden Hour","City Lights"],
      ["Bass Awakening","Deep Circuit","Neon Dreams"],
      ["Street Philosophy","No Filter","Raw Seasons"],
      ["Summer Riddim","Afro State","Continental Drift"],
      ["Soul Protocol","Inner Frequency","Elevation"],
      ["Pulse Wave","Infinite Loop","Static Dreams"],
    ];

    // Clean up previous seed data
    await pool.query(`DELETE FROM tracks WHERE artist_id IN (SELECT id FROM artist_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id LIKE 'seed_%'))`);
    await pool.query(`DELETE FROM artist_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id LIKE 'seed_%')`);
    await pool.query(`DELETE FROM users WHERE clerk_id LIKE 'seed_%'`);
    await pool.query(`DELETE FROM events WHERE title LIKE '[seed]%'`);
    await pool.query(`DELETE FROM competitions WHERE title LIKE '[seed]%'`);
    await pool.query(`DELETE FROM posts WHERE content LIKE '[seed]%'`);

    const insertedUserIds: number[] = [];
    const insertedProfileIds: number[] = [];

    for (let i = 0; i < artistDefs.length; i++) {
      const artist = artistDefs[i];
      const country = pick(COUNTRIES);
      const city = pick(CITIES[country]);
      const shuffled = [...GENRES].sort(() => Math.random() - 0.5);
      const genres = shuffled.slice(0, rand(1, 3));

      const userRes = await pool.query(
        `INSERT INTO users (clerk_id, role, display_name, avatar_url, bio, xp, level) VALUES ($1,'artist',$2,$3,$4,$5,$6) RETURNING id`,
        [`seed_${i + 1}_${Date.now()}`, artist.name, UNSPLASH_ARTISTS[i % UNSPLASH_ARTISTS.length], pick(bios), rand(200, 8000), rand(2, 15)]
      );
      const userId = userRes.rows[0].id;
      insertedUserIds.push(userId);

      const profileRes = await pool.query(
        `INSERT INTO artist_profiles (user_id, artist_type, genres, languages, country, city, bio, cover_image_url, booking_price, rating, review_count, verified, instagram_url, twitter_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
        [userId, artist.type, genres, ["English"], country, city, pick(bios), COVERS[i % COVERS.length],
          rand(300, 10000), parseFloat((rand(35, 50) / 10).toFixed(1)), rand(2, 80), rand(0, 1),
          `https://instagram.com/${artist.name.toLowerCase().replace(/[\s']/g, "")}`,
          `https://twitter.com/${artist.name.toLowerCase().replace(/[\s']/g, "")}`]
      );
      const profileId = profileRes.rows[0].id;
      insertedProfileIds.push(profileId);

      const titles = trackSets[i % trackSets.length];
      for (const title of titles) {
        await pool.query(
          `INSERT INTO tracks (artist_id, title, genre, track_type, duration_seconds, cover_url, audio_url, plays, likes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [profileId, title, pick(genres), pick(["single","album_track","ep_track"]), rand(120, 280), pick(COVERS),
            "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3", rand(500, 500000), rand(50, 50000)]
        );
      }
    }

    const organizerId = insertedUserIds[0];
    const eventData = [
      { title: "Afrofest Lagos 2025", venue: "Eko Convention Centre", city: "Lagos", country: "Nigeria" },
      { title: "Global Bass Summit", venue: "The O2 Arena", city: "London", country: "UK" },
      { title: "Joburg Sound Festival", venue: "FNB Stadium", city: "Johannesburg", country: "South Africa" },
      { title: "Accra Music Week", venue: "National Theatre", city: "Accra", country: "Ghana" },
      { title: "NYC Underground Showcase", venue: "Brooklyn Steel", city: "New York", country: "USA" },
      { title: "Paris Electronic Night", venue: "Rex Club", city: "Paris", country: "France" },
      { title: "Nairobi Jazz Festival", venue: "Uhuru Gardens", city: "Nairobi", country: "Kenya" },
      { title: "Atlanta Gospel Explosion", venue: "State Farm Arena", city: "Atlanta", country: "USA" },
    ];

    for (let i = 0; i < eventData.length; i++) {
      const e = eventData[i];
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + rand(7, 120));
      await pool.query(
        `INSERT INTO events (organizer_id, title, description, venue, city, country, event_date, ticket_price, total_tickets, sold_tickets, cover_image_url, status, featured) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'upcoming',$12)`,
        [organizerId, `[seed]${e.title}`,
          `${e.title} brings together the world's finest artists for an unforgettable night of live music, cultural celebration, and community.`,
          e.venue, e.city, e.country, eventDate, rand(20, 500), rand(500, 50000), rand(100, 10000),
          EVENT_COVERS[i % EVENT_COVERS.length], i < 3 ? 1 : 0]
      );
    }

    const compData = [
      { title: "Best New Artist 2025", category: "Singer", prize: 25000 },
      { title: "Producer of the Year", category: "Producer", prize: 15000 },
      { title: "DJ Battle Championship", category: "DJ", prize: 10000 },
      { title: "Freestyle Rap Crown", category: "Rapper", prize: 5000 },
    ];
    for (let i = 0; i < compData.length; i++) {
      const c = compData[i];
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + rand(14, 60));
      await pool.query(
        `INSERT INTO competitions (title, category, description, cover_image_url, status, prize_pool, ends_at) VALUES ($1,$2,$3,$4,'open',$5,$6)`,
        [`[seed]${c.title}`, c.category,
          `Compete against the world's best ${c.category.toLowerCase()}s for a chance to win $${c.prize.toLocaleString()} and global recognition.`,
          EVENT_COVERS[i % EVENT_COVERS.length], c.prize, endsAt]
      );
    }

    const postContents = [
      "[seed]Just dropped my new single 'Midnight Rush' — stream it everywhere! 🔥",
      "[seed]Big announcement! Headlining AfroFest Lagos this year 🎤",
      "[seed]Studio session 2am vibes 🎹 Working on something that's going to change the game.",
      "[seed]Grateful for 100k followers! 💜 Every stream, every share, every kind word has kept me going.",
      "[seed]Performing at my first international festival next month 🌍",
      "[seed]New beat pack dropping Friday — 50 fire instrumentals for your next project 🔊",
    ];
    for (let i = 0; i < postContents.length; i++) {
      await pool.query(
        `INSERT INTO posts (author_id, content, post_type, likes, comments_count) VALUES ($1,$2,'text',$3,$4)`,
        [insertedUserIds[i % insertedUserIds.length], postContents[i], rand(10, 5000), rand(2, 300)]
      );
    }

    res.json({
      success: true,
      seeded: {
        artists: artistDefs.length,
        events: eventData.length,
        competitions: compData.length,
        posts: postContents.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Seed failed" });
  }
});

/* ─── DELETE /admin/seed ─────────────────────────────── */
router.delete("/admin/seed", requireAuth, requireAdmin as any, async (_req, res): Promise<void> => {
  try {
    await pool.query(`DELETE FROM tracks WHERE artist_id IN (SELECT id FROM artist_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id LIKE 'seed_%'))`);
    await pool.query(`DELETE FROM artist_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id LIKE 'seed_%')`);
    await pool.query(`DELETE FROM users WHERE clerk_id LIKE 'seed_%'`);
    await pool.query(`DELETE FROM events WHERE title LIKE '[seed]%'`);
    await pool.query(`DELETE FROM competitions WHERE title LIKE '[seed]%'`);
    await pool.query(`DELETE FROM posts WHERE content LIKE '[seed]%'`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Clear failed" });
  }
});

export default router;
