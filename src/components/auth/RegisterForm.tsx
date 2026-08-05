"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthError } from "@/components/auth/AuthError";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/button";
import { notifyIfRateLimited } from "@/lib/rate-limit-toast";
import { registerSchema } from "@/lib/validations/auth";

type RegisterField = "name" | "email" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<RegisterField, string>>;

export function RegisterForm() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as RegisterField | undefined;
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        if (!notifyIfRateLimited(response, result.error)) {
          setError(result.error ?? "Could not create the account");
        }
        return;
      }

      router.push(
        `/register/check-email?email=${encodeURIComponent(parsed.data.email)}`
      );
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <AuthError message={error} /> : null}
      <AuthField
        name="name"
        label="Name"
        autoComplete="name"
        error={fieldErrors.name}
      />
      <AuthField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={fieldErrors.email}
      />
      <AuthField
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        error={fieldErrors.password}
      />
      <AuthField
        name="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={fieldErrors.confirmPassword}
      />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
