import * as nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), true);

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  const host = (process.env.DATABASE_URL ?? "").replace(/.*@([^/?]+).*/, "$1");
  const branch = process.env.NEON_BRANCH ?? "unknown";
  console.log(`→ Connecting to ${host} (branch: ${branch})`);

  const ping = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
  console.log(`✓ Connection OK — SELECT 1 returned ${ping[0]?.ok}`);

  const [users, itemTypes, items, collections, tags] = await Promise.all([
    prisma.user.count(),
    prisma.itemType.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.tag.count(),
  ]);

  console.log("✓ Row counts:");
  console.table({ users, itemTypes, items, collections, tags });

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("✗ Database test failed:");
  console.error(error);
  process.exit(1);
});
