"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthError } from "@/components/auth/AuthError";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/button";
import { forgotPasswordSchema } from "@/lib/validations/auth";

const FALLBACK_MESSAGE =
  "If that address has a DevStash password, a reset link is on its way.";

function ForgotPasswordSent({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-3">
      <p role="status" className="text-sm text-muted-foreground">
        {message}{" "}
        The link expires in 1 hour — check spam if it doesn&apos;t arrive.
      </p>
      <Button asChild className="w-full">
        <Link href="/sign-in">Back to sign in</Link>
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onRetry}
      >
        Try a different address
      </Button>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldError(undefined);

    const formData = new FormData(event.currentTarget);
    const parsed = forgotPasswordSchema.safeParse({
      email: formData.get("email"),
    });

    if (!parsed.success) {
      setFieldError(parsed.error.issues[0].message);
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const result = (await response.json()) as {
        data?: { message?: string };
      };

      setMessage(result.data?.message ?? FALLBACK_MESSAGE);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  return message ? (
    <ForgotPasswordSent message={message} onRetry={() => setMessage(null)} />
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <AuthError message={error} /> : null}
      <AuthField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={fieldError}
      />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending…" : "Send reset link"}
      </Button>
      <Button asChild variant="ghost" className="w-full">
        <Link href="/sign-in">Back to sign in</Link>
      </Button>
    </form>
  );
}
