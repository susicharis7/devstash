# 🏗️ Item CRUD Architecture

A unified create / read / update / delete system covering all **7 item types** with one action
file, one dynamic route, and shared components that adapt by type.

> ⚠️ **This is a design document, not a description of shipped code.** Nothing in
> `src/actions/items.ts`, `src/app/(app)/items/` or `src/components/items/` exists yet. Everything
> marked ✅ below already exists and is reused; everything marked 🆕 is proposed.
>
> Companion reading: [docs/item-types.md](docs/item-types.md) — the type/data-kind reference this
> design is built on.

---

## 🎯 The central idea

There are 7 types but only **3 data kinds**. Almost all "type-specific" behaviour is really
*kind*-specific, and the rest is pure presentation (icon, color, labels):

```
7 types  ──collapse to──►  3 data kinds  ──drive──►  3 field components
─────────────────────────────────────────────────────────────────────────
snippet ┐
prompt  ├─────────────►  TEXT  ─────────────►  <TextFields />
command │
note    ┘
link    ──────────────►  URL   ─────────────►  <UrlFields />
file    ┐
image   ┴─────────────►  FILE  ─────────────►  <FileFields />
```

So the split is:

| Layer | Knows about types? | What it branches on |
|---|---|---|
| 🗄️ **`lib/db`** | ❌ no | nothing — queries filter by `itemTypeId` |
| ⚙️ **`actions`** | ⚠️ minimally | the **data kind**, to pick a Zod variant and derive `contentType` |
| 🧩 **`components`** | ✅ yes | data kind (which fields) + type identity (icon, color, copy) |

**Type-specific logic lives in components, never in mutations.** The action never says
`if (type === "snippet")`. The most it does is `switch (dataKind)` across three branches, and even
that is expressed as a Zod discriminated union rather than hand-written control flow.

---

## 📁 File structure

```
src/
├── actions/
│   └── items.ts                     🆕 ALL mutations (create/update/delete/pin/favorite)
│
├── lib/
│   ├── item-types.ts                ✅ + 🆕 slug ↔ name ↔ data-kind lookups
│   ├── db/
│   │   ├── items.ts                 ✅ + 🆕 getItemsByType, getItemById, countUserItems
│   │   ├── collections.ts           ✅ unchanged
│   │   └── current-user.ts          ✅ unchanged
│   └── validations/
│       └── item.ts                  🆕 Zod schemas (discriminated union on data kind)
│
├── types/
│   └── action.ts                    🆕 shared ActionResult<T> (lifted out of actions/account.ts)
│
├── app/(app)/
│   └── items/
│       └── [type]/
│           └── page.tsx             🆕 the ONE dynamic route
│
└── components/
    └── items/
        ├── ItemsHeader.tsx          🆕 server — title, icon, count, "New" button
        ├── ItemList.tsx             🆕 server — maps to ItemRow
        ├── ItemsEmptyState.tsx      🆕 server — per-type empty copy
        ├── ItemDrawer.tsx           🆕 client — Sheet; view + edit, URL-driven
        ├── ItemForm.tsx             🆕 client — shared envelope + <ItemFields />
        ├── ItemFields.tsx           🆕 client — picks one of the three below by kind
        ├── fields/TextFields.tsx    🆕 client — content + language
        ├── fields/UrlFields.tsx     🆕 client — url
        ├── fields/FileFields.tsx    🆕 client — upload (PRO, deferred)
        ├── ItemActions.tsx          🆕 client — pin / favorite / delete
        └── DeleteItemDialog.tsx     🆕 client — AlertDialog confirm
```

**Why this shape**

- 📌 **Mutations in `src/actions/`, queries in `src/lib/db/`** — this is the split the codebase
  already uses ([src/actions/account.ts](src/actions/account.ts) mutates,
  [src/lib/db/items.ts](src/lib/db/items.ts) reads) and it matches
  [coding-standards.md](context/coding-standards.md).
- 📌 **Server Actions, not API routes.** The standards reserve API routes for webhooks, upload
  progress, long operations and external clients. Item CRUD is none of those — it's authenticated
  mutations with no outside callers, exactly the case `account.ts` already settled. ⚠️ The one
  exception is **file upload**, which needs progress tracking and therefore *does* want an API
  route (`/api/items/upload`) — deferred with the rest of Pro.
- 📌 **Server components fetch directly.** `page.tsx` calls `getItemsByType()` with no fetch layer.

---

## 🧭 How `/items/[type]` routing works

### The URL contract

The sidebar already links to `/items/{name}s` — `slug` is the **pluralized type name**, derived in
[`getSidebarItemTypes()`](src/lib/db/items.ts), not stored:

