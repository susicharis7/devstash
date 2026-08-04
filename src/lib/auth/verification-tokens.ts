import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export const RESEND_COOLDOWN_MS = 60 * 1000;

export type VerificationState =
  | "verified"
  | "already-verified"
  | "expired"
  | "invalid";

export type VerificationOutcome =
  | { state: Exclude<VerificationState, "invalid">; email: string | null }
  | { state: "invalid"; email: null };

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export async function createVerificationToken(userId: string) {
  const raw = randomBytes(32).toString("base64url");

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId } }),
    prisma.emailVerificationToken.create({
      data: {
        token: hashToken(raw),
        userId,
        expires: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);

  return raw;
}

export async function isWithinResendCooldown(userId: string) {
  const latest = await prisma.emailVerificationToken.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  return latest
    ? Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS
    : false;
}

export async function consumeVerificationToken(
  raw: string
): Promise<VerificationOutcome> {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token: hashToken(raw) },
    select: {
      id: true,
      userId: true,
      expires: true,
      usedAt: true,
      user: { select: { email: true } },
    },
  });

  if (!record) return { state: "invalid", email: null };

  const email = record.user.email;

  if (record.usedAt) return { state: "already-verified", email };
  if (record.expires.getTime() <= Date.now()) return { state: "expired", email };

  return prisma.$transaction(async (tx): Promise<VerificationOutcome> => {
    const now = new Date();
    const claimed = await tx.emailVerificationToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: now },
    });

    if (claimed.count === 0) return { state: "already-verified", email };

    await tx.user.update({
      where: { id: record.userId },
      data: { emailVerified: now },
    });

    return { state: "verified", email };
  });
}
