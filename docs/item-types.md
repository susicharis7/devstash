# 🧩 Item Types

Every piece of knowledge in DevStash is an **Item**, and every Item has exactly one
**ItemType**. The app ships with **7 system types** (`isSystem = true`, `userId = null`);
Pro users will later be able to create custom types on top of them.

> **Source of truth:** [src/lib/item-types.ts](src/lib/item-types.ts) — `SYSTEM_ITEM_TYPES`.
> The seed script, the sidebar, the landing page and the icon map all derive from that one array,
> so adding a type there propagates everywhere.

---

## 📋 At a glance

| # | Type | Icon | Color | Swatch | Data kind | Tier |
|---|------|------|-------|--------|-----------|------|
| 1 | `snippet` | `Code` | `#3b82f6` | 🟦 blue | `TEXT` | Free |
| 2 | `prompt` | `Sparkles` | `#8b5cf6` | 🟪 purple | `TEXT` | Free |
| 3 | `command` | `Terminal` | `#f97316` | 🟧 orange | `TEXT` | Free |
| 4 | `note` | `StickyNote` | `#fde047` | 🟨 yellow | `TEXT` | Free |
| 5 | `file` | `File` | `#6b7280` | ⬜ gray | `FILE` | **PRO** |
| 6 | `image` | `Image` | `#ec4899` | 🩷 pink | `FILE` | **PRO** |
| 7 | `link` | `Link` | `#10b981` | 🟩 emerald | `URL` | Free |

The row order above is **canonical** — `SYSTEM_TYPE_ORDER` drives the sidebar sort, so the
Types list always reads snippet → prompt → command → note → file → image → link regardless of
what order Postgres returns.

---

## 🔍 Type by type

### 1. 🟦 Snippet · `Code` · `#3b82f6`

**Purpose** — reusable code you rewrite too often: hooks, utilities, config blocks, boilerplate.

**Key fields**

| Field | Use |
|---|---|
| `contentType` | `TEXT` |
| `content` | the code itself (multi-line string) |
| `language` | ✅ set — drives syntax highlighting (`typescript`, `dockerfile`, …) |
| `description` | one-line summary shown under the title |
| `tags` | e.g. `react`, `hooks`, `typescript` |
| `url` / `fileUrl` / `fileName` / `fileSize` | `null` |

---

### 2. 🟪 Prompt · `Sparkles` · `#8b5cf6`

**Purpose** — AI prompts and system messages that worked: review prompts, doc generators,
refactoring assistants. Often contain placeholders like `{code}`.

**Key fields**

| Field | Use |
|---|---|
| `contentType` | `TEXT` |
| `content` | the prompt text |
| `language` | ❌ unused — prose, not code |
| `description` | what the prompt does |
| `tags` | e.g. `ai`, `review`, `docs` |

---

### 3. 🟧 Command · `Terminal` · `#f97316`

**Purpose** — shell incantations you always re-google: `git reset --soft HEAD~1`,
`docker system prune`, port-killers.

**Key fields**

| Field | Use |
|---|---|
| `contentType` | `TEXT` |
| `content` | the command line(s) |
| `language` | ✅ set — typically `bash` |
| `description` | what the command accomplishes |
| `tags` | e.g. `git`, `docker`, `ci` |

> Structurally identical to `snippet`; the split is **semantic**, so a one-liner you run in a
> terminal doesn't get buried among code blocks.

---

### 4. 🟨 Note · `StickyNote` · `#fde047`

**Purpose** — explanations worth keeping: design decisions, gotchas, course notes.

**Key fields**

| Field | Use |
|---|---|
| `contentType` | `TEXT` |
| `content` | markdown body |
| `language` | ❌ unused |
| `description` | optional summary |

> ⚠️ No `note` items exist in the seed data — the type row is created, but its count renders
> as `0` in the sidebar.

---

### 5. ⬜ File · `File` · `#6b7280` · **PRO**

**Purpose** — context files and templates uploaded rather than typed.

**Key fields**

| Field | Use |
|---|---|
| `contentType` | `FILE` |
| `content` | `null` |
| `fileUrl` | Cloudflare R2 object URL |
| `fileName` | original filename |
| `fileSize` | bytes |
| `description` | optional |

