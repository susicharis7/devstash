# Current Feature: Email Verification on Register

## Status

In Progress

## Goals

- Registering with email/password sends a verification email via **Resend**
  containing a one-click link; the account cannot sign in until that link is clicked.
- Clicking the link lands on a **branded `/verify-email` page** that matches the
  existing auth UI (`AuthCard` shell, dark-first, same tokens) and shows a clear
  success / expired / invalid / already-verified state with the right next action.
- Unverified credentials users get a specific "verify your email" message on sign-in
  (not the generic "Invalid email or password"), with a **Resend email** button.
- GitHub OAuth sign-in is unaffected — it must keep working with no verification step.
- Tokens are single-use, expiring, and stored hashed; the flow leaks no information
  about which emails are registered.
- `npm run build` passes and the whole flow is verified end to end in the browser
  against the **development** Neon branch.

## Notes

### Decisions

**Token storage — new `EmailVerificationToken` model. One migration.**

The existing `VerificationToken` table (from `init`, verified empty on the dev branch:
`identifier`/`token`/`expires`, unique `token`, unique `(identifier, token)`, 0 rows)
was the obvious candidate, and it stays exactly as it is. We are not extending it,
for one concrete reason: `@auth/prisma-adapter`'s `createVerificationToken` writes only
those three columns, so any `userId` added there would have to be **nullable** — and a
non-null `userId` FK with cascade delete is the whole point of migrating. Extending it
would also mean re-checking our semantics against the adapter's contract on every
`@auth/*` upgrade, and would leave our rows sharing a table (and a `token` unique index)
with magic-link rows if the Email provider is ever added. A separate table costs one
`CREATE TABLE` and removes all of that.

```prisma
model EmailVerificationToken {
  id        String    @id @default(cuid())
  token     String    @unique   // sha256 hex of the emailed value, never the raw token
  userId    String
  expires   DateTime
  createdAt DateTime  @default(now())
  usedAt    DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

- Raw token = 32 random bytes, base64url; only its **sha256** is stored, so a DB read
  cannot be replayed into an account takeover.
- `expires` = now + **24 hours**.
- **Consumption sets `usedAt`, it does not delete the row.** This is what makes
  "already verified" a real, distinguishable state instead of collapsing into "invalid"
  on a second click — the single reason `usedAt` exists.
- `createdAt` gives the resend cooldown an honest timestamp instead of deriving one
  from `expires`.
- Requesting a new link **deletes** that user's prior rows (used or not), so at most one
  live token exists per user and used rows don't accumulate.
- `onDelete: Cascade` means no orphans when an account is deleted.

Migration via `npm run db:migrate` only, name `add_email_verification_token`
(per CLAUDE.md — never the Neon MCP migration tools).

**Four distinguishable outcomes**, each with its own page state:
`verified` · `already-verified` (row found, `usedAt` set) · `expired` (row found,
past `expires`) · `invalid` (no such token).

**Verification consumes on GET.** `/verify-email?token=…` is a server component that
verifies and marks the user, then renders the result. Known tradeoff: a corporate link
scanner can consume the token before the human clicks. Accepted — it's the flow the
spec asks for, and the "already verified" and "expired → resend" states cover the fallout.

**Sign-in gating lives in `authorize` (`src/auth.ts`), not in a global check.**
Gate condition is `user.password && !user.emailVerified`. OAuth users have no password,
so GitHub never hits it — this is why gating must not be a blanket `emailVerified` check.
Confirmed against the dev branch: the existing GitHub account
(`susicharis99@gmail.com`, provider `github`, no password) has `emailVerified = null`,
so a blanket check would lock it out today. The check runs **after** `bcrypt.compare`
succeeds, preserving the constant-time decoy-hash behaviour from auth phase 2.

**Surfacing "not verified" without leaking.** `authorize` throws a custom error extending
`CredentialsSignin` with `code: "EmailNotVerified"`; `signInWithCredentials` in
`src/actions/auth.ts` maps that code to a specific message and keeps returning the generic
`INVALID_CREDENTIALS` for everything else. Safe to reveal, because the correct password was
already supplied.

**Base URL.** No `AUTH_URL` / app-URL var exists today. Add `AUTH_URL` to
`.env.development` (`http://localhost:3000`) and `.env.production` — NextAuth v5 already
understands the name, and the link builder reads it with a fallback to the request origin.

