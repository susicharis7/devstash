# Current Feature: Auth Credentials — Email/Password Provider

Auth phase 2: Credentials provider + registration

Spec: `context/features/11-auth-phase-2-spec.md`

## Status

Complete

## Goals

- A Credentials provider accepts email/password sign-in alongside GitHub, validated
  with bcryptjs against `User.password`.
- The split config survives: `src/auth.config.ts` carries a Credentials
  *placeholder* with `authorize: () => null` so the edge proxy still type-checks
  without importing Prisma or bcryptjs, and `src/auth.ts` overrides it with the real
  bcrypt validation.
- `POST /api/auth/register` takes name/email/password/confirmPassword, rejects
  mismatched passwords and duplicate emails, hashes with bcryptjs, and creates the
  user.
- GitHub OAuth from phase 1 keeps working unchanged.

## Notes

- `User.password String?` already exists (migration `20260724121751_add_user_password`,
  added during the seed work), so the spec's "add password field via migration if not
  already there" is already satisfied — **no migration this phase**.
- `bcryptjs@3.0.3` is already a dependency; `prisma/seed.ts` hashes the demo user's
  password with 12 rounds, so registration should match that cost factor.
- Why the placeholder/override split: bcryptjs and Prisma are not edge-safe, and
  `src/proxy.ts` initializes NextAuth from `auth.config.ts`. The provider must be
  *listed* there so the sign-in page renders its form, but the real `authorize` can
  only live in `auth.ts`. `src/auth.ts` already spreads `...authConfig` first, so an
  override in its own `providers` array wins.
- Registration is an API route rather than a Server Action because the spec's test
  step drives it with curl, and it needs real HTTP status codes.
- Inputs get a Zod schema per `coding-standards.md`; Zod is not yet a dependency, so
  this phase adds it.
- Credentials sign-in with `strategy: 'jwt'` does not write an `Account` row — only
  OAuth does. Expect `User` +1 and `Account` unchanged when testing.
- Emails normalize to lowercase in the shared `emailField` schema. Postgres compares
  strings case-sensitively, so without this the duplicate-email guard was bypassable
  (`Foo@x.com` and `foo@x.com` both registered) and sign-in failed on any case
  difference from registration. Found in the `/feature review` pass.
- `authorizeCredentials` always runs one `bcrypt.compare`, falling back to
  `DECOY_PASSWORD_HASH` when the user is missing or has no password, so a hit and a
  miss cost the same. Returning early on the miss leaked which emails are registered
  via response time. Measured after the fix: 404 ms vs 405 ms median over 12
  interleaved samples each, inside a 22–28 ms stdev. The decoy is a real 12-round
  hash of random bytes, hardcoded rather than computed at import so cold starts do
  not pay for it.
- Registration caps passwords at 72 characters because bcrypt silently ignores input
  past 72 bytes. The cap counts characters, not bytes, so it is a UX guardrail rather
  than an exact bcrypt boundary.
- Residual, not fixed: emails that arrive via the GitHub adapter are not passed
  through the Zod schema, so an OAuth account whose provider email is mixed-case
  would still store mixed-case. GitHub emails are lowercase in practice; normalizing
  the adapter path would need a `signIn` callback.
- Still out of scope (phase 3): custom `/sign-in` and register pages, sign-out UI,
  the sidebar user display, and swapping `getCurrentUserId()` off the demo user.

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
- **2026-07-28 — User-scoped queries and sidebar/card dedupe.** From a
  `code-improver` review pass. All six per-request dashboard queries filtered with
  `where: { user: { email } }`, joining `User` instead of using the existing
  `@@index([userId])`. Added `src/lib/db/current-user.ts` — `getCurrentUserId()`,
  a React `cache`d id lookup that throws a "run `npm run db:seed`" error when the
  user is missing — and switched `getPinnedItems`, `getRecentItems`,
  `getSidebarItemTypes`, `fetchUserCollections` (renamed from
  `fetchDemoCollections`) and `getDashboardStats` to `where: { userId }`. It lives
  in its own file rather than in `demo-user.ts` because `prisma/seed.ts` imports
  `DEMO_USER_EMAIL` from there, and pulling in `@/lib/prisma` would construct the
  Prisma adapter before the seed's `loadEnvConfig()` runs (imports hoist above it),
  leaving `DATABASE_URL` undefined. `demoUserWhere` is gone; `demo-user.ts` is now
  just the email constant, and `current-user.ts` is the single seam for `auth()`.
  Dedupe: new `FavoriteStar` component replaces three copies of
  `fill-yellow-400 text-yellow-400` (`ItemRow`, `CollectionCard`,
  `SidebarContent`), and a local `CollectionNavLink` in `SidebarContent` collapses
  the near-identical favorites and recents loops into one component with a
  `favorite` prop switching the icon (folder vs. accent dot) and trailing slot
  (star vs. count). Also fixed the misindented `.map()` body in
  `getSidebarItemTypes`. No UI change (screenshot-verified). Merged to `main` via
  `chore/user-id-queries-and-dedupe`.