> ⚠️ **Not yet implemented.** R2 upload is unbuilt, so no `FILE` item can exist today; the type
> row is seeded and the sidebar entry renders with a PRO badge in place of a count.

---

### 6. 🩷 Image · `Image` · `#ec4899` · **PRO**

**Purpose** — screenshots and diagrams.

**Key fields** — identical to `file` (`contentType = FILE`, `fileUrl` / `fileName` / `fileSize`).
The distinction is semantic and drives the icon, color and any future thumbnail rendering.

> ⚠️ Same status as `file`: seeded type row, no upload path yet.

---

### 7. 🟩 Link · `Link` · `#10b981`

**Purpose** — docs you actually return to, replacing scattered browser bookmarks.

**Key fields**

| Field | Use |
|---|---|
| `contentType` | `URL` |
| `url` | ✅ the destination — the only type that populates it |
| `content` | `null` |
| `language` | ❌ unused |
| `description` | what's behind the link |
| `tags` | e.g. `css`, `react`, `ui` |

---

## 🗂️ Data-kind classification

`Item.contentType` is a Postgres enum with three values, and each type resolves to exactly one:

```
ContentType
├── TEXT  →  snippet · prompt · command · note     content is filled
├── URL   →  link                                  url is filled
└── FILE  →  file · image                          fileUrl + fileName + fileSize are filled
```

| Data kind | Types | Populated | Always `null` |
|---|---|---|---|
| 📝 `TEXT` | snippet, prompt, command, note | `content` | `url`, `fileUrl`, `fileName`, `fileSize` |
| 🔗 `URL` | link | `url` | `content`, `fileUrl`, `fileName`, `fileSize`, `language` |
| 📎 `FILE` | file, image | `fileUrl`, `fileName`, `fileSize` | `content`, `url`, `language` |

**Important:** the data kind is **not** enforced by the schema. `contentType` and `itemTypeId`
are independent columns and every payload field is nullable, so nothing at the DB level stops a
`link` item from being stored as `TEXT`. The pairing is a convention held by the write path
(currently only [prisma/seed.ts](prisma/seed.ts)) — application-level validation is a gap worth
closing when item creation is built.

`language` is orthogonal: it's `TEXT`-only, and in practice only `snippet` and `command` set it.

---

## 🔗 Shared properties

Every item, regardless of type, carries the same envelope
([prisma/schema.prisma](prisma/schema.prisma) → `model Item`):

| Field | Type | Notes |
|---|---|---|
| `id` | `String` | cuid |
| `title` | `String` | required |
| `description` | `String?` | one-line summary |
| `contentType` | `ContentType` | defaults to `TEXT` |
| `isFavorite` | `Boolean` | ⭐ default `false` |
| `isPinned` | `Boolean` | 📌 default `false` |
| `createdAt` / `updatedAt` | `DateTime` | auto |
| `userId` | FK → `User` | `onDelete: Cascade`, indexed |
| `itemTypeId` | FK → `ItemType` | **no cascade** — a type can't be deleted while items reference it; indexed |
| `tags` | `Tag[]` | implicit many-to-many |
| `collections` | `ItemCollection[]` | an item can sit in many collections |

The `ItemType` row itself is thin — `name`, `icon` (lucide name), `color` (hex), `isSystem`, and a
nullable `userId` that stays `null` for system types and will point at the owner for custom
(Pro) types.

---

## 🎨 How types change the display

Type never changes the *layout* of an item — it changes **color, icon and grouping**. There is one
`ItemRow` and one `CollectionCard`, both fed by view models that carry a resolved
`icon` + `accentColor` from the joined `ItemType`.

| Surface | What the type controls | Where |
|---|---|---|
| **Item row** | 4px left border tinted `accentColor`; icon tile in the same color | [ItemRow.tsx](src/components/dashboard/ItemRow.tsx) |
| **Collection card** | Left border = **dominant** type's color; a strip of icons for every type present, ordered by frequency | [CollectionCard.tsx](src/components/dashboard/CollectionCard.tsx) |
| **Sidebar → Types** | One row per system type, canonical order, colored icon, link to `/items/{name}s` | [SidebarContent.tsx](src/components/dashboard/SidebarContent.tsx) |
| **Sidebar trailing slot** | Free types show an **item count**; Pro types (`file`, `image`) show a pulsing **PRO** badge instead | same |
| **Sidebar → Collections** | Recents show a dot in the dominant type's color | same |
| **Landing page** | Type grid with the same border + icon + PRO badge, plus a one-line blurb | [TypeGrid.tsx](src/components/landing/TypeGrid.tsx) |
| **Profile** | Per-type breakdown | [TypeBreakdown.tsx](src/components/profile/TypeBreakdown.tsx) |

