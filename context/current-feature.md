# Current Feature

Dashboard collections from the database — replace the dummy collection data in the
dashboard main area with real data fetched from Neon via Prisma.
See `@context/features/06-dashboard-collections-spec.md`.

## Status

Completed

## Goals

- Create `src/lib/db/collections.ts` with data-fetching function(s) (Prisma)
- Fetch collections directly in the dashboard server component (no client fetch)
- Replace the mock-data collections in the main area with the 6 recent collections
  from the database — keep the exact current design/layout
- Derive each collection card's border color from the **most-used content type**
  in that collection
- Show small icons for all content types present in the collection
- Update the collection stats display to reflect real data

## Notes

- **Scope:** collections only. Do **not** render the items underneath the cards yet
  — that comes in a later feature.
- Keep the existing `CollectionCard` design; reference
  `@context/screenshots/dashboard-ui-main.png` if needed.
- Data source shifts from `@src/lib/mock-data.ts` to the DB. The dashboard page is
  a server component, so it can call the Prisma fetch function directly.
- Border color currently comes from the first `itemTypeId`; this changes it to the
  most-used type, which requires aggregating item content types per collection.
- Seeded data is available (`npm run db:seed`) for the development branch.
- **Decisions:** show the 6 most recent collections ordered by `updatedAt`
  (matches current behavior); scope to the seeded demo user
  (`demo@devstash.io`) for now, and swap to the session user once NextAuth lands.

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