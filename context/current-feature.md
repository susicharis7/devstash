# Current Feature

<!-- Load a spec with /feature load [spec-name] -->

## Status

Not Started

## Goals

<!-- Populated by /feature load -->

## Notes

<!-- Populated by /feature load -->

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
- **2026-07-28 — Auth phase 2: credentials provider + registration.** Email/password
  sign-in alongside GitHub, plus `POST /api/auth/register`. No migration —
  `User.password` came with the seed work (`20260724121751_add_user_password`).
  `src/auth.config.ts` now exports `authProviders(authorize)` so the provider list is
  declared once: the edge config passes `() => null` and `src/auth.ts` injects the
  real bcrypt check, keeping Prisma and bcryptjs out of `src/proxy.ts`. That works
  because phase 1 already spread `...authConfig` first, so `auth.ts` keys win. Added
  `zod@4.4.3` (required by `coding-standards.md` for input validation) with
  `signInSchema` / `registerSchema` in `src/lib/validations/auth.ts`; used the v4
  top-level `z.email()` since `z.string().email()` is deprecated there. Registration
  hashes at 12 rounds to match `prisma/seed.ts` and returns the
  `{ success, data, error }` shape with real status codes (201 / 400 / 409 / 500).
  Three defects were caught by a `/feature review` pass before merge: (1) emails were
  stored and compared verbatim, and because Postgres is case-sensitive the
  duplicate-email guard was bypassable — `MixedCase@Test.com` and
  `mixedcase@test.com` both registered 201 — while sign-in failed on any case
  difference; the shared `emailField` now applies `.toLowerCase()`. (2) `authorize`
  returned early when the user was missing or had no password, so only the hit path
  paid ~200 ms of bcrypt and response time leaked which emails are registered; it now
  always runs one `bcrypt.compare` against a hardcoded `DECOY_PASSWORD_HASH` (a real
  12-round hash of random bytes, hardcoded so cold starts do not pay to compute it),
  measured afterwards at 404 ms vs 405 ms median over 12 interleaved samples each
  inside a 22–28 ms stdev. (3) registration now caps passwords at 72 characters,
  where bcrypt starts silently ignoring input. Also dropped a speculative unused
  `RegisterInput` export. Verified against the development branch: 201 with a
  `$2b$12$` 60-char hash, correct status for duplicate / mismatch / short password /
  bad email / malformed JSON, cross-case sign-in reaches `/dashboard`, wrong
  passwords and OAuth-only (NULL password) users rejected generically with
  `CredentialsSignin`, GitHub OAuth still round-trips, and credentials sign-in writes
  no `Account` row. Test rows were removed from the development branch afterwards.
  Residual, deliberately not fixed: emails created through the GitHub adapter bypass
  the Zod schema, so a mixed-case provider email would still store mixed-case —
  normalizing that needs a `signIn` callback. Merged to `main` via
  `feature/auth-credentials`.
- **2026-07-28 — Auth phase 3: custom auth pages, sidebar user menu, fixed sidebar.**
  Replaced NextAuth's default pages with `/sign-in` and `/register`, put the real
  signed-in user in the sidebar footer, and stopped the sidebar growing with page
  content. `pages.signIn` in `src/auth.config.ts` points at `/sign-in` and
  `src/proxy.ts` redirects there instead of `/api/auth/signin`. `src/actions/auth.ts`
  wraps `signIn`/`signOut` as Server Actions; the credentials action catches
  `AuthError` and returns a generic "Invalid email or password" while rethrowing
  everything else, which is what lets `NEXT_REDIRECT` propagate on success — catching
  broadly there would silently break the redirect. `/register` reuses the shared
  `registerSchema` client-side so the form gets per-field errors without changing the
  API route, which stays the authority. New `src/components/user/UserAvatar.tsx`
  centralizes the image-or-initials split and absorbed the `getInitials` helper that
  had been local to `SidebarContent`; `SidebarUser.tsx` adds the dropdown with Profile
  and Sign out, with the avatar linking to `/profile` (which does not exist yet and
  404s until a later phase). Small shared pieces — `AuthCard`, `AuthField`,
  `AuthError` — keep the two pages from duplicating card chrome and field markup.
  Installed the ShadCN `dropdown-menu`. **This retires the demo user:**
  `getCurrentUserId()` now reads `auth()` rather than looking up `DEMO_USER_EMAIL`, so
  the dashboard shows the signed-in account's own data; `src/lib/mock-data.ts` was its
  last consumer and is deleted (`demo-user.ts` stays because `prisma/seed.ts` imports
  the constant). Sidebar fix: the shell was `flex h-full min-h-screen`, and because
  `body` is `min-h-full` the `h-full` resolved to `auto`, so only `min-h-screen`
  applied — the flex row grew past the viewport, stretched `<aside>` to match, and left
  `main`'s `overflow-y-auto` inert so the document scrolled instead. The shell is now
  `flex h-dvh overflow-hidden`, making `main` the only scroll container; measured on a
  2092px page, `<aside>` is 879px (exactly one viewport), `main` scrolls and the
  document does not. `h-dvh` over `h-screen` so mobile browser chrome cannot clip the
  footer, and bounded-height flex rather than `position: fixed` so the `w-64`↔`w-0`
  collapse animation keeps working. Gotcha worth remembering: `lucide-react` 1.x
  dropped brand icons, so there is no `Github` export — the mark is an inline SVG in
  `src/components/icons/GitHubIcon.tsx`. Also corrected testing step 4 in the spec,
  which said "top bar" where the requirements say sidebar footer. Verified all seven
  spec steps against the development branch, plus wrong-password and client-validation
  paths; signing in as the seeded demo user still shows its 18 items and 5 collections
  while a fresh account shows zeros. Deliberately not added: redirecting an
  already-signed-in visitor away from `/sign-in`, since the spec does not ask for it.
  Merged to `main` via `feature/auth-ui`.
