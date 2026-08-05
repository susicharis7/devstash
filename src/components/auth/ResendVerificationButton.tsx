"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { notifyIfRateLimited } from "@/lib/rate-limit-toast";

const FALLBACK_MESSAGE =
  "If that address needs verifying, a new link is on its way.";

export function ResendVerificationButton({
  email,
  label = "Send a new link",
}: {
  email: string;
  label?: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleResend() {
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = (await response.json()) as {
        data?: { message?: string };
        error?: string;
      };

      if (notifyIfRateLimited(response, result.error)) return;

      setMessage(result.data?.message ?? FALLBACK_MESSAGE);
    } catch {
      setMessage("Could not reach the server. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleResend}
        disabled={isPending}
      >
        {isPending ? "Sending…" : label}
      </Button>
      {message ? (
        <p role="status" className="text-center text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
