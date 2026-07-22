# Current Feature

Dashboard UI Phase 1 — foundational dashboard layout and shell. Phase 1 of 3.
See `@context/features/dashboard-phase-1-spec.md`.

## Status

In Progress

## Goals

- Initialize ShadCN UI and install the needed components
- Add a dashboard route at `/dashboard`
- Build the main dashboard layout and any global styles
- Dark mode by default
- Top bar with search and a new item button (display only)
- Placeholder sidebar and main area — just an `h2` reading "Sidebar" and "Main" for now

## Notes

- Phase 1 of 3; phases 2 and 3 are specced in `@context/features/dashboard-phase-2-spec.md`
  and `@context/features/dashboard-phase-3-spec.md`.
- Layout should follow `@context/screenshots/dashboard-ui-main.png`.
- Use `@src/lib/mock-data.ts` as the data source (no database yet).
- Top bar controls are display-only in this phase (non-functional).

## History
<!-- Keep this updated. Earliest to latest. -->

- **2026-07-22 — Initial Next.js setup.** Scaffolded with Create Next App
  (Next.js 16.2.10, React 19.2.4, TypeScript, Tailwind CSS v4). Removed default
  boilerplate assets, added project context docs (`project-overview`,
  `coding-standards`, `ai-interaction`, `current-feature`) and CLAUDE.md guidance.
  Connected to `github.com/susicharis7/devstash` and pushed to `main` (`413a9a2`).