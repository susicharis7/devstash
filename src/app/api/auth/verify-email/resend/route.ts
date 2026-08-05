import { NextResponse } from "next/server";

import { isWithinResendCooldown } from "@/lib/auth/verification-tokens";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { resendVerificationSchema } from "@/lib/validations/auth";

const GENERIC_MESSAGE =
  "If that address needs verifying, a new link is on its way.";

function genericResponse() {
  return NextResponse.json(
    { success: true, data: { message: GENERIC_MESSAGE } },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return genericResponse();
  }

  const parsed = resendVerificationSchema.safeParse(body);
  if (!parsed.success) {
    return genericResponse();
  }

  const limit = await checkRateLimit(
    "verificationResend",
    `${getClientIp(request)}:${parsed.data.email}`
  );
  if (!limit.success) return rateLimitResponse(limit);

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: {
        id: true,
        name: true,
        password: true,
        emailVerified: true,
      },
    });

    const needsVerification = user?.password && !user.emailVerified;

    if (needsVerification && !(await isWithinResendCooldown(user.id))) {
      await sendVerificationEmail({
        userId: user.id,
        email: parsed.data.email,
        name: user.name,
        origin: new URL(request.url).origin,
      });
    }
  } catch (error) {
    console.error("[verify-email/resend] Could not process the request", error);
  }

  return genericResponse();
}
