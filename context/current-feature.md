# Current Feature

Dashboard items from the database — replace the dummy Pinned and Recent item data
in the dashboard main area with real data fetched from Neon via Prisma.
See `@context/features/07-dashboard-items-spec.md`.

## Status

Completed

## Goals

- Create `src/lib/db/items.ts` with data-fetching functions (pinned + recent)
- Fetch items directly in the dashboard server component (no client fetch)
- Replace the mock-data Pinned and Recent items with real DB items — keep the
  current `ItemRow` design
- Item card icon/border color derived from the item's type
- Display item type tags and everything currently shown (title, pin/favorite
  markers, description, tags, date)
- If there are no pinned items, do not render the Pinned section at all
- Ensure the stats display reflects real data (already DB-backed from feature 06)

## Notes

- **Scope:** items only. After this, the whole dashboard main area is DB-backed;
  only the sidebar still uses `@src/lib/mock-data.ts` (a later feature).
- Follows the same pattern as `src/lib/db/collections.ts`: scope to the seeded
  demo user (`demo@devstash.io`); the page already uses `connection()` for
  request-time rendering, so `next build` won't touch the DB.
- Keep the existing `ItemRow` design; reference
  `@context/screenshots/dashboard-ui-main.png` if needed.
- **Seed-data caveat:** the current seed marks no items as pinned or favorite and
  adds no tags. So after this change the Pinned section will be hidden (0 pinned),
  Recent will show the 10 newest items, and no tag chips will render. Consider
  updating the seed to flag a few pinned/favorite items and add tags for a richer
  demo (out of scope here — flag to the user).

## History
<!-- Keep this updated. Earliest to latest. -->

- **2026-07-22 — Initial Next.js setup.** Scaffolded with Create Next App
  (Next.js 16.2.10, React 19.2.4, TypeScript, Tailwind CSS v4). Removed default
  boilerplate assets, added project context docs (`project-overview`,
  `coding-standards`, `ai-interaction`, `current-feature`) and CLAUDE.md guidance.
  Connected to `github.com/susicharis7/devstash` and pushed to `main` (`413a9a2`).
- **2026-07-22 — Dashboard UI Phase 1.** Initialized ShadCN UI (button, input),
  enabled dark mode by default, and added the `/dashboard` route with a sidebar +
  top bar shell. Top bar search and action buttons are display-only; sidebar and
  main area are placeholders for phases 2 and 3. Merged to `main` via
  `feature/dashboard-phase-1`.
- **2026-07-22 — Dashboard UI Phase 2.** Built the functional sidebar: collapsible
  on desktop (top-bar drawer icon toggles it) and an overlay drawer on mobile.
  Added a collapsible Types section (links to `/items/{slug}` with color-coded
  icons + counts), a Collections section split into Favorites and All Collections,
  and a bottom user-avatar area with a settings button. Added a `SidebarProvider`
  context plus a `useIsMobile` hook and a centralized item-type icon map; installed
  ShadCN `avatar`, `separator`, `scroll-area`, `sheet`, `tooltip`. Data comes from
  `@src/lib/mock-data.ts`. Merged to `main` via `feature/dashboard-phase-2`.
- **2026-07-22 — Dashboard UI Phase 3.** Built the main content area: 4 stats
  cards (items, collections, favorite items, favorite collections), a recent
  Collections grid (top 6 by recency, color-coded by dominant type), a Pinned
  items section, and the 10 most recent items. Added display-only `StatCard`,
  `CollectionCard`, and reusable `ItemRow` components plus an `itemTypesById`
  lookup in mock data. Completes the 3-phase dashboard UI layout. Merged to
  `main` via `feature/dashboard-phase-3`.
- **2026-07-24 — Neon Postgres connected.** Ran Neon's agent onboarding; using the
  existing `devstash` project with `development` and `production` branches. Wired
  per-environment env files (`.env.development` / `.env.production`, both gitignored)
  so `next dev` targets the dev branch and `build`/`start` the prod branch;
  `DATABASE_URL` is pooled (runtime), `DATABASE_URL_UNPOOLED` is direct (migrations).
  No Neon Auth / serverless driver installed (using NextAuth + Prisma).
- **2026-07-24 — Prisma + Neon setup.** Added Prisma 7 (`prisma-client` generator →
  `src/generated/prisma`, gitignored) with the `@prisma/adapter-pg` driver adapter
  (pg over the pooled URL); config in `prisma.config.ts` loads env via `@next/env`
  and runs migrations against the unpooled URL. Wrote the initial schema from
  `project-overview.md` plus NextAuth models (`Account`, `Session`,
  `VerificationToken`), with indexes and cascade deletes, and applied the `init`
  migration to the dev branch. Client singleton at `@/lib/prisma`. Merged to `main`
  via `feature/prisma-neon-setup`.
- **2026-07-24 — Seed data.** Added `prisma/seed.ts` (`npm run db:seed`) that
  populates the database with a demo user (`demo@devstash.io`, bcryptjs 12-round
  hash), the 7 system item types, and 5 collections with 18 items. Prompts `y`/`n`
  to start and requires 3 confirmations before overriding existing data; targets
  the development branch by default. Added a `password String?` field to `User`
  (migration `add_user_password`) and the `bcryptjs` dependency. Merged to `main`
  via `feature/seed-data`.
- **2026-07-24 — Dashboard collections from the database.** Added
  `src/lib/db/collections.ts` (`getRecentCollections`, `getDashboardStats`) and
  switched the dashboard main area to fetch the 6 most recent collections and the
  stat cards from Neon via Prisma (demo user, ordered by `updatedAt`). Card border
  color now derives from the most-used content type, with icons for all types
  present. `CollectionCard` takes a DB view model; the page is an async server
  component using `connection()` to render at request time (so `next build` never
  touches the DB). Pinned/Recent items and the sidebar still use mock data
  (deferred). Merged to `main` via `feature/dashboard-collections-db`.
- **2026-07-24 — Dashboard items from the database.** Added `src/lib/db/items.ts`
  (`getPinnedItems`, `getRecentItems`) and switched the dashboard Pinned and Recent
  sections to real DB data via Prisma; the Pinned section is hidden when there are
  no pinned items. `ItemRow` now takes a DB view model (type-derived icon/border,
  tags, pin/favorite markers, date) and no longer uses mock data. Enriched
  `prisma/seed.ts` to mark a few items pinned/favorite, add 15 tags, and favorite
  two collections (also clears tags on override). The dashboard main area is now
  fully DB-backed; only the sidebar still uses mock data. Merged to `main` via
  `feature/dashboard-items`.