# StageLink

A premium global artist discovery, booking, and fan engagement SaaS platform. Independent artists can build professional profiles, get booked for events, and grow their careers worldwide.

## Run & Operate

- **Frontend** — managed by `artifacts/stagelink: web` workflow (Vite dev server, port 23407, served at `/`)
- **API Server** — managed by `artifacts/api-server: API Server` workflow (Express, port 8080, served at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes to development database
- `pnpm --filter @workspace/db exec tsx seed.ts` — seed database with sample artists, events, competitions, and posts

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- **Frontend**: React + Vite, Tailwind CSS v4, Shadcn UI, Framer Motion, Wouter routing
- **Auth**: Replit-managed Clerk (`@clerk/react` on frontend, `@clerk/express` on backend)
- **API**: Express 5 with pino structured logging
- **DB**: PostgreSQL + Drizzle ORM (`lib/db`)
- **Validation**: Zod + `drizzle-zod`

## Where things live

- `artifacts/stagelink/src/pages/` — all frontend pages (Home, Discover, Events, Bookings, Dashboard, etc.)
- `artifacts/stagelink/src/components/` — shared UI components and layouts
- `artifacts/api-server/src/routes/` — all API route handlers
- `artifacts/api-server/src/middlewares/` — Clerk auth middleware, requireAuth
- `lib/db/src/schema/` — Drizzle schema (users, artists, tracks, events, bookings, posts, competitions, notifications)
- `lib/db/seed.ts` — sample data seed script

## Architecture decisions

- Clerk auth is Replit-managed — do not touch `CLERK_*` secrets manually; use the Auth pane in the workspace toolbar
- `publishableKeyFromHost()` from `@clerk/react/internal` resolves the publishable key — never inline `import.meta.env.VITE_CLERK_PUBLISHABLE_KEY` directly
- API uses cookie-based Clerk sessions (web) — do not add Bearer token auth to browser requests
- Drizzle `orderBy` must use `asc(col)` / `desc(col)` helpers — `sql\`${col} asc\`` generates broken SQL in this Drizzle version
- `DATABASE_URL` is runtime-managed by Replit — never set it manually

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always use `asc(col)` / `desc(col)` from `drizzle-orm` for `orderBy` — the `sql` template approach produces invalid SQL
- The Clerk "development keys" console warning is expected and harmless during development
- `pnpm --filter @workspace/db exec tsx seed.ts` requires tsx installed in `lib/db` devDependencies (already done)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk auth setup, troubleshooting, and customization
