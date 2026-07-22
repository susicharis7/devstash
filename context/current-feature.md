# Current Feature

Dashboard UI Phase 2 — functional collapsible sidebar with types, collections,
and user area. Phase 2 of 3.
See `@context/features/dashboard-phase-2-spec.md`.

## Status

Completed

## Goals

- Collapsible sidebar with a drawer icon to open/close
- Item types linking to their item lists at `/items/TYPE` (e.g. `/items/snippets`)
- Favorite collections section
- Most recent collections section
- User avatar area at the bottom of the sidebar
- Always render as a drawer on mobile view

## Notes

- Phase 2 of 3; phase 3 is specced in `@context/features/dashboard-phase-3-spec.md`.
- Layout should follow `@context/screenshots/dashboard-ui-main.png`.
- Use `@src/lib/mock-data.ts` as the data source (no database yet) — import directly.

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