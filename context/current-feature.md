# Current Feature

<!-- Load a spec with /feature load to populate this file. -->

## Status

Not Started

## Goals

<!-- Bullet points of what success looks like. -->

## Notes

<!-- Additional context, constraints, or details from the spec. -->

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
- **2026-07-24 — Stats & sidebar from the database.** Made the sidebar DB-backed:
  added `getSidebarItemTypes` (system types, per-type counts scoped to the demo
  user, canonical order, display label + plural slug) to `src/lib/db/items.ts` and
  `getSidebarCollections` (favorites + recents, each with a dominant-type accent
  color) to `src/lib/db/collections.ts`, extracting a shared `rankCollectionTypes`
  helper. The dashboard layout is now an async server component (`connection()`)
  that fetches both datasets and passes them through `Sidebar` to the client
  `SidebarContent`. Sidebar Types link to `/items/[slug]` with real counts;
  favorite collections keep the star and recents show a colored circle by dominant
  type; added a "View all collections" link to `/collections`. Only `currentUser`
  still comes from mock data (auth is a later feature). Merged to `main` via
  `feature/stats-sidebar-db`.
- **2026-07-27 — PRO badge in the sidebar.** Marked the Pro-only system types
  (`file`, `image`) in the sidebar Types list with a small uppercase PRO pill.
  Added `isPro` to `SidebarItemType` in `src/lib/db/items.ts` (derived from a
  `PRO_TYPE_NAMES` set against the raw singular type name, before pluralization)
  and installed the ShadCN `badge` component. A local `ProBadge` in
  `SidebarContent.tsx` renders in the row's `trailing` slot in place of the item
  count. Added `--pro` / `--pro-glow` theme tokens per light/dark mode plus
  `--color-pro`, `--animate-pro-glow` and `@keyframes pro-glow` (soft pulsing
  box-shadow) to `globals.css`, applied via `motion-safe:animate-pro-glow` so
  reduced-motion users get a static badge. Gating is display-only — the links
  stay navigable since all types are accessible during development. Merged to
  `main` via `feature/pro-badge-sidebar`.
- **2026-07-28 — Cleanup pass.** Trimmed `src/lib/mock-data.ts` to just
  `currentUser` (+ its `User` interface) — the item-type, collection and item
  fixtures plus their interfaces were dead once the dashboard and sidebar went
  DB-backed. Deleted the unused ShadCN `tooltip` component (the `radix-ui`
  dependency stays, other components need it). Fixed the `react-hooks/static-components`
  lint error in `ItemRow` by centralizing icon rendering in a new
  `ItemTypeIcon` component (`createElement(getItemTypeIcon(icon), props)`), now
  used by `ItemRow`, `CollectionCard` and `SidebarContent`. Doc sync: added
  `password String?` to the draft `User` in `project-overview.md` and marked the
  `ContentType` enum note as shipped; listed the `db:*` scripts in `CLAUDE.md`.
  Committed the `.claude/` skills directory. Merged to `main` via `chore/cleanup`.
- **2026-07-28 — Deduplicated domain constants and collection queries.** The seven
  system item types were defined in three places; they now live once in
  `src/lib/item-types.ts` (`SYSTEM_ITEM_TYPES` with `name`/`icon`/`color`/`isPro`,
  plus derived `SYSTEM_TYPE_ORDER`, `PRO_TYPE_NAMES` and `FALLBACK_COLOR`), consumed
  by `prisma/seed.ts`, `src/lib/db/items.ts` and `src/lib/item-type-icons.ts`. Icon
  names are an `ItemTypeIconName` union, so `ITEM_TYPE_ICONS` is a
  `Record<ItemTypeIconName, LucideIcon>` and the compiler now catches a type whose
  icon has no lucide binding. Added `src/lib/db/demo-user.ts` (`DEMO_USER_EMAIL`,
  `demoUserWhere`), replacing two duplicate constants and six inline `where`
  fragments. `getRecentCollections` and `getSidebarCollections` were the same query;
  both now go through one `fetchDemoCollections` memoized with React `cache`, so the
  dashboard layout and page share a single collection query per request instead of
  running it twice, with `toDashboardCollection` / `toSidebarCollection` as the only
  difference. Row types are derived (`Prisma.ItemGetPayload<typeof itemQuery>`,
  `Prisma.CollectionGetPayload`) instead of restating each `select` field by hand,
  which also removed a dead `?? FALLBACK_COLOR` on the non-nullable
  `ItemType.color`. No UI change (screenshot-verified). Merged to `main` via
  `chore/dedupe-domain-constants`.