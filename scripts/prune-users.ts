import * as readline from "node:readline";

import * as nextEnv from "@next/env";

import { DEMO_USER_EMAIL } from "../src/lib/db/demo-user";

nextEnv.loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

const doomedUsers = {
  OR: [{ email: null }, { email: { not: DEMO_USER_EMAIL } }],
};

function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

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

  return { ask, close: () => rl.close() };
}

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const { ask, close } = createPrompt();

  try {
    const branch = process.env.NEON_BRANCH ?? "unknown";

    if (branch === "production") {
      console.error(
        '✗ Refusing to run against the "production" branch. Aborted.'
      );
      process.exitCode = 1;
      return;
    }

    console.log(`Prune target: "${branch}" branch.`);
    console.log(`Keeping: ${DEMO_USER_EMAIL} and everything it owns.\n`);

    const users = await prisma.user.findMany({
      where: doomedUsers,
      select: {
        email: true,
        name: true,
        _count: {
          select: {
            items: true,
            collections: true,
            itemTypes: true,
            accounts: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (users.length === 0) {
      console.log("Nothing to prune — no users other than the demo user.");
      return;
    }

    console.log(`${users.length} user(s) will be DELETED, with their content:`);
    for (const user of users) {
      const { items, collections, itemTypes, accounts } = user._count;
      console.log(
        `  • ${user.email ?? "(no email)"} — ${items} items, ${collections} collections, ${itemTypes} custom types, ${accounts} linked accounts`
      );
    }
    console.log(
      "\nSessions and email-verification tokens for these users go with them (cascade)."
    );
    console.log("Tags left without any item afterwards are removed too.\n");

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const confirm = await ask(
        `Confirm deletion ${attempt} of 2 — type "y" to proceed: `
      );
      if (confirm !== "y") {
        console.log("Aborted. No changes made.");
        return;
      }
    }

    const { count } = await prisma.user.deleteMany({ where: doomedUsers });
    const tags = await prisma.tag.deleteMany({ where: { items: { none: {} } } });

    console.log(
      `\n✓ Deleted ${count} user(s) and ${tags.count} orphaned tag(s).`
    );

    const [remainingUsers, items, collections, itemTypes] = await Promise.all([
      prisma.user.count(),
      prisma.item.count(),
      prisma.collection.count(),
      prisma.itemType.count(),
    ]);

    console.log(
      `Remaining: ${remainingUsers} user(s), ${itemTypes} item types, ${collections} collections, ${items} items.`
    );
  } finally {
    close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("✗ Prune failed:");
  console.error(error);
  process.exit(1);
});