- **2026-07-28 — Landing page at `/`, and signed-in visitors bounced to the dashboard.**
  Replaced the `<h1>DEVSTASH</h1>` stub with a seven-section public page — sticky nav,
  hero, the seven item types, a static product preview, the capability list, a closing CTA
  and a footer — under `src/components/landing/`, plus real title / description /
  OpenGraph / Twitter metadata in the root layout. **`/` stays statically prerendered**
  (`○ /` in the build): the signed-in redirect lives in `src/proxy.ts` rather than the page,
  because `auth()` inside `page.tsx` would make `/` dynamic and cost the prerender for
  every anonymous visitor, which is the entire audience for a landing page. The check is
  cookie-only and touches no database — the session is a JWT and the proxy builds NextAuth
  from `auth.config.ts`, which has no adapter. The proxy is now **path-aware**, because the
  two cases are opposites: `/`, `/sign-in` and `/register` form a `SIGNED_OUT_ONLY` set
  that redirects to `/dashboard` when a session exists, while everything else keeps
  "no session → `/sign-in?callbackUrl=`". Adding `/sign-in` to the matcher is safe because
  the Server Action posts there while the visitor still has no session, the OAuth round
  trip returns to `/api/auth/callback/*` which the matcher does not cover, and sign-out
  clears the cookie before the browser requests the page — all four flows were retested.
  That redirect is a **303, not the default 307**: arrivals are normally GETs, but a stale
  form posted from a second tab would be a POST and 307 preserves the method, whereas 303
  correctly turns it into a GET of `/dashboard`. Sample content lives in
  `src/components/landing/landing-content.ts` rather than a revived `mock-data.ts`, and no
  marketing copy touches the database — that is what keeps the page static; type colors and
  icons come from `SYSTEM_ITEM_TYPES` / `ItemTypeIcon` so no hex is restated and the preview
  matches the real `ItemRow`. Animations add no dependency: `rise` and `caret-pulse`
  keyframes with `--animate-*` tokens in `globals.css` applied through `motion-safe:`, and
  scroll reveals via CSS `animation-timeline: view()` behind an `@supports` guard, so there
  is no JavaScript and unsupported browsers simply show the content. `QueryDemo` — the
  cycling query with a blinking caret — is the only client component. Two defects surfaced
  by measuring rather than looking: (1) the demo card jumped between 158/164/201px each cycle
  because queries had two or three hits and the line box collapsed while the query was
  empty; every query now has exactly three hits and the query line carries `min-h-7`, giving
  a flat 201px across a full cycle. (2) The page overflowed horizontally at 390px — 609px
  wide on a 390px viewport — because `PreviewMock`'s grid children defaulted to
  `min-width: auto`, so the single mobile column sized to *min-content*, and `truncate` sets
  `white-space: nowrap`, making min-content the entire mono string; `min-w-0` on the two grid
  children fixed it. This does not bite in the dashboard because `ItemRow` sits in plain
  block flow there, not a grid track. Verified signed in and out across all four paths,
  credentials sign-in through both the UI and the raw callback, sign-out landing on
  `/sign-in`, 390px with no overflow, reduced motion running zero animations with every
  section visible and the typing frozen, and a visible focus ring on every focusable
  element. Out of scope by decision: a pricing / Free vs Pro section, since Pro gating is
  display-only and would advertise limits nothing enforces. Merged to `main` via
  `feature/landing-page`.
