import Link from "next/link";
import type { Metadata } from "next";
import { CircleX } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthIcon } from "@/components/auth/AuthIcon";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Button } from "@/components/ui/button";
import { findValidPasswordResetToken } from "@/lib/auth/password-reset-tokens";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

function ResetLinkInvalid() {
  return (
    <AuthCard
      icon={
        <AuthIcon
          icon={CircleX}
          className="bg-destructive/10 text-destructive"
        />
      }
      title="Link no longer valid"
      description="Reset links expire after an hour and can only be used once. Request a fresh one to continue."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/sign-in" className="text-foreground underline">
            Sign in
          </Link>
        </>
      }
    >
      <Button asChild className="w-full">
        <Link href="/forgot-password">Request a new link</Link>
      </Button>
    </AuthCard>
  );
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const valid = token ? await findValidPasswordResetToken(token) : null;

  return valid && token ? (
    <ResetPasswordForm token={token} email={valid.email} />
  ) : (
    <ResetLinkInvalid />
  );
}
