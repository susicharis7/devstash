# Current Feature

Dashboard UI Phase 3 — the main content area: stats, recent collections, and
pinned/recent items. Phase 3 of 3.
See `@context/features/dashboard-phase-3-spec.md`.

## Status

Completed

## Goals

- Build out the main content area to the right of the sidebar
- 4 stats cards at the top: total items, total collections, favorite items,
  favorite collections (not shown in the screenshot)
- Recent collections section
- Pinned items section
- 10 most recent items

## Notes

- Phase 3 of 3; the final phase of the dashboard UI layout.
- Layout should follow `@context/screenshots/dashboard-ui-main.png`.
- Use `@src/lib/mock-data.ts` as the data source (no database yet) — import
  directly. (The spec references `mock-data.js`, but the file is `mock-data.ts`.)
- The stats cards are an addition not present in the reference screenshot.

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