- **2026-08-04 — Email verification on register (Resend).** Registering with
  email/password now sends a verification email through Resend; credentials sign-in is
  blocked until the link is clicked. GitHub OAuth is untouched. Installed `resend@6.18.1`
  and added `AUTH_URL` + `EMAIL_FROM` to both env files. **Storage is a new
  `EmailVerificationToken` model** (migration `add_email_verification_token`), not the
  adapter's existing `VerificationToken` table: `@auth/prisma-adapter`'s
  `createVerificationToken` writes only `identifier`/`token`/`expires`, so a `userId`
  added there would have to be nullable — and a non-null FK with `onDelete: Cascade` was
  the whole point. `VerificationToken` stays (0 rows) because the adapter calls
  `prisma.verificationToken.*`, so deleting the model would break those methods the moment
  magic-link sign-in is added. The emailed value is 32 random bytes base64url and only its
  **sha256** is stored, so a DB read cannot be replayed into a takeover; TTL 24h.
  **Consumption stamps `usedAt` instead of deleting the row** — that single column is what
  makes "already verified" a real state on a second click rather than collapsing into
  "invalid", giving four distinguishable outcomes (`verified` / `already-verified` /
  `expired` / `invalid`). Creating a token deletes that user's prior rows, so growth is
  bounded at ~1 row per user. Consumption is race-safe: a conditional
  `updateMany({ where: { usedAt: null } })` inside an interactive transaction claims the
  token, and only a winning claim sets `User.emailVerified`, so two simultaneous clicks
  cannot double-verify. **The sign-in gate lives in `authorize`, conditioned on
  `user.password && !user.emailVerified`** and placed *after* `bcrypt.compare` so the
  constant-time decoy-hash behaviour from phase 2 survives. It must not be a blanket
  `emailVerified` check: the existing GitHub account has `emailVerified = null` and a
  blanket check would have locked it out — verified by completing a live OAuth round trip
  after the change. "Not verified" surfaces without leaking via
  `EmailNotVerifiedError extends CredentialsSignin` with `code: "EmailNotVerified"`;
  confirmed against the `@auth/core` source that the instance survives unwrapped
  (`callback/index.js` rethrows `AuthError` as-is, and `Auth()` rethrows the original when
  `raw` and not `isRedirect`, which is exactly how next-auth's server-side `signIn` calls
  it). Safe to reveal because the correct password was already supplied. Resend's client
  **throws when the key is absent**, so `src/lib/email/resend.ts` is a lazy singleton —
  constructing at import time would crash `next build`. The email is a plain dark HTML/text
  template matching the app's tokens, with the user-supplied name HTML-escaped.
  `POST /api/auth/verify-email/resend` returns an identical generic 200 for unknown,
  already-verified and malformed input, with a 60-second cooldown off the newest row's
  `createdAt`; the button gives client-side feedback so the server never has to leak a 429.
  Registration still returns 201 when the send fails. New pages `/verify-email` and
  `/register/check-email` reuse `AuthCard`, which gained an optional `icon` prop (centred
  header) plus a shared `AuthIcon`; the dead `/sign-in?registered=1` banner was removed
  since `RegisterForm` now lands on the check-email page. Verified end to end against the
  development branch, including a **real delivery**: Resend has no verified domain, so it
  only accepts `susicharis99@gmail.com` — already taken by the GitHub user — so rather than
  mutate that row the test exploited `sendVerificationEmail` taking the recipient
  separately from the user id; the mail was delivered (`last_event: opened`), its link
  extracted from the delivered HTML and clicked, landing on the success state with
  `emailVerified` and `usedAt` stamped identically. Also covered: gate before/after
  verification, wrong password still generic, all four page states, cooldown measured at
  the boundary (call A sent, immediate call B blocked), and the seeded demo user. One
  defect found by measuring: `/register/check-email` overflowed to 434px on a 390px
  viewport because a long email address is a single unbreakable token — `break-words` on
  `AuthCard`'s description fixes it for every consumer. Production intentionally left with
  the migration pending for `db:deploy`; ⚠️ `AUTH_URL` must be set to the real origin in
  the Vercel dashboard or production links point at localhost. Merged to `main` via
  `feature/email-verification`.
