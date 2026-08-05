import { createHash, randomBytes } from "node:crypto";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

const IDENTIFIER_PREFIX = "password-reset:";
const TOKEN_TTL_MS = 60 * 60 * 1000;

export const RESET_COOLDOWN_MS = 60 * 1000;

function identifierFor(email: string) {
  return `${IDENTIFIER_PREFIX}${email}`;
}

function emailFrom(identifier: string) {
  return identifier.startsWith(IDENTIFIER_PREFIX)
    ? identifier.slice(IDENTIFIER_PREFIX.length)
    : null;
}

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export async function createPasswordResetToken(email: string) {
  const raw = randomBytes(32).toString("base64url");

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: { identifier: identifierFor(email) },
    }),
    prisma.verificationToken.create({
      data: {
        identifier: identifierFor(email),
        token: hashToken(raw),
        expires: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);

  return raw;
}

export async function isWithinResetCooldown(email: string) {
  const latest = await prisma.verificationToken.findFirst({
    where: { identifier: identifierFor(email) },
    orderBy: { expires: "desc" },
    select: { expires: true },
  });

  if (!latest) return false;

  const createdAt = latest.expires.getTime() - TOKEN_TTL_MS;

  return Date.now() - createdAt < RESET_COOLDOWN_MS;
}

export async function findValidPasswordResetToken(raw: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token: hashToken(raw) },
    select: { identifier: true, expires: true },
  });

  if (!record) return null;

  const email = emailFrom(record.identifier);
  if (!email) return null;
  if (record.expires.getTime() <= Date.now()) return null;

  return { email };
}

class ResetClaimFailedError extends Error {}

export type ResetOutcome = "reset" | "invalid" | "same-password";

export async function consumePasswordResetToken(
  raw: string,
  newPassword: string
): Promise<ResetOutcome> {
  const valid = await findValidPasswordResetToken(raw);
  if (!valid) return "invalid";

  const user = await prisma.user.findUnique({
    where: { email: valid.email },
    select: { password: true },
  });

  if (!user?.password) return "invalid";

  if (await verifyPassword(newPassword, user.password)) {
    return "same-password";
  }

  const passwordHash = await hashPassword(newPassword);

  try {
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.verificationToken.deleteMany({
        where: { token: hashToken(raw) },
      });

      if (claimed.count !== 1) throw new ResetClaimFailedError();

      const updated = await tx.user.updateMany({
        where: { email: valid.email, password: { not: null } },
        data: { password: passwordHash },
      });

      if (updated.count !== 1) throw new ResetClaimFailedError();

      await tx.user.updateMany({
        where: { email: valid.email, emailVerified: null },
        data: { emailVerified: new Date() },
      });
    });

    return "reset";
  } catch (error) {
    if (error instanceof ResetClaimFailedError) return "invalid";
    throw error;
  }
}
