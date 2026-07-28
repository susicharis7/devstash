# Landing Page — Public Home at `/`

## Overview

Replace the `/` stub (currently just an `<h1>DEVSTASH</h1>`) with a real public landing
page: what DevStash is, what it holds, a preview of the product using representative
sample content, and clear paths to Sign in and Create account. This is the page the
deployed default domain shows to someone who has never signed in.

## Requirements

### Route

- `src/app/page.tsx` — public, **must stay static**. No `auth()`, no `connection()`, no
  Prisma. The build output must still list `○ /` as prerendered.
- Components live in `src/components/landing/`.
- **A visitor who already has a valid session never sees this page** — they are redirected
  to `/dashboard`. See "Signed-in redirect" below; this is done in `src/proxy.ts`, not in
  the page, so `/` stays static.
- Update the root `metadata` in `src/app/layout.tsx`: real title and description plus
  Open Graph / Twitter fields. It currently says "DevStash application", which is now
  public-facing.

### Sections, in order

1. **Nav bar** — DevStash wordmark with the `Layers` mark, a "Sign in" ghost link to
   `/sign-in`, and a primary "Create account" button to `/register`. Sticky on scroll.
2. **Hero** — headline, one-sentence subhead, the same two CTAs, and an animated
   retrieval mock (see Animations). The single job of this section: say what the product
   is and let the visitor start in one click.
3. **The seven types** — a row/grid of the system item types, each with its real icon and
   color, and a one-line description of what belongs in it. `file` and `image` carry the
   existing `PRO` treatment.
4. **Product preview** — a static, non-interactive mock of the dashboard: a few sample
   item cards with type-colored left borders, tags, and a pinned marker, plus two or
   three collection cards. Visual language must match the real `ItemRow` /
   `CollectionCard` so the preview is honest about what the app looks like.
5. **What you can do** — short feature list drawn from `context/project-overview.md`:
   search across content/tags/titles/types, collections an item can belong to many of,
   favorites and pinning, recently used, markdown editing, import from file, export.
6. **Closing CTA** — one more "Create account", with "Already have an account? Sign in".
7. **Footer** — copyright, a GitHub link using the existing `GitHubIcon`.

### Signed-in redirect

If the request carries a valid session token, `/` redirects to `/dashboard`.

- **Do this in `src/proxy.ts`, not in the page.** Calling `auth()` inside
  `src/app/page.tsx` would make `/` dynamic and throw away the static render for every
  anonymous visitor. The proxy runs before the response is served, so anonymous traffic
  still gets the prerendered page and signed-in traffic never reaches it.
- Add `"/"` to the matcher. It must be an exact match — `"/"` matches only the root, not
  every path.
- **The proxy's logic becomes path-aware**, because the two cases are opposites. Today it
  is "no session → `/sign-in`" for every matched path; adding `/` to that unchanged would
  send anonymous visitors from the landing page to sign-in, which is exactly wrong. It
  needs to branch:
  - `/dashboard*` — no session → redirect to `/sign-in` with `callbackUrl` (current
    behaviour, unchanged)
  - `/` — session present → redirect to `/dashboard`; no session → continue to the page
- The check is cookie-only and costs no database round trip: the session is a JWT and
  `src/proxy.ts` initializes NextAuth from `src/auth.config.ts`, which has no adapter. An
  expired or tampered token fails verification and counts as no session, so the visitor
  correctly stays on the landing page.
- **`/sign-in` and `/register` get the same treatment** — confirmed. All three paths sit in
  one `SIGNED_OUT_ONLY` set, so a signed-in visitor is never left on a sign-in form. Use a
  **303** for this redirect rather than the default 307: normal arrivals are GETs either
  way, but a stale form submitted from a second tab would be a POST and 307 preserves the
  method, whereas 303 correctly turns it into a GET of `/dashboard`.
- Adding `/sign-in` to the matcher does **not** break signing in. The Server Action posts
  to `/sign-in` while the visitor still has no session, so it passes through; the OAuth
  round trip returns to `/api/auth/callback/github`, which the matcher does not cover; and
  sign-out clears the cookie before the browser requests `/sign-in`. All four flows are
  covered by the tests below.

### Animations

- **On load:** staggered fade-and-rise for the hero — eyebrow, headline, subhead, CTAs,
  then the mock. One orchestrated sequence, not scattered effects.