**Icon resolution** — `ItemType.icon` is a plain string in the DB. `getItemTypeIcon()` maps it to a
lucide component through `ITEM_TYPE_ICONS`, falling back to `File` for an unknown name
([item-type-icons.ts](src/lib/item-type-icons.ts)). Nothing renders a raw hex value inline except
via inline `style`, since the colors are per-row data rather than Tailwind classes.

**Dominant type** — `rankCollectionTypes()` counts items per type inside a collection and sorts by
count, tie-broken alphabetically on icon name. The winner's color becomes the card's accent;
if a collection is empty it falls back to `FALLBACK_COLOR` (`#6b7280`, the same gray as `file`)
([collections.ts](src/lib/db/collections.ts)).

**Pluralization** — display names and slugs are derived, not stored:
`name[0].toUpperCase() + name.slice(1) + "s"` → `Snippets`, and the slug `snippets` →
`/items/snippets` ([items.ts](src/lib/db/items.ts)). Naive `+ "s"` works for all 7 current names.

---

## 💰 Pro gating

`PRO_TYPE_NAMES` is derived from the `isPro` flag and currently contains **`file`** and **`image`**.
Gating today is **display-only** — the badge renders, but the links stay navigable and nothing
blocks a `FILE` item at the DB or action level, matching the "build the foundation now, unlock
everything during development" decision in the project overview.

Note the flag lives in the TypeScript constant, **not** in the database: `ItemType` has no `isPro`
column, so the sidebar re-derives it by matching the raw singular name against `PRO_TYPE_NAMES`.

---

## 🌱 Current data (development branch)

All 7 system types exist as rows (`isSystem = true`, `userId = null`). Item distribution from
`npm run db:seed`:

| Type | Items | `contentType` | `language` set | `description` set |
|---|---|---|---|---|
| 🟩 link | 6 | `URL` | 0 | 6 |
| 🟧 command | 5 | `TEXT` | 5 | 5 |
| 🟦 snippet | 4 | `TEXT` | 4 | 4 |
| 🟪 prompt | 3 | `TEXT` | 0 | 3 |
| 🟨 note | 0 | — | — | — |
| ⬜ file | 0 | — | — | — |
| 🩷 image | 0 | — | — | — |
| | **18** | | | |

Every seeded item sets `description`; `fileUrl`, `fileName` and `fileSize` are `NULL` across the
board, since no upload path exists yet.

---

## 📌 Notes & gaps

- 🔴 **`file` / `image` are unimplemented** — types exist, R2 upload does not.
- 🟡 **`note` has no sample data** — the type renders with a count of `0`.
- 🟡 **No validation ties `contentType` to `itemTypeId`** — enforce it in the create/update path.
- 🟡 **`isPro` is code-only** — a custom Pro type created later would have no way to express it.
- 🔵 **Custom types are schema-ready** — `ItemType.userId` + `isSystem` already support them; no
  UI or query path exists.
- 🔵 **`Collection.defaultTypeId`** exists in the schema but is unused so far.

---

## 📚 Sources read

- [context/project-overview.md](context/project-overview.md)
- [prisma/schema.prisma](prisma/schema.prisma)
- [src/lib/item-types.ts](src/lib/item-types.ts) — the research prompt named
  `src/lib/constants.tsx`, which does not exist; the constants live here
- [src/lib/item-type-icons.ts](src/lib/item-type-icons.ts)
- [prisma/seed.ts](prisma/seed.ts)
- [src/lib/db/items.ts](src/lib/db/items.ts), [src/lib/db/collections.ts](src/lib/db/collections.ts)
- Component layer: `ItemRow`, `CollectionCard`, `SidebarContent`, `ItemTypeIcon`, `TypeGrid`
- Live counts queried from the Neon **development** branch (`br-divine-cell-as1m3s7o`)
