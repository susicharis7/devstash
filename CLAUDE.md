# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files and images, links 
and custom types.

## Context Files

Read the following to get the full context of the project

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md


@AGENTS.md

## ⚠️ Next.js version

This project uses **Next.js 16.2.10** and **React 19.2.4**. These are newer than most training data and contain breaking changes to APIs, conventions, and file structure. Before writing any framework code, read the relevant guide under `node_modules/next/dist/docs/` (start at `01-app/`) rather than relying on remembered Next.js/React patterns. Heed deprecation notices.

## Repository layout

The git repository and the actual application both live in `devstash/`, one level below the working-directory root `udemy-project/`. Run all commands from `devstash/`.

## ⚠️ Neon MCP

The Neon MCP server operates on the **`development` branch only**.

- Project: `devstash` (`fancy-water-02995429`)
- Development branch: `br-divine-cell-as1m3s7o` — **always pass this as `branchId`**
- Production branch: `br-sparkling-shadow-as97phil` — **never touch it**

Rules:

- Always pass `branchId: br-divine-cell-as1m3s7o` explicitly. `production` is the
  project's *default* branch, so omitting `branchId` silently targets production.
- Never read from, write to, or describe the production branch unless I explicitly
  ask for it in that message. Prior permission does not carry over.
- Never run destructive SQL (`DROP`, `DELETE`, `TRUNCATE`, `UPDATE`/`INSERT` without
  a `WHERE`), and never delete or reset a branch, without asking first.
- Schema changes go through Prisma migrations only (`npm run db:migrate`). Do not use
  the MCP migration tools (`prepare_database_migration` /
  `complete_database_migration`) — they apply DDL outside Prisma's migration history.

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run start    # serve the production build (requires build first)
npm run lint     # eslint (flat config)

npm run db:migrate  # prisma migrate dev (create + apply a migration)
npm run db:deploy   # prisma migrate deploy (production)
npm run db:studio   # prisma studio
npm run db:seed     # seed the development branch (prompts for confirmation)
npm run db:test     # verify the database connection
```

There is no test runner configured.