- **Hero mock:** a search field with a blinking caret that cycles through a few real
  queries (`port`, `docker prune`, `useDebounced`) and reveals matching sample rows
  beneath. This is the page's signature moment — the product's whole job is recall.
- **On scroll:** each section reveals once as it enters the viewport.
- **On hover:** item cards lift slightly and their type color intensifies.
- No new dependency. `tw-animate-css` is already installed and provides `animate-in`;
  everything else is plain `@keyframes` in `globals.css` or Tailwind utilities.
- Every animation must be wrapped so `prefers-reduced-motion: reduce` leaves the page
  fully legible and static — per the project's quality floor.

## Notes

- **Sample content is local to the landing page.** Put it in one
  `src/components/landing/landing-content.ts` (or inline consts) — do **not** recreate
  `src/lib/mock-data.ts`, which was deliberately deleted once the app went DB-backed, and
  do not query the database for marketing copy. Keeping it local is what keeps `/` static.
- **Type colors and icons come from `src/lib/item-types.ts`** via `SYSTEM_ITEM_TYPES` and
  `ItemTypeIcon`. Never restate a hex value. `ItemTypeIcon` has no `'use client'`, so it
  works inside a static server component.
- **Scroll-triggered reveals need a decision.** `tw-animate-css` only covers enter/exit
  states. Two options: CSS scroll-driven animations (`animation-timeline: view()`) behind
  an `@supports` guard, which needs no JavaScript and degrades to simply-visible on
  unsupported browsers; or a small `'use client'` IntersectionObserver wrapper. Prefer the
  CSS route — it keeps the page a pure server component. If the cycling hero mock needs
  state, that one component may be `'use client'`; nothing else should be.
- **The page is dark-only.** `<html>` has a hardcoded `dark` class in the root layout, so
  there is no light variant to design for here.
- **The nav still says "Sign in" / "Create account" unconditionally.** Because the
  signed-in case is handled by a redirect in the proxy, the page itself never renders for
  an authenticated visitor, so there is no personalized state to build and no reason to
  read the session inside the page.
- Fonts are Geist Sans and Geist Mono, already loaded in the root layout via `next/font`.
  Use the mono face for queries, tags, and code samples.
- Copy follows `context/coding-standards.md` and the writing rules already applied in the
  auth pages: sentence case, active voice, specific over clever. Buttons say what happens
  — "Create account", not "Get started free".

## Out of scope

- Pricing / Free vs Pro comparison — Pro gating is display-only today and all types are
  accessible during development. A pricing section would advertise limits that are not
  enforced.
- `/profile`, which the sidebar already links to and which still 404s.
- Any change to `/dashboard` or to the auth pages' own markup. `src/proxy.ts` **is** in
  scope, but only to add the `/` matcher entry and the path branch described above — the
  existing `/dashboard` protection must behave identically afterwards.

## Testing

1. Signed out, `/` renders the full page with no console errors.
2. `npm run build` still reports `○ /` (static). If it flips to `ƒ`, something introduced
   a dynamic call and must be removed.
3. "Sign in" navigates to `/sign-in`; both "Create account" buttons navigate to
   `/register`.
4. Signed in, visiting `/` redirects to `/dashboard` (expect a 307, same as the existing
   `/dashboard` → `/sign-in` behaviour).
5. Signed out, `/dashboard` still redirects to `/sign-in?callbackUrl=%2Fdashboard` — proof
   the proxy's new branch did not break the old one.
6. After signing out, `/` is reachable again and renders the landing page.
7. At 390px wide: nav collapses sensibly, no horizontal page scroll, hero mock stays
   readable.
8. With reduced motion enabled, every section is visible and no animation runs.
9. Keyboard only: tab through nav and CTAs, focus is visible on each.
10. `npm run lint` and `npx tsc --noEmit` clean.

## References

- `context/project-overview.md` — feature list, type table, UI direction (Notion / Linear
  / Raycast), type colors and icons
- `src/lib/item-types.ts` — the single source for type name, icon, color, `isPro`
- `src/components/dashboard/ItemRow.tsx`, `CollectionCard.tsx` — the visual language the
  preview mock should match
- `src/components/auth/AuthCard.tsx` — existing public-page shell and spacing conventions
