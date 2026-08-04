"use server";

import { AuthError, CredentialsSignin } from "next-auth";

import { signIn, signOut } from "@/auth";
import { EMAIL_NOT_VERIFIED_CODE } from "@/lib/auth/errors";
import { signInSchema } from "@/lib/validations/auth";

export interface SignInState {
  error: string | null;
  unverifiedEmail?: string;
}

const INVALID_CREDENTIALS = "Invalid email or password";
const EMAIL_NOT_VERIFIED =
  "Verify your email before signing in. Check your inbox for the link we sent.";

export async function signInWithCredentials(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const callbackUrl = formData.get("callbackUrl");

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: typeof callbackUrl === "string" ? callbackUrl : "/dashboard",
    });
  } catch (error) {
    if (
      error instanceof CredentialsSignin &&
      error.code === EMAIL_NOT_VERIFIED_CODE
    ) {
      return { error: EMAIL_NOT_VERIFIED, unverifiedEmail: parsed.data.email };
    }
    if (error instanceof AuthError) {
      return { error: INVALID_CREDENTIALS };
    }
    throw error;
  }

  return { error: null };
}

export async function signInWithGitHub(formData: FormData) {
  const callbackUrl = formData.get("callbackUrl");

  await signIn("github", {
    redirectTo: typeof callbackUrl === "string" ? callbackUrl : "/dashboard",
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}