**Sender address.** Add `EMAIL_FROM`, defaulting to `DevStash <onboarding@resend.dev>`.
⚠️ **Constraint to confirm before testing:** Resend's shared `onboarding@resend.dev` sender
only delivers to the email address that owns the Resend account. Real delivery to arbitrary
addresses needs a verified domain in Resend. Decide which we're using when we get to testing.

**Email template:** plain HTML + text strings in `src/lib/email/templates/` — no
`react-email` dependency for one transactional email.

### Implementation outline

1. `npm i resend`; add `AUTH_URL` + `EMAIL_FROM` to both env files.
2. Prisma: add `EmailVerificationToken` + the relation field on `User`;
   `npm run db:migrate` → `add_email_verification_token`. Then
   `prisma migrate status` against both branches before committing.
3. `src/lib/email/resend.ts` — lazy Resend client singleton (must not construct at
   import time; the key is absent during `next build`).
4. `src/lib/email/send-verification-email.ts` — create token, build the absolute URL,
   send. Errors are logged, never thrown into the registration response.
5. `src/lib/auth/verification-tokens.ts` — `createVerificationToken(userId)` (deletes
   the user's prior rows first) and `consumeVerificationToken(raw)` returning a
   discriminated `verified | already-verified | expired | invalid`. The verify path is
   one transaction: set `User.emailVerified` and stamp `usedAt` together.
6. `POST /api/auth/register` — after `user.create`, send the email. Registration still
   returns 201 if the send fails (the account exists; the user can resend).
7. `POST /api/auth/verify-email/resend` — generic 200 regardless of whether the email
   exists or is already verified; 60-second cooldown off the newest row's `createdAt`.
8. `src/app/verify-email/page.tsx` — server component, consumes the token, renders one
   of the four states through `AuthCard` + a small `VerificationResult` component
   (icon + heading + body + primary action). No second `return` branch inside one
   component (coding standards) — state → content map.
9. `RegisterForm` → redirect to `/register/check-email?email=…` ("we sent you a link",
   with a resend button) instead of today's `/sign-in?registered=1`.
10. `src/auth.ts` gate + `src/actions/auth.ts` error mapping + a resend affordance on
    the sign-in error.
11. `src/proxy.ts` — no change needed: the matcher is an allowlist, so `/verify-email`
    and `/register/check-email` are already public and unintercepted. Confirm during testing.

### Testing checklist

1. Register a new account → 201, email arrives, `emailVerified` is null in the DB.
2. Sign in before clicking → blocked with the specific "verify your email" message.
3. Click the link → `/verify-email` success state, `emailVerified` set, `usedAt` stamped
   (the row is kept, not deleted — that is what preserves the already-verified state).
4. Sign in after verifying → reaches `/dashboard`.
5. Reuse the same link → **already verified** state (not an error), with a **Sign in** action.
6. Tampered / unknown token → **invalid** state, distinct from the above.
7. Expired token (backdate `expires` in the DB) → expired state with a working resend.
8. Resend endpoint: generic response for unknown and already-verified emails; second
   call inside 60s is throttled.
9. GitHub OAuth sign-in still works end to end and needs no verification — the existing
   `susicharis99@gmail.com` account has `emailVerified = null` and must stay able to sign in.
10. Seeded demo user (`emailVerified` already set at `prisma/seed.ts:287`) can still sign in.
11. `/verify-email` renders correctly at 390px and in reduced-motion.
12. `npm run build` passes.

### Out of scope

- **Dropping the `VerificationToken` table — keep it.** It is the NextAuth adapter's own
  table, listed as required in the adapter schema, and `@auth/prisma-adapter` calls
  `prisma.verificationToken.*` in `createVerificationToken` / `useVerificationToken`.
  Removing the model would delete that delegate from the generated client, breaking those
  adapter methods (and likely the `PrismaAdapter(prisma)` typecheck) the moment we add
  magic-link or passwordless sign-in. It holds 0 rows and costs nothing to keep, so
  dropping it is a destructive migration for no gain.
- A scheduled sweep of used/expired `EmailVerificationToken` rows. Creating a new token
  already deletes that user's prior rows and account deletion cascades, so growth is
  bounded at ~1 row per registered user.
- Password reset emails (same Resend plumbing, separate feature).
- Verifying emails for existing OAuth accounts.
- Blocking unverified users at the proxy/dashboard layer — the sign-in gate is enough,
  since credentials sign-in is the only way in for these accounts.

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