- **2026-07-28 — Fix: empty database crashed the deployed dashboard.** The
  `getCurrentUserId()` added above threw when `demo@devstash.io` was absent, which
  turned the unseeded production branch (0 users, 0 item types, 0 items,
  0 collections) into a Server Components render error on `/dashboard`. Before that
  change the email-relation filter simply matched nothing and the page rendered
  zeros. `getCurrentUserId()` now returns `string | null`, and the five queries
  short-circuit to empty results (`[]`, or zeroed `DashboardStats`); the per-type
  item counts moved into a `countItemsByType(userId)` helper so the `Promise.all`
  in `getSidebarItemTypes` keeps both branches typed. Verified by serving
  `next start` against the production branch: `/dashboard` returns 200 and renders
  zeros with no server error. Production is still unseeded, so it shows an empty
  shell (no system item types) until `db:seed` runs there or auth lands. Merged to
  `main` via `fix/empty-database-render`.
- **2026-07-28 — Fix: Vercel build failed with Prisma P1002.**
  `prisma migrate deploy` timed out connecting to the production branch during the
  Vercel build (P1002 — server reached, connection timed out). Nothing was pending;
  `migrate status` reported the schema already up to date. Cause is a Neon cold
  start: that compute is idle-suspended (the branch has no traffic) and Prisma's
  default PostgreSQL connect timeout is 5s. `prisma.config.ts` now appends
  `connect_timeout=30` to the migration URL when it is not already present, and
  warns when `DATABASE_URL_UNPOOLED` is missing so the build log names the problem
  instead of falling silently back to the pooled connection. The unpooled lookup
  uses `||` rather than `??` so an env var set to an empty string counts as absent.
  Verified with `prisma migrate status` against both branches, and with
  `DATABASE_URL_UNPOOLED=` to exercise the warning and the pooled fallback. Merged
  to `main` via `fix/vercel-migrate-timeout`.
- **2026-07-28 — Auth phase 1: NextAuth v5 + GitHub.** Installed
  `next-auth@5.0.0-beta.32` and `@auth/prisma-adapter@2.11.3` (peer-accepts
  `@prisma/client >=6`, so Prisma 7.9.0 needed no override) and added the split
  config: `src/auth.config.ts` (GitHub provider only, `satisfies NextAuthConfig`)
  and `src/auth.ts` (Prisma adapter + `session: { strategy: 'jwt' }` + a session
  callback copying `token.sub` to `session.user.id`). `src/auth.ts` spreads
  `...authConfig` *first* so its own keys win — phase 2's Credentials override
  depends on that precedence. Handlers exported from
  `src/app/api/auth/[...nextauth]/route.ts`; `src/types/next-auth.d.ts` augments
  `Session["user"]` with `id`. Route protection lives in `src/proxy.ts` — Next.js 16
  renamed `middleware` to `proxy`, so the file sits beside `app/` and uses a named
  `proxy` export wrapping `auth()`, redirecting to `/api/auth/signin` with a
  `callbackUrl`. The matcher is the allowlist `["/dashboard", "/dashboard/:path*"]`
  rather than a negative `_next`-excluding pattern, since the docs warn a
  matcher-less proxy also intercepts CSS/JS/images. Used the existing `@/lib/prisma`
  singleton instead of the docs' inline `new PrismaClient()` so the `PrismaPg`
  driver adapter is reused. No migration — `Account` / `Session` /
  `VerificationToken` were already in the schema from the `init` migration.
  Verified end to end against the development branch: unauthenticated `/dashboard`
  → 307 to the default sign-in page, GitHub round-trip completes, authenticated
  `/dashboard` → 200, `/api/auth/session` returns a cuid `user.id`, and the DB went
  from 1 user / 0 accounts to 2 users / 1 `github` `oauth` account with `Session`
  still 0 (correct for JWT). Known and deferred: the GitHub sign-in creates a second
  `User` row while the dashboard still reads the demo user via
  `getCurrentUserId()`, so a signed-in GitHub user sees demo data — rewiring that,
  plus sign-out UI and the credentials provider, is phases 2 and 3. Also added
  `.playwright-mcp/` to `.gitignore`. Merged to `main` via `feature/auth-phase-1`.