- **2026-08-05 — Forgot password (Resend reset links).** A "Forgot password?" link on
  `/sign-in` leads to `/forgot-password`, which emails a one-hour reset link;
  `/reset-password?token=…` collects the new password and ends on a success card.
  **No migration** — tokens reuse the `VerificationToken` table left empty by the
  verification feature, with `identifier` namespaced as **`password-reset:{email}`**. The
  prefix is load-bearing twice over: it stops a future NextAuth Email provider from
  consuming our rows (and us from consuming its), and it is where the user's email is read
  back from, which is why no `userId` column is needed. Only the **sha256** of the emailed
  value is stored (32 random bytes base64url), TTL **1 hour** — deliberately shorter than
  verification's 24h because this token grants takeover, not a flag flip. The 60-second
  request cooldown derives creation time as `expires - 1h`, exact because the TTL is fixed
  and the table has no `createdAt`. Losing `usedAt` costs nothing here: a consumed reset
  link *must* die, so used / expired / unknown all collapse into one "link no longer valid"
  state, unlike verification where "already verified" was worth distinguishing.
  **GET validates but does not consume — the opposite of `/verify-email`.** There a link
  scanner burning the token was harmless; here it would strand the user at a dead form
  before they typed anything, so the page validates on GET and the POST consumes.
  **The same-password check runs before the claim**, for the same reason: if the token were
  spent first, typing your existing password would cost you the link and force another
  email. Verified — after three rejections the row was still present and the same link then
  worked. That check is why `consumePasswordResetToken` takes the **plaintext** and hashes
  internally; hashing in the route burned ~200 ms of bcrypt before we knew the token was
  even valid, and made the comparison impossible. It returns a union
  (`reset | invalid | same-password`) rather than a boolean so the compiler catches an
  unhandled case. Case and whitespace variants are *not* "the same password" — bcrypt
  compares bytes — and sign-in agrees: after resetting to a space-padded password, the
  padded form signs in and the unpadded one fails. Consumption is race-safe via
  `deleteMany` returning `count === 1` as the claim, inside an interactive transaction;
  rollback needs a **throw**, not a `return`, which an early version got wrong and would
  have spent a token without writing a password. A completed reset also stamps
  `emailVerified` when null — finishing a reset proves inbox control, the same proof
  `/verify-email` demands, and without it a user could reset and still be locked out by the
  phase-2 sign-in gate. It only fills a null, never overwrites an existing timestamp.
  **OAuth-only accounts get the generic response and no email**: setting a first password
  would silently convert the account, and with `emailVerified = null` the gate would block
  the sign-in they just configured. Unknown, OAuth-only, throttled and malformed input all
  return an identical 200. Dedupe: `sendEmail()` / `buildAppUrl()` in
  `src/lib/email/send-email.ts` and a shared dark `renderEmail()` layout now back both
  emails (escaping lives in one place, verified the user-supplied name is still escaped),
  and `src/lib/auth/password.ts` owns `hashPassword` / `verifyPassword` at 12 rounds,
  replacing the constant in `register`, this flow and `src/auth.ts`'s decoy compare;
  `prisma/seed.ts` keeps its inline hash to avoid the `loadEnvConfig` import-order trap.
  `AuthCard` gained a `labelAction` slot on `AuthField` for the inline link. Verified all
  14 checklist points against the development branch including a **real delivery** —
  Resend accepted it (`delivered`), the link was pulled out of the delivered HTML and
  opened, though not submitted, so the tester's own password was left alone. Two defects
  found by measuring: (1) JSX dropped the space between `{message}` and the following text,
  rendering "on its way.The link expires", fixed with an explicit `{" "}`; (2) after a
  successful reset the card header still read "Choose a new password" above "Your password
  has been updated", because the header was server-rendered while only the children
  swapped — the whole card moved into the client component so each state owns its header.
  Deliberately unfixed and recorded: **existing JWT sessions survive a password reset**,
  since there is no server-side revocation; that needs a `passwordChangedAt` check in the
  `jwt` callback or database sessions. Merged to `main` via `feature/forgot-password`.
