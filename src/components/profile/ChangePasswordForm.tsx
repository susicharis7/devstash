"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";

import { changePasswordAction } from "@/actions/account";
import { AuthError } from "@/components/auth/AuthError";
import { AuthField } from "@/components/auth/AuthField";
import { Button } from "@/components/ui/button";
import { changePasswordSchema } from "@/lib/validations/auth";

type ChangePasswordField = "currentPassword" | "password" | "confirmPassword";
type FieldErrors = Partial<Record<ChangePasswordField, string>>;

export function ChangePasswordForm({ email }: { email: string }) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setDone(false);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const input = {
      currentPassword: formData.get("currentPassword"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const parsed = changePasswordSchema.safeParse(input);
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as ChangePasswordField | undefined;
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setIsPending(true);

    try {
      const result = await changePasswordAction(parsed.data);

      if (!result.success) {
        setError(result.error ?? "Could not change the password");
        return;
      }

      form.reset();
      setDone(true);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <input
        type="text"
        name="username"
        value={email}
        autoComplete="username"
        readOnly
        hidden
      />
      {error ? <AuthError message={error} /> : null}
      {done ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500"
        >
          <CircleCheck className="size-4 shrink-0" />
          Your password has been updated.
        </p>
      ) : null}
      <AuthField
        name="currentPassword"
        label="Current password"
        type="password"
        autoComplete="current-password"
        error={fieldErrors.currentPassword}
      />
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
      <Button type="submit" disabled={isPending}>
        {isPending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