```
/items/snippets   /items/prompts   /items/commands   /items/notes
/items/files      /items/images    /items/links
```

Item detail does **not** get its own route. The project overview specifies a *quick-access drawer*,
so the open item is a **search param on the same page**:

```
/items/snippets?item=clx123…     → list + drawer open on that item
/items/snippets?new=1            → list + drawer open on a blank create form
```

This keeps one route, makes drawer state shareable and back-button-friendly, and means the
underlying list never unmounts when you open an item.

### Slug resolution

Add to [src/lib/item-types.ts](src/lib/item-types.ts) 🆕:

```ts
export type DataKind = "TEXT" | "URL" | "FILE";

export const DATA_KIND_BY_TYPE: Record<string, DataKind> = {
  snippet: "TEXT", prompt: "TEXT", command: "TEXT", note: "TEXT",
  link: "URL",
  file: "FILE", image: "FILE",
};

export const typeSlug = (name: string) => `${name}s`;
export const SYSTEM_TYPE_BY_SLUG = new Map(
  SYSTEM_ITEM_TYPES.map((type) => [typeSlug(type.name), type])
);
```

Both `getSidebarItemTypes()` and the route then share one pluralization rule instead of restating
`+ "s"` in two places.

### The page

```tsx
export default async function ItemsPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ item?: string; new?: string }>;
}) {
  await connection();
  const { type: slug } = await params;

  const itemType = await resolveItemTypeBySlug(slug);
  if (!itemType) notFound();

  const items = await getItemsByType(itemType.id);
  // …
}
```

⚠️ **Next.js 16: `params` and `searchParams` are Promises** and must be awaited — the synchronous
form from older Next is gone.

Three routing details worth getting right:

1. 🔒 **Add `/items/:path*` to the proxy matcher.** [src/proxy.ts](src/proxy.ts) uses an explicit
   allowlist (`/dashboard`, `/profile`, …), not a negative pattern. A new route is unprotected
   until it's listed — this is the single easiest thing to forget.
2. 🚫 **`notFound()` on an unknown slug**, so `/items/widgets` 404s instead of rendering an empty
   list that looks like "you have no widgets".
3. 🔁 **No `generateStaticParams`.** The page is per-user and already dynamic via `connection()`;
   pre-generating params would buy nothing.

`resolveItemTypeBySlug` checks `SYSTEM_TYPE_BY_SLUG` first, then falls back to a DB lookup scoped
to the current user — which is what makes custom (Pro) types work later with no routing change.

---

## ⚙️ Mutations — `src/actions/items.ts`

One file, five exported actions, all returning the project's standard shape.

| Action | Signature | Notes |
|---|---|---|
| ➕ `createItem` | `(input: unknown) => ActionResult<{ id: string }>` | validates, derives `contentType`, checks quota |
| ✏️ `updateItem` | `(id: string, input: unknown) => ActionResult` | ownership-checked; type is immutable |
| 🗑️ `deleteItem` | `(id: string) => ActionResult` | `deleteMany` scoped by `userId` |
| 📌 `toggleItemPin` | `(id: string) => ActionResult` | |
| ⭐ `toggleItemFavorite` | `(id: string) => ActionResult` | |

### The shape every action follows

```
1. auth        getCurrentUserId() → bail if null
2. validate    itemSchema.safeParse(input) → first issue as the message
3. authorize   ownership + Pro gate + free-tier quota
4. mutate      inside try/catch
5. invalidate  refresh()
6. return      { success: true, data } | { success: false, error }
```

Steps 1, 2, 4 and 6 are lifted verbatim from
[`changePasswordAction`](src/actions/account.ts) — same guard, same `safeParse` + first-issue
message, same `try/catch` with a logged error and a generic user-facing string. New code should
not invent a second convention.

### 🔑 Four rules that keep type logic out of this file

**1. `contentType` is derived server-side, never accepted from the client.**

```ts
const contentType = DATA_KIND_BY_TYPE[itemType.name] ?? "TEXT";
```

The item-types research flagged that `contentType` and `itemTypeId` are independent columns with no
DB constraint, so a `link` could be stored as `TEXT`. Deriving it here closes that gap at the only
write path — and it means the client can't get it wrong.

**2. Validation is a discriminated union, so the compiler does the branching.**

`src/lib/validations/item.ts` 🆕:

```ts
const baseItem = z.object({
  itemTypeId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(500).optional(),
  tags: z.array(z.string().trim().min(1)).max(10).default([]),
  collectionIds: z.array(z.string()).default([]),
});

export const itemSchema = z.discriminatedUnion("kind", [
  baseItem.extend({
    kind: z.literal("TEXT"),
    content: z.string().min(1, "Content is required"),
    language: z.string().trim().optional(),
  }),
  baseItem.extend({
    kind: z.literal("URL"),
    url: z.url("Enter a valid URL"),
  }),
  baseItem.extend({
    kind: z.literal("FILE"),
    fileUrl: z.url(),
    fileName: z.string().min(1),
    fileSize: z.number().int().positive(),
  }),
]);
```

⚠️ Use Zod v4 top-level `z.url()` — [validations/auth.ts](src/lib/validations/auth.ts) already had
to switch to `z.email()` because the `z.string().email()` form is deprecated in v4.

The payoff: adding an 8th type that is `TEXT`-kind needs **zero** changes here. Adding a *new kind*
is one more union member, and TypeScript then flags every unhandled `switch`.

**3. The type is immutable after creation.** `updateItem` never touches `itemTypeId`. Changing a
snippet into a link would mean migrating `content` → `url` and nulling fields — a "convert" feature,
not an edit. Keeping it out means `updateItem` never has to re-derive `contentType` or re-pick a
validation variant.

**4. Ownership is a `where` clause, not a read-then-check.**

```ts
const { count } = await prisma.item.updateMany({
  where: { id, userId },       // ← scoping IS the authorization
  data: { isPinned: !current },
});
if (count === 0) return { success: false, error: "Item not found." };
```

`updateMany` / `deleteMany` over `update` / `delete` follows
[`deleteAccountAction`](src/actions/account.ts): a row that's already gone or belongs to someone
else returns `count === 0` instead of throwing, and there's no window between the check and the
write. It also means a missing row and a forbidden row are indistinguishable to the caller, which
is the right answer for someone else's item id.

### 🔁 Cache invalidation

All `(app)` pages call `connection()` and are dynamic, so there is no server cache to bust — but the
**client Router Cache** still holds the previous render. In Next.js 16, call `refresh()` from
`next/cache` at the end of a successful mutation:

```ts
import { refresh } from "next/cache";
```

`refresh()` is Server-Action-only (it throws elsewhere) and is the right tool here because a
mutation affects the item list, the dashboard, *and* the sidebar counts. `revalidatePath()` would
need one call per affected path — and a dynamic path like `/items/[type]` additionally requires the
`type: "page"` argument, which is easy to get wrong.

### 🚧 Gates to wire in `createItem` (foundation now, enforcement later)

| Gate | Rule | Status |
|---|---|---|
| 💰 Free item cap | 50 items total | build the check, leave it open during development |
| 🔒 Pro types | `file` / `image` blocked for free users | today **display-only** — the sidebar badge lies |
| 🔒 Custom types | Pro only | no creation path yet |

Per the project overview, all users get everything during development. Put the check in with a
single `if (!ENFORCE_LIMITS) return` style escape hatch rather than adding it later, so the
Pro cutover is a one-line change rather than an audit.

---

## 🗄️ Queries — `src/lib/db/items.ts`

Extend the existing file; do not start a new one. It already exports `DashboardItem`, the shared
`itemQuery` select and `toDashboardItem`.

| Function | Returns | Notes |
|---|---|---|
| ✅ `getPinnedItems()` | `DashboardItem[]` | existing |
| ✅ `getRecentItems(limit)` | `DashboardItem[]` | existing |
| ✅ `getSidebarItemTypes()` | `SidebarItemType[]` | existing, `cache`d |
| 🆕 `getItemsByType(itemTypeId, opts?)` | `DashboardItem[]` | list page; sort pinned-first then `updatedAt` |
| 🆕 `getItemById(id)` | `ItemDetail \| null` | drawer; full payload + tags + collections |
| 🆕 `countUserItems()` | `number` | quota check for `createItem` |
| 🆕 `resolveItemTypeBySlug(slug)` | `ItemTypeRef \| null` | system map first, then user's custom types |

Two conventions the existing file establishes and the new functions must keep:

- 🔐 **Every query starts `const userId = await getCurrentUserId(); if (!userId) return [];`** —
  never throw. That guard is the entire subject of the `fix/empty-database-render` entry in the
  project history: an earlier version threw on a missing user and turned an unseeded database into
  a Server Components crash.
- 🎯 **Filter on `userId`, not `user: { email }`** — the former uses the existing `@@index([userId])`.

`getItemById` needs a **richer view model than `DashboardItem`**, which deliberately omits
`content` / `url` / `fileUrl` because the dashboard only renders a row. Add a separate
`ItemDetail` interface rather than widening `DashboardItem` — the list page would otherwise ship
every item's full body to a client that only shows the title.

