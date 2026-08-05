"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInWithCredentials, signInWithGitHub } from "@/actions/auth";
import { AuthError } from "@/components/auth/AuthError";
import { GitHubIcon } from "@/components/icons/GitHubIcon";
import { AuthField } from "@/components/auth/AuthField";
import { ResendVerificationButton } from "@/components/auth/ResendVerificationButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, isPending] = useActionState(
    signInWithCredentials,
    { error: null }
  );

  return (
    <div className="space-y-5">
      <form action={signInWithGitHub}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <Button type="submit" variant="outline" className="w-full">
          <GitHubIcon className="size-4" />
          Sign in with GitHub
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        {state.error ? <AuthError message={state.error} /> : null}
        {state.unverifiedEmail ? (
          <ResendVerificationButton
            email={state.unverifiedEmail}
            label="Resend verification email"
          />
        ) : null}
        <AuthField
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
        />
        <AuthField
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          labelAction={
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Forgot password?
            </Link>
          }
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
