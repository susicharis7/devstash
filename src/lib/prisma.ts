import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveConnectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  return url.replace(
    /([?&])sslmode=(require|prefer|verify-ca)\b/,
    "$1sslmode=verify-full"
  );
}

const adapter = new PrismaPg({ connectionString: resolveConnectionString() });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
