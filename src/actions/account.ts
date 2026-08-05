"use server";

import { signOut } from "@/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getCurrentUserId } from "@/lib/db/current-user";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validations/auth";

export interface ActionResult {
  success: boolean;
  error?: string;
}

const GENERIC_ERROR = "Something went wrong. Try again.";

export async function changePasswordAction(
  input: unknown
): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "You are not signed in." };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user?.password) {
      return {
        success: false,
        error: "This account signs in with GitHub, so it has no password.",
      };
    }

    const matches = await verifyPassword(
      parsed.data.currentPassword,
      user.password
    );
    if (!matches) {
      return { success: false, error: "Your current password is incorrect." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: await hashPassword(parsed.data.password) },
    });

    return { success: true };
  } catch (error) {
    console.error("[account] Could not change the password", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function deleteAccountAction(): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "You are not signed in." };

  try {
    await prisma.user.deleteMany({ where: { id: userId } });
  } catch (error) {
    console.error("[account] Could not delete the account", error);
    return { success: false, error: GENERIC_ERROR };
  }

  await signOut({ redirectTo: "/" });
  return { success: true };
}
