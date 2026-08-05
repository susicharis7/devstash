import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth/password";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

function errorResponse(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400);
  }

  const { name, email, password } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return errorResponse("An account with that email already exists", 409);
    }

    const user = await prisma.user.create({
      data: { name, email, password: await hashPassword(password) },
      select: { id: true, name: true, email: true },
    });

    await sendVerificationEmail({
      userId: user.id,
      email,
      name: user.name,
      origin: new URL(request.url).origin,
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch {
    return errorResponse("Could not create the account", 500);
  }
}
