# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"SendIt" — a climbing route discovery and tracking app for South African crags. Full-stack Next.js 16 (App Router) + Supabase + PostGIS. Users can browse areas/crags/routes, log ascents, report bolt conditions, and upload photos. Map-based discovery uses browser geolocation.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run start      # Run production server
npm run lint       # ESLint
```

### Scraper (separate package)

```bash
cd scripts/scraper
npm install
npx playwright install chromium
npx tsx scrape-thecrag.ts    # Scrape climbing data from thecrag.com
npx tsx seed-database.ts     # Load scraped data into Supabase
```

## Architecture

**Next.js App Router** with server components by default. Client components (`"use client"`) are used only for interactive elements: forms, maps, location context.

**Routing hierarchy** mirrors the data model:
- `/` — Home with geolocation + nearby crags map
- `/areas` → `/areas/[areaId]` → `/areas/[areaId]/crags/[cragId]` → `.../routes/[routeId]`
- `/auth/login`, `/auth/signup`, `/auth/callback`
- `/api/nearby-crags` — API route using PostGIS `nearby_crags()` RPC with Haversine fallback

**Supabase access** uses two client factories:
- `src/lib/supabase/client.ts` — browser client (anon key, RLS-enforced)
- `src/lib/supabase/server.ts` — server client (cookie-based auth session)

**Auth middleware** (`src/middleware.ts`) refreshes Supabase sessions on every request.

**Map** — Leaflet via `react-leaflet`, dynamically imported to avoid SSR issues (`CragMap` component).

**Location** — `LocationProvider` context wraps the app; defaults to Cape Town (-33.9249, 18.4241) if geolocation is denied.

## Database

PostGIS-enabled Supabase. Migrations in `supabase/migrations/` (00001–00008). Core tables:

- `areas` → `crags` → `routes` (geographic hierarchy, all with lat/lng + geography columns)
- `ascents` (user climb logs with style: onsight/flash/redpoint/toprope/attempt)
- `rebolt_records` (bolt maintenance history, append-only)
- `photos` (references Supabase Storage bucket "climbing-photos")
- `profiles` (auto-created on signup via trigger)

RLS policies: public read on all tables, authenticated write, own-record delete on ascents/photos.

`00008_functions.sql` defines the `nearby_crags()` PostGIS function and location-setting triggers.

## Key Conventions

- **Path alias:** `@/*` maps to `./src/*`
- **Styling:** Tailwind CSS 4 with CSS custom properties for theming (defined in `globals.css`)
- **Grade system:** `src/lib/grades.ts` handles SA (Ewbank), French, and V-grade sorting + color coding
- **TypeScript types** for the DB schema live in `src/lib/types/database.ts`

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only, also used by scraper/seeder)