🔁 Wrap `getItemsByType` in React `cache` if the header count and the list both need it, matching
`fetchUserCollections` and `getSidebarItemTypes`.

---

## 🧩 Component responsibilities

### Where the type actually shows up

| Concern | Varies by | Lives in |
|---|---|---|
| Which input fields | **data kind** (3) | `ItemFields` → `TextFields` / `UrlFields` / `FileFields` |
| Icon + accent color | type row (`icon`, `color`) | ✅ `ItemTypeIcon`, inline `style` |
| Page title, empty copy, placeholders | type name (7) | `ItemsHeader`, `ItemsEmptyState`, a copy map |
| Pin / favorite / delete | ❌ nothing | `ItemActions` — identical for all 7 |
| Row layout | ❌ nothing | ✅ `ItemRow` — already type-agnostic |

### Server vs client

```
app/(app)/items/[type]/page.tsx          🖥️  server — resolves type, fetches, composes
├── ItemsHeader                          🖥️  server — icon, name, count, "New" link
├── ItemList                             🖥️  server
│   └── ItemRow (✅ existing)            🖥️  server — border + icon by accentColor
├── ItemsEmptyState                      🖥️  server — shown when items.length === 0
└── ItemDrawer                           💻  client — Sheet, reads ?item= / ?new=
    ├── ItemForm                         💻  client — useActionState → createItem/updateItem
    │   ├── (shared envelope fields)     💻  title · description · tags · collections
    │   └── ItemFields kind={…}          💻  one switch, three branches
    ├── ItemActions                      💻  client — pin / favorite
    └── DeleteItemDialog                 💻  client — AlertDialog
```

Only the drawer subtree is `'use client'`. The list stays a server component, so item bodies never
cross the wire and the page keeps working without JS for reading.

### Per-component contract

| Component | Responsibility | Explicitly NOT its job |
|---|---|---|
| 🖥️ `page.tsx` | Resolve slug → type, `notFound()`, fetch, compose | Any rendering logic |
| 🖥️ `ItemsHeader` | Type icon + pluralized name + count + "New {type}" | Knowing the fields a type has |
| 🖥️ `ItemList` | Map to `ItemRow`; render nothing when empty | Sorting (the query does it) |
| ✅ `ItemRow` | One row: border, icon tile, title, tags, date | Type conditionals — it takes a resolved `icon` + `accentColor` |
| 🖥️ `ItemsEmptyState` | "No snippets yet" + a create CTA | |
| 💻 `ItemDrawer` | Sheet open/close ↔ `?item=` / `?new=`; view vs edit mode | Validation, DB access |
| 💻 `ItemForm` | Envelope fields, `useActionState`, per-field errors, toast | Which payload fields exist |
| 💻 `ItemFields` | `switch (kind)` → one of three | Rendering any input itself |
| 💻 `TextFields` | `content` textarea + `language` picker | |
| 💻 `UrlFields` | `url` input | |
| 💻 `FileFields` | Dropzone + progress (🚧 Pro, deferred) | |
| 💻 `ItemActions` | Optimistic pin/favorite via `useOptimistic` | |
| 💻 `DeleteItemDialog` | Confirm, call `deleteItem`, close drawer | |

### ♻️ Reuse before writing anything new

Already in the repo and directly applicable:

- ✅ [`ItemRow`](src/components/dashboard/ItemRow.tsx), [`ItemTypeIcon`](src/components/dashboard/ItemTypeIcon.tsx), [`FavoriteStar`](src/components/dashboard/FavoriteStar.tsx)
- ✅ [`AuthField`](src/components/auth/AuthField.tsx) / [`AuthError`](src/components/auth/AuthError.tsx) — the label + input + per-field-error pattern. Worth **renaming to a neutral `Field` / `FormError`** if items adopt them, since they're no longer auth-specific.
- ✅ ShadCN `sheet`, `alert-dialog`, `input`, `button`, `badge`, `sonner` — all installed. Likely new: `textarea`, `select`, `label`.
- ✅ [`ActionResult`](src/actions/account.ts) — currently defined inside `account.ts`; lift it to `src/types/action.ts` and widen to `ActionResult<T = void>` rather than declaring a second copy.

### ⚠️ Two traps the profile-page work already hit

Both are recorded in [context/current-feature.md](context/current-feature.md) and apply verbatim to
`DeleteItemDialog`:

1. **Errors rendered outside a portaled dialog are invisible.** `AlertDialogContent` is `z-50` and
   portaled; an error placed as a sibling renders *underneath* the overlay, so a failed delete looks
   like a dead button. Put the error **inside** `AlertDialogContent`.
