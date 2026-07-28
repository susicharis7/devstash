import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

const SALT_ROUNDS = 12;

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
      data: { name, email, password: await bcrypt.hash(password, SALT_ROUNDS) },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch {
    return errorResponse("Could not create the account", 500);
  }
}
