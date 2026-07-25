/**
 * StageLink database seed script
 * Run: pnpm --filter @workspace/db exec tsx seed.ts
 */
import pg from "pg";

const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const avatars = [
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
];
const covers = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
];
const eventCovers = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
];

const bios = [
  "Born in the crossroads of soul and innovation, crafting sounds that move people since picking up the first mic. Music blends rhythmic Afrobeats with deep lyrical storytelling.",
  "From underground clubs to festival mainstages, every set is a journey. Living for the moment the crowd becomes one entity.",
  "Production style fuses traditional African rhythms with modern electronic textures. Worked with artists across 12 countries.",
  "Hip-hop is the language. Using it to tell stories from the streets, for the people who lived those same stories.",
  "Every performance is a spiritual experience. Channeling energy from the crowd and sending it back amplified.",
  "Genre boundaries mean nothing. Jazz, electronic, Afro sounds — creating something completely original every time.",
];

const artists = [
  { name: "Zara Pulse",    type: "Singer",         country: "Nigeria",       city: "Lagos",        xp: 7200, lvl: 12, rating: 4.9, verified: 1, price: 2500, genres: ["Afrobeats","R&B"]       },
  { name: "DJ Krome",      type: "DJ",             country: "UK",            city: "London",       xp: 5800, lvl: 10, rating: 4.7, verified: 1, price: 3000, genres: ["House","Electronic"]     },
  { name: "Kwame Nova",    type: "Rapper",         country: "Ghana",         city: "Accra",        xp: 4100, lvl:  8, rating: 4.6, verified: 1, price: 1500, genres: ["Hip-Hop","Drill"]        },
  { name: "Sola Beats",    type: "Producer",       country: "Nigeria",       city: "Lagos",        xp: 6500, lvl: 11, rating: 4.8, verified: 1, price: 5000, genres: ["Afrobeats","Electronic"] },
  { name: "Amara Sky",     type: "Singer",         country: "South Africa",  city: "Cape Town",    xp: 3200, lvl:  7, rating: 4.5, verified: 0, price: 1200, genres: ["Amapiano","Pop"]         },
  { name: "Luca D'Amico",  type: "DJ",             country: "France",        city: "Paris",        xp: 5100, lvl:  9, rating: 4.7, verified: 1, price: 4000, genres: ["House","Jazz"]           },
  { name: "TJ Highgrade",  type: "MC",             country: "Jamaica",       city: "Kingston",     xp: 2900, lvl:  6, rating: 4.4, verified: 0, price:  800, genres: ["Reggae","Dancehall"]     },
  { name: "Yemi Waves",    type: "Singer",         country: "Nigeria",       city: "Abuja",        xp: 3800, lvl:  8, rating: 4.6, verified: 1, price: 2000, genres: ["Afrobeats","Pop"]        },
  { name: "Phantom Sound", type: "Producer",       country: "USA",           city: "Atlanta",      xp: 7800, lvl: 13, rating: 4.9, verified: 1, price: 8000, genres: ["Hip-Hop","R&B"]         },
  { name: "Nadia Volt",    type: "Rapper",         country: "UK",            city: "Manchester",   xp: 2400, lvl:  5, rating: 4.3, verified: 0, price:  700, genres: ["Drill","Hip-Hop"]        },
  { name: "Kofi Riddim",   type: "Instrumentalist",country: "Ghana",         city: "Kumasi",       xp: 1800, lvl:  4, rating: 4.2, verified: 0, price:  500, genres: ["Reggae","Jazz"]         },
  { name: "Aisha Luxe",    type: "Singer",         country: "Kenya",         city: "Nairobi",      xp: 4500, lvl:  9, rating: 4.7, verified: 1, price: 1800, genres: ["Afrobeats","Soul"]       },
];

