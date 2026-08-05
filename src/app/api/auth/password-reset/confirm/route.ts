import { NextResponse } from "next/server";

import {
  consumePasswordResetToken,
  type ResetOutcome,
} from "@/lib/auth/password-reset-tokens";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validations/auth";

const FAILURE_MESSAGES: Record<Exclude<ResetOutcome, "reset">, string> = {
  invalid: "This reset link is no longer valid. Request a new one to continue.",
  "same-password":
    "That's already your password. Choose a different one to continue.",
};

function errorResponse(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(request: Request) {
  const limit = await checkRateLimit(
    "passwordResetConfirm",
    getClientIp(request)
  );
  if (!limit.success) return rateLimitResponse(limit);

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON", 400);
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400);
  }

  try {
    const outcome = await consumePasswordResetToken(
      parsed.data.token,
      parsed.data.password
    );

    if (outcome !== "reset") {
      return errorResponse(FAILURE_MESSAGES[outcome], 400);
    }

    return NextResponse.json({ success: true, data: null }, { status: 200 });
  } catch (error) {
    console.error(
      "[password-reset/confirm] Could not reset the password",
      error
    );
    return errorResponse("Could not reset the password", 500);
  }
}