- **2026-08-05 — Profile page (`/profile`) with usage stats, change password and delete
  account.** The sidebar avatar has linked to `/profile` since auth phase 3 and 404'd until
  now. **No migration** — `User.createdAt` was already in the `init` migration, so the
  "joined" date needed nothing new (an early read of the spec wrongly assumed otherwise).
  **The shell moved into an `(app)` route group**: `app/dashboard/layout.tsx` →
  `app/(app)/layout.tsx` and `app/dashboard/page.tsx` → `app/(app)/dashboard/page.tsx`, so
  `/profile` inherits the sidebar + top bar with **no URL change** (`ƒ /dashboard` and
  `ƒ /profile` both in the build, `○ /` still prerendered). The alternative — a second
  `profile/layout.tsx` rendering a shared `AppShell` — was rejected because it leaves two
  layouts to keep in sync; the route group also means every future app route (`/items`,
  `/collections`) gets the shell for free. Protection is one more entry in the
  **`src/proxy.ts` allowlist**, not a negative pattern, per the phase-1 reasoning.
  `src/lib/db/profile.ts` **maps `password` to a `hasPassword` boolean inside the query
  function**, so the bcrypt hash never crosses into a client component — that single boolean
  drives both the account badge and whether the change-password section renders. It keys off
  `password != null`, the same signal `authorize` and the forgot-password flow use for "email
  account"; the badge therefore *infers* provenance, which is correct only because nothing
  links a password and a GitHub account to one row today (no auto-linking, and reset is
  refused for OAuth-only accounts). **Mutations are Server Actions, not API routes**
  (`src/actions/account.ts`), inverting the choice made for register / verify / reset: those
  needed real status codes for unauthenticated callers, whereas these are authenticated
  mutations with no external clients, and `signOut()` after a delete *requires* an action
  context. The delete uses **`deleteMany` rather than `delete`** so a row already gone is not
  an error, and `signOut()` sits **outside** the try/catch — catching it would swallow
  `NEXT_REDIRECT`, the same trap documented for `signInWithCredentials`. Cascade verified
  empirically: deleting the account took its item, collection and `EmailVerificationToken`
  with it. **The "new password must differ" check compares plaintext and runs before any
  hashing**, mirroring the same-password check in the reset flow — cheap, exact, and it
  cannot be expressed after hashing. `getSidebarItemTypes` gained a React `cache` wrapper so
  the layout and the profile page share one query pair per request instead of running the
  per-type counts twice — the same dedupe `fetchUserCollections` already had. Reuse over new
  code throughout: `UserAvatar`, `StatCard`, `ItemTypeIcon`, `AuthField`/`AuthError`,
  `getDashboardStats`, and `hashPassword`/`verifyPassword`. Installed ShadCN `alert-dialog`.
  Verified against the development branch: wrong current password rejected; mismatch and
  new-equals-current caught per field; a successful change **rotated the hash and the old
  password then failed at the credentials callback while the new one signed in** (reverted to
  the seed credential afterwards); a throwaway account deleted itself, redirected to `/`, and
  cascaded; per-user scoping confirmed (throwaway showed 1/1 while the demo user showed
  18/5); the OAuth branch (`password = NULL`) flipped the badge and hid the form; unauthenticated
  `/profile` → 307 `/sign-in?callbackUrl=%2Fprofile`; and a **stale JWT whose user row was
  deleted** → 307 `/sign-in` with no render crash — the guard that the `fix/empty-database-render`
  entry exists to prevent. 390px shows no horizontal overflow and no truncated text. Three
  defects found by measuring rather than looking: (1) **a failed delete was invisible** —
  `preventDefault()` on the confirm keeps the dialog open, but `AuthError` was a sibling of
  `<AlertDialog>` in normal page flow and therefore rendered *beneath* the portaled `z-50`
  overlay, so the user would see a re-enabled button and no reason; it moved inside
  `AlertDialogContent` and now clears when the dialog closes. (2) The same fix closed a
  **double-submit window**: `isPending` was reset in `finally`, re-enabling the button while
  the post-delete redirect was still in flight. (3) Chrome flagged the change-password form
  for having **no username field**, so password managers could not associate the entry — a
  hidden `autoComplete="username"` input carrying the email fixes it. Also: the Collections
  stat card truncated to "Coll…" at 390px, so the two cards now stack on mobile. Deliberately
  not addressed and worth remembering: **existing JWT sessions survive a password change**
  (observed directly — the same unfixed limitation as the reset flow, needing
  `passwordChangedAt` in the `jwt` callback or DB sessions); **no rate limit on the
  current-password check**, acceptable because an attacker needs a valid session first, at
  which point they already have full access; and a GitHub user has **no path to set a first
  password**, since the spec scopes the form to email accounts. Testing caveat: Playwright's
  real click/keypress delivery broke partway through the session (`evaluate` kept working),
  so the sidebar avatar → `/profile` link and the dialog buttons were confirmed via
  DOM-dispatched events with React handling them rather than genuine mouse input, and the
  server-side guard blocking a password change on an OAuth account is present but was never
  driven end to end. Merged to `main` via `feature/profile-page`.