const trackSets = [
  ["Midnight Rush","Golden Hour","City Lights"],
  ["Bass Awakening","Deep Circuit","Neon Dreams"],
  ["Street Philosophy","No Filter","Raw Seasons"],
  ["Summer Riddim","Afro State","Continental Drift"],
  ["Soul Protocol","Inner Frequency","Elevation"],
  ["Pulse Wave","Infinite Loop","Static Dreams"],
];

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log("🌱 Seeding StageLink...");

  // Clean old seed data
  await pool.query(`DELETE FROM tracks WHERE artist_id IN (SELECT id FROM artist_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id LIKE 'seed_%'))`);
  await pool.query(`DELETE FROM artist_profiles WHERE user_id IN (SELECT id FROM users WHERE clerk_id LIKE 'seed_%')`);
  await pool.query(`DELETE FROM users WHERE clerk_id LIKE 'seed_%'`);
  await pool.query(`DELETE FROM events WHERE title LIKE '%'`);
  await pool.query(`DELETE FROM competitions WHERE title LIKE '%'`);
  await pool.query(`DELETE FROM posts WHERE content LIKE '%'`);

  const userIds: number[] = [];
  const profileIds: number[] = [];

  for (let i = 0; i < artists.length; i++) {
    const a = artists[i];
    const ur = await pool.query(
      `INSERT INTO users (clerk_id, role, display_name, avatar_url, bio, xp, level)
       VALUES ($1,'artist',$2,$3,$4,$5,$6) RETURNING id`,
      [`seed_${i + 1}`, a.name, avatars[i % avatars.length], bios[i % bios.length], a.xp, a.lvl]
    );
    const uid = ur.rows[0].id;
    userIds.push(uid);

    const pr = await pool.query(
      `INSERT INTO artist_profiles
         (user_id, artist_type, genres, languages, country, city, bio,
          cover_image_url, booking_price, rating, review_count, verified,
          instagram_url, twitter_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
      [
        uid, a.type, a.genres, ["English"], a.country, a.city,
        bios[(i + 2) % bios.length], covers[i % covers.length],
        a.price, a.rating, rand(5, 80), a.verified,
        `https://instagram.com/${a.name.toLowerCase().replace(/[\s']/g, "")}`,
        `https://twitter.com/${a.name.toLowerCase().replace(/[\s']/g, "")}`,
      ]
    );
    const pid = pr.rows[0].id;
    profileIds.push(pid);

    const titles = trackSets[i % trackSets.length];
    for (const title of titles) {
      await pool.query(
        `INSERT INTO tracks (artist_id, title, genre, track_type, duration_seconds, cover_url, audio_url, plays, likes)
         VALUES ($1,$2,$3,'single',$4,$5,'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',$6,$7)`,
        [pid, title, a.genres[0], rand(120, 280), covers[i % covers.length], rand(1000, 500000), rand(100, 50000)]
      );
    }
  }
  console.log(`✅ ${artists.length} artists + tracks`);

  // Events
  const orgId = userIds[0];
  const events = [
    { title: "Afrofest Lagos 2025",     venue: "Eko Convention Centre", city: "Lagos",        country: "Nigeria",       featured: 1 },
    { title: "Global Bass Summit",       venue: "The O2 Arena",          city: "London",       country: "UK",            featured: 1 },
    { title: "Joburg Sound Festival",    venue: "FNB Stadium",           city: "Johannesburg", country: "South Africa",  featured: 1 },
    { title: "Accra Music Week",         venue: "National Theatre",      city: "Accra",        country: "Ghana",         featured: 0 },
    { title: "NYC Underground Showcase", venue: "Brooklyn Steel",        city: "New York",     country: "USA",           featured: 0 },
    { title: "Paris Electronic Night",   venue: "Rex Club",              city: "Paris",        country: "France",        featured: 0 },
    { title: "Nairobi Jazz Festival",    venue: "Uhuru Gardens",         city: "Nairobi",      country: "Kenya",         featured: 0 },
    { title: "Atlanta Gospel Explosion", venue: "State Farm Arena",      city: "Atlanta",      country: "USA",           featured: 0 },
  ];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const d = new Date(); d.setDate(d.getDate() + rand(7, 120));
    await pool.query(
      `INSERT INTO events (organizer_id, title, description, venue, city, country, event_date, ticket_price, total_tickets, sold_tickets, cover_image_url, status, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'upcoming',$12)`,
      [orgId, `${e.title}`,
       `${e.title} brings together the world's finest artists for an unforgettable night of live music and cultural celebration in ${e.city}. Don't miss it.`,
       e.venue, e.city, e.country, d, rand(20, 500), rand(500, 50000), rand(100, 10000),
       eventCovers[i % eventCovers.length], e.featured]
    );
  }
  console.log(`✅ ${events.length} events`);

  // Competitions
  const comps = [
    { title: "Best New Artist 2025",   cat: "Singer",   prize: 25000 },
    { title: "Producer of the Year",   cat: "Producer", prize: 15000 },
    { title: "DJ Battle Championship", cat: "DJ",       prize: 10000 },
    { title: "Freestyle Rap Crown",    cat: "Rapper",   prize:  5000 },
  ];
  for (let i = 0; i < comps.length; i++) {
    const c = comps[i];
    const ends = new Date(); ends.setDate(ends.getDate() + rand(14, 60));
    await pool.query(
      `INSERT INTO competitions (title, category, description, cover_image_url, status, prize_pool, ends_at)
       VALUES ($1,$2,$3,$4,'open',$5,$6)`,
      [`${c.title}`, c.cat,
       `Compete against the world's best ${c.cat.toLowerCase()}s to win $${c.prize.toLocaleString()} and global recognition. Submit your entry and let your talent do the talking.`,
       eventCovers[i % eventCovers.length], c.prize, ends]
    );
  }
  console.log(`✅ ${comps.length} competitions`);

  // Community posts
  const postContent = [
    "Just dropped my new single 'Midnight Rush' — stream it everywhere! 🔥 This one took 6 months to perfect. Tell me what you think! 🎵",
    "Big announcement! Headlining AfroFest Lagos this year 🎤 From busking on streets to 50,000 capacity. Cannot believe how far we've come. 🙏",
    "Studio session 2am vibes 🎹 Working on something that's going to change the game. Who else is a midnight creator? 🌙",
    "Grateful for 100k followers! 💜 Every stream, every share has kept me going. New music coming very soon. Stay locked.",
    "Performing at my first international festival next month 🌍 Dreams are valid. Keep pushing even when nobody's watching.",
    "New beat pack dropping Friday — 50 fire instrumentals. Producers let's collab 🔊 DMs open. Link in bio!",
  ];
  for (let i = 0; i < postContent.length; i++) {
    await pool.query(
      `INSERT INTO posts (author_id, content, post_type, likes, comments_count) VALUES ($1,$2,'text',$3,$4)`,
      [userIds[i % userIds.length], `${postContent[i]}`, rand(50, 5000), rand(5, 300)]
    );
  }
  console.log(`✅ ${postContent.length} posts`);

  console.log("\n🎉 Seed complete!");
  await pool.end();
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
