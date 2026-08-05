"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleCheck, LockKeyhole } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthError } from "@/components/auth/AuthError";
import { AuthField } from "@/components/auth/AuthField";
import { AuthIcon } from "@/components/auth/AuthIcon";
import { Button } from "@/components/ui/button";
import { resetPasswordSchema } from "@/lib/validations/auth";

type ResetField = "password" | "confirmPassword";
type FieldErrors = Partial<Record<ResetField, string>>;

const footer = (
  <>
    Remembered it?{" "}
    <Link href="/sign-in" className="text-foreground underline">
      Sign in
    </Link>
  </>
);

function ResetPasswordDone() {
  return (
    <AuthCard
      icon={
        <AuthIcon
          icon={CircleCheck}
          className="bg-emerald-500/10 text-emerald-500"
        />
      }
      title="Password updated"
      description="Your new password is active. Sign in with it to continue."
      footer={footer}
    >
      <Button asChild className="w-full">
        <Link href="/sign-in">Sign in</Link>
      </Button>
    </AuthCard>
  );
}

export function ResetPasswordForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const [done, setDone] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      token,
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as ResetField | undefined;
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not reset the password");
        return;
      }

      setDone(true);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  return done ? (
    <ResetPasswordDone />
  ) : (
    <AuthCard
      icon={
        <AuthIcon
          icon={LockKeyhole}
          className="bg-primary/10 text-foreground"
        />
      }
      title="Choose a new password"
      description={`Setting a new password for ${email}.`}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <AuthError message={error} /> : null}
        <AuthField
          name="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          error={fieldErrors.password}
        />
        <AuthField
          name="confirmPassword"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthCard>
  );
}
