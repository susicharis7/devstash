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
