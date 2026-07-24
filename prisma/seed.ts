import * as readline from "node:readline";

import * as nextEnv from "@next/env";
import bcrypt from "bcryptjs";

import type { PrismaClient } from "../src/generated/prisma/client";

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

type ContentType = "TEXT" | "URL" | "FILE";

interface SeedItem {
  title: string;
  typeName: string;
  contentType: ContentType;
  description?: string;
  content?: string;
  url?: string;
  language?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  tags?: string[];
}

interface SeedCollection {
  name: string;
  description: string;
  isFavorite?: boolean;
  items: SeedItem[];
}

const ITEM_TYPES = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
];

const COLLECTIONS: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    isFavorite: true,
    items: [
      {
        title: "useDebounce hook",
        typeName: "snippet",
        contentType: "TEXT",
        language: "typescript",
        description: "Debounce a rapidly changing value",
        isPinned: true,
        isFavorite: true,
        tags: ["react", "hooks", "typescript"],
        content: [
          'import { useEffect, useState } from "react";',
          "",
          "export function useDebounce<T>(value: T, delay = 300): T {",
          "  const [debounced, setDebounced] = useState(value);",
          "  useEffect(() => {",
          "    const id = setTimeout(() => setDebounced(value), delay);",
          "    return () => clearTimeout(id);",
          "  }, [value, delay]);",
          "  return debounced;",
          "}",
        ].join("\n"),
      },
      {
        title: "Compound component with Context",
        typeName: "snippet",
        contentType: "TEXT",
        language: "typescript",
        description: "Context provider + hook for compound components",
        isFavorite: true,
        tags: ["react", "patterns"],
        content: [
          '"use client";',
          'import { createContext, useContext, useState } from "react";',
          "",
          "type TabsValue = { active: string; setActive: (v: string) => void };",
          "const TabsContext = createContext<TabsValue | null>(null);",
          "",
          "export function Tabs({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) {",
          "  const [active, setActive] = useState(defaultValue);",
          "  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;",
          "}",
          "",
          "export function useTabs() {",
          "  const ctx = useContext(TabsContext);",
          '  if (!ctx) throw new Error("useTabs must be used within <Tabs>");',
          "  return ctx;",
          "}",
        ].join("\n"),
      },
      {
        title: "groupBy utility",
        typeName: "snippet",
        contentType: "TEXT",
        language: "typescript",
        description: "Group an array into a record by a key function",
        tags: ["typescript", "utils"],
        content: [
          "export function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {",
          "  return items.reduce((acc, item) => {",
          "    const key = keyFn(item);",
          "    (acc[key] ??= []).push(item);",
          "    return acc;",
          "  }, {} as Record<K, T[]>);",
          "}",
        ].join("\n"),
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    items: [
      {
        title: "Code review prompt",
        typeName: "prompt",
        contentType: "TEXT",
        description: "Thorough review of a code block",
        isPinned: true,
        tags: ["ai", "review"],
        content:
          "Review the following code for correctness, security, performance, and readability. List concrete issues ordered by severity, then propose a corrected version:\n\n{code}",
      },
      {
        title: "Documentation generation prompt",
        typeName: "prompt",
        contentType: "TEXT",
        description: "Generate docs from a function/module",
        tags: ["ai", "docs"],
        content:
          "Write clear developer documentation for the following code. Include a summary, parameters, return value, and a short usage example:\n\n{code}",
      },
      {
        title: "Refactoring assistant prompt",
        typeName: "prompt",
        contentType: "TEXT",
        description: "Refactor while preserving behaviour",
        tags: ["ai", "refactor"],
        content:
          "Refactor the following code for readability and maintainability without changing its behaviour. Explain each change briefly, then output the final code:\n\n{code}",
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    isFavorite: true,
    items: [
      {
        title: "Next.js production Dockerfile",
        typeName: "snippet",
        contentType: "TEXT",
        language: "dockerfile",
        description: "Multi-step build for a Next.js app",
        tags: ["docker"],
        content: [
          "FROM node:22-alpine",
          "WORKDIR /app",
          "COPY package*.json ./",
          "RUN npm ci",
          "COPY . .",
          "RUN npm run build",
          "EXPOSE 3000",
          'CMD ["npm", "start"]',
        ].join("\n"),
      },
      {
        title: "Build and push image",
        typeName: "command",
        contentType: "TEXT",
        language: "bash",
        description: "Build a Docker image and push to the registry",
        tags: ["docker", "ci"],
        content:
          "docker build -t devstash . && docker push registry.example.com/devstash:latest",
      },
      {
        title: "Docker documentation",
        typeName: "link",
        contentType: "URL",
        description: "Official Docker docs",
        url: "https://docs.docker.com/",
      },
      {
        title: "GitHub Actions documentation",
        typeName: "link",
        contentType: "URL",
        description: "CI/CD with GitHub Actions",
        tags: ["ci"],
        url: "https://docs.github.com/en/actions",
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    items: [
      {
        title: "Undo last commit (keep changes)",
        typeName: "command",
        contentType: "TEXT",
        language: "bash",
        description: "Soft-reset the most recent commit",
        isFavorite: true,
        tags: ["git"],
        content: "git reset --soft HEAD~1",
      },
      {
        title: "Prune all unused Docker data",
        typeName: "command",
        contentType: "TEXT",
        language: "bash",
        description: "Reclaim space from containers, images, and volumes",
        content: "docker system prune -af --volumes",
      },
      {
        title: "Kill process on a port",
        typeName: "command",
        contentType: "TEXT",
        language: "bash",
        description: "Free up a port held by a stuck process",
        content: "lsof -ti:3000 | xargs kill -9",
      },
      {
        title: "Check and update packages",
        typeName: "command",
        contentType: "TEXT",
        language: "bash",
        description: "List outdated dependencies and update them",
        content: "npm outdated && npm update",
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    items: [
      {
        title: "Tailwind CSS docs",
        typeName: "link",
        contentType: "URL",
        description: "Utility-first CSS reference",
        tags: ["css", "tailwind"],
        url: "https://tailwindcss.com/docs",
      },
      {
        title: "shadcn/ui",
        typeName: "link",
        contentType: "URL",
        description: "Composable React component library",
        tags: ["react", "ui"],
        url: "https://ui.shadcn.com",
      },
      {
        title: "Material Design 3",
        typeName: "link",
        contentType: "URL",
        description: "Google's design system guidelines",
        url: "https://m3.material.io",
      },
      {
        title: "Lucide icons",
        typeName: "link",
        contentType: "URL",
        description: "Open-source icon library",
        url: "https://lucide.dev",
      },
    ],
  },
];

async function clearData(prisma: PrismaClient) {
  await prisma.itemCollection.deleteMany();
  await prisma.item.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.itemType.deleteMany();
  await prisma.user.deleteMany();
}

async function seed(prisma: PrismaClient) {
  const password = await bcrypt.hash("12345678", 12);
  const user = await prisma.user.create({
    data: {
      email: "demo@devstash.io",
      name: "Demo User",
      password,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  const typeIdByName: Record<string, string> = {};
  for (const type of ITEM_TYPES) {
    const created = await prisma.itemType.create({
      data: { name: type.name, icon: type.icon, color: type.color, isSystem: true },
    });
    typeIdByName[type.name] = created.id;
  }

  const tagNames = [
    ...new Set(
      COLLECTIONS.flatMap((collection) =>
        collection.items.flatMap((item) => item.tags ?? [])
      )
    ),
  ];
  const tagIdByName: Record<string, string> = {};
  for (const name of tagNames) {
    const created = await prisma.tag.create({ data: { name } });
    tagIdByName[name] = created.id;
  }

  let itemCount = 0;
  for (const definition of COLLECTIONS) {
    const collection = await prisma.collection.create({
      data: {
        name: definition.name,
        description: definition.description,
        isFavorite: definition.isFavorite ?? false,
        userId: user.id,
      },
    });
    for (const item of definition.items) {
      await prisma.item.create({
        data: {
          title: item.title,
          description: item.description ?? null,
          contentType: item.contentType,
          content: item.content ?? null,
          url: item.url ?? null,
          language: item.language ?? null,
          isPinned: item.isPinned ?? false,
          isFavorite: item.isFavorite ?? false,
          userId: user.id,
          itemTypeId: typeIdByName[item.typeName],
          collections: { create: { collectionId: collection.id } },
          tags: item.tags?.length
            ? { connect: item.tags.map((name) => ({ id: tagIdByName[name] })) }
            : undefined,
        },
      });
      itemCount += 1;
    }
  }

  return {
    itemTypes: ITEM_TYPES.length,
    collections: COLLECTIONS.length,
    items: itemCount,
    tags: tagNames.length,
  };
}

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const queued: string[] = [];
  const waiters: Array<(line: string) => void> = [];
  let closed = false;
  rl.on("line", (line) => {
    const waiter = waiters.shift();
    if (waiter) waiter(line);
    else queued.push(line);
  });
  rl.on("close", () => {
    closed = true;
    while (waiters.length) waiters.shift()?.("");
  });

  const ask = (question: string) =>
    new Promise<string>((resolve) => {
      process.stdout.write(question);
      const next = queued.shift();
      if (next !== undefined) resolve(next);
      else if (closed) resolve("");
      else waiters.push(resolve);
    }).then((line) => line.trim().toLowerCase());

  try {
    const branch = process.env.NEON_BRANCH ?? "unknown";
    console.log(`Seed target: "${branch}" branch.`);

    const proceed = await ask("Seed the database with sample data? (y/n) ");
    if (proceed !== "y") {
      console.log("Aborted. No changes made.");
      return;
    }

    const existing =
      (await prisma.user.count()) +
      (await prisma.itemType.count()) +
      (await prisma.collection.count()) +
      (await prisma.item.count());

    if (existing > 0) {
      console.log(
        `\n⚠  The database already contains data (${existing} rows across seeded tables).`
      );
      console.log(
        "Re-seeding will DELETE all existing users, item types, collections, and items."
      );
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        const confirm = await ask(
          `Confirm override ${attempt} of 3 — type "y" to proceed: `
        );
        if (confirm !== "y") {
          console.log("Aborted. No changes made.");
          return;
        }
      }
      await clearData(prisma);
      console.log("Existing data cleared.");
    }

    const summary = await seed(prisma);
    console.log(
      `\n✓ Seeding complete: 1 user, ${summary.itemTypes} item types, ${summary.collections} collections, ${summary.items} items, ${summary.tags} tags.`
    );
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("✗ Seeding failed:");
  console.error(error);
  process.exit(1);
});
