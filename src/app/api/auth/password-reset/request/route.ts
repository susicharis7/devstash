import { NextResponse } from "next/server";

import { isWithinResetCooldown } from "@/lib/auth/password-reset-tokens";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset-email";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validations/auth";

const GENERIC_MESSAGE =
  "If that address has a DevStash password, a reset link is on its way.";

function genericResponse() {
  return NextResponse.json(
    { success: true, data: { message: GENERIC_MESSAGE } },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  const limit = await checkRateLimit(
    "passwordResetRequest",
    getClientIp(request)
  );
  if (!limit.success) return rateLimitResponse(limit);

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return genericResponse();
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return genericResponse();
  }

  const { email } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, password: true },
    });

    if (user?.password && !(await isWithinResetCooldown(email))) {
      await sendPasswordResetEmail({
        email,
        name: user.name,
        origin: new URL(request.url).origin,
      });
    }
  } catch (error) {
    console.error("[password-reset/request] Could not process", error);
  }

  return genericResponse();
}