2. **Reset `isPending` carefully.** Clearing it in `finally` re-enables the button while a redirect
   or close is still in flight, opening a double-submit window.

---

## 🔄 End-to-end flow

**Create**

```
User → /items/snippets → "New snippet" → ?new=1
  └─► ItemDrawer opens with a blank ItemForm
      └─► ItemFields sees kind="TEXT" → TextFields (content + language)
          └─► submit → createItem(input)
              ├─ getCurrentUserId()            → 401-equivalent if null
              ├─ itemSchema.safeParse(input)    → first issue as the message
              ├─ contentType = DATA_KIND_BY_TYPE[name]   ← derived, not trusted
              ├─ quota + Pro gate
              ├─ prisma.item.create({ …, tags, collections })
              ├─ refresh()
              └─ { success: true, data: { id } }
                  └─► drawer closes, list + sidebar counts update
```

**Read** — `page.tsx` → `getItemsByType()` → `ItemList` → `ItemRow`. No client JS involved.

**Update** — `?item=id` → `getItemById` → `ItemForm` prefilled → `updateItem(id, input)` scoped by
`where: { id, userId }`.

**Delete** — `DeleteItemDialog` → `deleteItem(id)` → `deleteMany` → `refresh()` → drawer closes.

---

## ✅ Design decisions, stated plainly

| Decision | Why |
|---|---|
| One action file for all 7 types | Types differ in *fields*, not in *mutation semantics*. Seven files would be seven copies of the same five steps. |
| Server Actions over API routes | Authenticated, no external clients, no progress tracking — the same reasoning that put `account.ts` in `actions/`. ⚠️ File upload is the exception and wants a route. |
| One `[type]` route | The list page is identical for every type; only header copy and empty-state text change. |
| Drawer as a search param, not a route | Matches the spec's "quick-access drawer", keeps URLs shareable, avoids unmounting the list. |
| Branch on **data kind** (3), not type (7) | Cuts the field components from 7 to 3 and makes an 8th `TEXT` type free. |
| Type is immutable after create | A conversion needs field migration; that's a separate feature, not an edit. |
| `contentType` derived server-side | Closes the unvalidated `contentType` ↔ `itemTypeId` gap at the only write path. |
| Zod discriminated union | The compiler enforces exhaustiveness; adding a kind surfaces every unhandled branch. |
| `updateMany` / `deleteMany` with `userId` | Authorization *is* the `where` clause — no check-then-write race, no throw on a missing row. |
| `refresh()` over `revalidatePath()` | One call covers list + dashboard + sidebar; no dynamic-path `type` argument to get wrong. |

---

## 🚧 Deferred / open

- 📎 **File & image upload** — needs Cloudflare R2 plus an API route for progress. `FileFields`
  should be scaffolded but non-functional; both types are Pro and currently unimplemented.
- 🔍 **Search & filter** on the list page (`?q=`, `?tag=`) — the spec wants search over content,
  tags, titles and types; slot it into `getItemsByType(opts)`.
- 📄 **Pagination** — fine to skip below a few hundred items; add `take`/`cursor` to the same opts.
- 🗂️ **Collection membership editing** from the drawer — the `ItemCollection` join is ready.
- 💰 **Turning the gates on** — the 50-item cap and the Pro type block are scaffolding until the
  billing work lands.
- ⚠️ **`Collection.defaultTypeId`** exists in the schema and is still unused; a "new item" launched
  from inside a collection is where it would finally earn its place.

---

## 📚 Sources read

- [context/project-overview.md](context/project-overview.md) · [context/coding-standards.md](context/coding-standards.md) · [context/current-feature.md](context/current-feature.md)
- [docs/item-types.md](docs/item-types.md) — the prompt cited `docs/content-types.md`, which does not exist
- [prisma/schema.prisma](prisma/schema.prisma)
- [src/lib/item-types.ts](src/lib/item-types.ts) — the prompt cited `src/lib/constants.tsx`, which does not exist
- Existing patterns: [src/actions/account.ts](src/actions/account.ts), [src/lib/db/items.ts](src/lib/db/items.ts), [src/lib/db/collections.ts](src/lib/db/collections.ts), [src/lib/validations/auth.ts](src/lib/validations/auth.ts), [src/proxy.ts](src/proxy.ts), [src/app/(app)/layout.tsx](src/app/(app)/layout.tsx)
- Next.js 16 docs under `node_modules/next/dist/docs/01-app/` — async `params`, `refresh()`, `revalidatePath()`, `notFound()`
