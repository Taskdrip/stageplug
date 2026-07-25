/**
 * Database seed script – populates StageLink with realistic sample data.
 * Run with:  pnpm tsx scripts/seed.ts
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// ─── helpers ──────────────────────────────────────────────────────────────────
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── data ─────────────────────────────────────────────────────────────────────
const GENRES = ["Afrobeats", "Hip-Hop", "R&B", "Amapiano", "House", "Drill", "Jazz", "Pop", "Electronic", "Gospel"];
const COUNTRIES = ["Nigeria", "Ghana", "South Africa", "Kenya", "UK", "USA", "France", "Brazil"];
const CITIES: Record<string, string[]> = {
  Nigeria: ["Lagos", "Abuja", "Port Harcourt"],
  Ghana: ["Accra", "Kumasi"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban"],
  Kenya: ["Nairobi", "Mombasa"],
  UK: ["London", "Manchester", "Birmingham"],
  USA: ["New York", "Los Angeles", "Atlanta", "Chicago"],
  France: ["Paris", "Lyon"],
  Brazil: ["São Paulo", "Rio de Janeiro"],
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
  { name: "Zara Pulse",       type: "Singer"          },
  { name: "DJ Krome",         type: "DJ"              },
  { name: "Kwame Nova",       type: "Rapper"          },
  { name: "Sola Beats",       type: "Producer"        },
  { name: "Amara Sky",        type: "Singer"          },
  { name: "Luca D'Amico",     type: "DJ"              },
  { name: "TJ Highgrade",     type: "MC"              },
  { name: "Yemi Waves",       type: "Singer"          },
  { name: "Phantom Sound",    type: "Producer"        },
  { name: "Nadia Volt",       type: "Rapper"          },
  { name: "Kofi Riddim",      type: "Instrumentalist" },
  { name: "Aisha Luxe",       type: "Singer"          },
  { name: "Dre Konnect",      type: "Rapper"          },
  { name: "Selene Groove",    type: "Singer"          },
  { name: "Marco Techno",     type: "DJ"              },
  { name: "Blessing MC",      type: "MC"              },
];

const bios = [
  "Born in the crossroads of soul and innovation, I've been crafting sounds that move people since I picked up my first mic. My music blends rhythmic Afrobeats with deep lyrical storytelling.",
  "From underground clubs to festival mainstages, every set I play is a journey. I live for the moment the crowd becomes one entity — that's when the magic happens.",
  "My production style is a fusion of traditional African rhythms and modern electronic textures. I've worked with artists across 12 countries and counting.",
  "Hip-hop is my language. I use it to tell stories from the streets that shaped me, for the people who lived those same stories but never heard them told with this much fire.",
  "Every performance is a spiritual experience. I channel energy from the crowd and send it back amplified. My voice is my instrument, and I play it like my life depends on it.",
  "Genre boundaries mean nothing to me. I pull from jazz, electronic, and traditional Afro sounds to create something completely original every time I step in the studio.",
];

const trackSets = [
  ["Midnight Rush", "Golden Hour", "City Lights"],
  ["Bass Awakening", "Deep Circuit", "Neon Dreams"],
  ["Street Philosophy", "No Filter", "Raw Seasons"],
  ["Summer Riddim", "Afro State", "Continental Drift"],
  ["Soul Protocol", "Inner Frequency", "Elevation"],
  ["Pulse Wave", "Infinite Loop", "Static Dreams"],
];

async function main() {
  console.log("🌱 Seeding StageLink database...");

  // Clean up previous seed data
  await pool.query(`DELETE FROM tracks WHERE artist_id IN (
    SELECT id FROM artist_profiles WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id LIKE 'seed_%'
    )
  )`);
  await pool.query(`DELETE FROM artist_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id LIKE 'seed_%')`);
  await pool.query(`DELETE FROM users WHERE clerk_id LIKE 'seed_%'`);
  await pool.query(`DELETE FROM events WHERE title LIKE '[seed]%'`);
  await pool.query(`DELETE FROM competitions WHERE title LIKE '[seed]%'`);
  await pool.query(`DELETE FROM posts WHERE content LIKE '[seed]%'`);

  // ── Users + Artist Profiles ──────────────────────────────────────────────
  const insertedUserIds: number[] = [];
  const insertedProfileIds: number[] = [];

  for (let i = 0; i < artistDefs.length; i++) {
    const artist = artistDefs[i];
    const country = pick(COUNTRIES);
    const city = pick(CITIES[country]);

    const genreCount = rand(1, 3);
    const shuffled = [...GENRES].sort(() => Math.random() - 0.5);
    const genres = shuffled.slice(0, genreCount);

    const userRes = await pool.query(
      `INSERT INTO users (clerk_id, role, display_name, avatar_url, bio, xp, level)
       VALUES ($1, 'artist', $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        `seed_${i + 1}_${Date.now()}`,
        artist.name,
        UNSPLASH_ARTISTS[i % UNSPLASH_ARTISTS.length],
        pick(bios),
        rand(200, 8000),
        rand(2, 15),
      ]
    );
    const userId = userRes.rows[0].id;
    insertedUserIds.push(userId);

    const profileRes = await pool.query(
      `INSERT INTO artist_profiles
         (user_id, artist_type, genres, languages, country, city, bio,
          cover_image_url, booking_price, rating, review_count, verified,
          instagram_url, twitter_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id`,
      [
        userId,
        artist.type,
        genres,
        ["English"],
        country,
        city,
        pick(bios),
        COVERS[i % COVERS.length],
        rand(300, 10000),
        parseFloat((rand(35, 50) / 10).toFixed(1)),
        rand(2, 80),
        rand(0, 1),
        `https://instagram.com/${artist.name.toLowerCase().replace(/[\s']/g, "")}`,
        `https://twitter.com/${artist.name.toLowerCase().replace(/[\s']/g, "")}`,
      ]
    );
    const profileId = profileRes.rows[0].id;
    insertedProfileIds.push(profileId);

    // Tracks for this artist
    const titles = trackSets[i % trackSets.length];
    for (const title of titles) {
      await pool.query(
        `INSERT INTO tracks (artist_id, title, genre, track_type, duration_seconds, cover_url, audio_url, plays, likes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          profileId,
          title,
          pick(genres),
          pick(["single", "album_track", "ep_track"]),
          rand(120, 280),
          pick(COVERS),
          "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
          rand(500, 500000),
          rand(50, 50000),
        ]
      );
    }
  }

  console.log(`✅ Created ${artistDefs.length} artists with tracks`);

  // Use first user as organizer for events
  const organizerId = insertedUserIds[0];

  // ── Events ─────────────────────────────────────────────────────────────────
  const eventData = [
    { title: "Afrofest Lagos 2025",      venue: "Eko Convention Centre", city: "Lagos",         country: "Nigeria"       },
    { title: "Global Bass Summit",        venue: "The O2 Arena",          city: "London",        country: "UK"            },
    { title: "Joburg Sound Festival",     venue: "FNB Stadium",           city: "Johannesburg",  country: "South Africa"  },
    { title: "Accra Music Week",          venue: "National Theatre",      city: "Accra",         country: "Ghana"         },
    { title: "NYC Underground Showcase",  venue: "Brooklyn Steel",        city: "New York",      country: "USA"           },
    { title: "Paris Electronic Night",    venue: "Rex Club",              city: "Paris",         country: "France"        },
    { title: "Nairobi Jazz Festival",     venue: "Uhuru Gardens",         city: "Nairobi",       country: "Kenya"         },
    { title: "Atlanta Gospel Explosion",  venue: "State Farm Arena",      city: "Atlanta",       country: "USA"           },
  ];

  for (let i = 0; i < eventData.length; i++) {
    const e = eventData[i];
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + rand(7, 120));

    await pool.query(
      `INSERT INTO events
         (organizer_id, title, description, venue, city, country, event_date,
          ticket_price, total_tickets, sold_tickets, cover_image_url, status, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'upcoming',$12)`,
      [
        organizerId,
        `[seed]${e.title}`,
        `${e.title} brings together the world's finest artists for an unforgettable night of live music, cultural celebration, and community. Don't miss the biggest music event of the season in ${e.city}.`,
        e.venue,
        e.city,
        e.country,
        eventDate,
        rand(20, 500),
        rand(500, 50000),
        rand(100, 10000),
        EVENT_COVERS[i % EVENT_COVERS.length],
        i < 3 ? 1 : 0,
      ]
    );
  }

  console.log(`✅ Created ${eventData.length} events`);

  // ── Competitions ────────────────────────────────────────────────────────────
  const compData = [
    { title: "Best New Artist 2025",    category: "Singer",   prize: 25000 },
    { title: "Producer of the Year",    category: "Producer", prize: 15000 },
    { title: "DJ Battle Championship",  category: "DJ",       prize: 10000 },
    { title: "Freestyle Rap Crown",     category: "Rapper",   prize: 5000  },
  ];

  for (let i = 0; i < compData.length; i++) {
    const c = compData[i];
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + rand(14, 60));

    await pool.query(
      `INSERT INTO competitions (title, category, description, cover_image_url, status, prize_pool, ends_at)
       VALUES ($1,$2,$3,$4,'open',$5,$6)`,
      [
        `[seed]${c.title}`,
        c.category,
        `Compete against the world's best ${c.category.toLowerCase()}s for a chance to win $${c.prize.toLocaleString()} and global recognition. Submit your entry, earn community votes, and let your talent do the talking.`,
        EVENT_COVERS[i % EVENT_COVERS.length],
        c.prize,
        endsAt,
      ]
    );
  }

  console.log(`✅ Created ${compData.length} competitions`);

  // ── Community Posts ─────────────────────────────────────────────────────────
  const postContents = [
    "[seed]Just dropped my new single 'Midnight Rush' — stream it everywhere! 🔥 This one took 6 months to perfect. The beat, the lyrics, the vibe — all came together. Tell me what you think! 🎵",
    "[seed]Big announcement! Headlining AfroFest Lagos this year 🎤 From busking on the streets to a 50,000 capacity crowd. Cannot believe how far we've come. God is good. 🙏",
    "[seed]Studio session 2am vibes 🎹 Working on something that's going to change the game. Who else is a midnight creator? 🌙 New music coming very soon.",
    "[seed]Grateful for 100k followers! 💜 Every stream, every share, every kind word has kept me going. This community is everything. Stay tuned for what's next.",
    "[seed]Performing at my first international festival next month 🌍 Dreams are valid people! Keep pushing even when nobody's watching. The breakthrough always comes.",
    "[seed]New beat pack dropping Friday — 50 fire instrumentals for your next project. Producers, let's collab 🔊 DMs are open. Link in bio!",
  ];

  for (let i = 0; i < postContents.length; i++) {
    await pool.query(
      `INSERT INTO posts (author_id, content, post_type, likes, comments_count)
       VALUES ($1,$2,'text',$3,$4)`,
      [
        insertedUserIds[i % insertedUserIds.length],
        postContents[i],
        rand(10, 5000),
        rand(2, 300),
      ]
    );
  }

  console.log(`✅ Created ${postContents.length} community posts`);
  console.log("\n🎉 Seed complete!");
  await pool.end();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
