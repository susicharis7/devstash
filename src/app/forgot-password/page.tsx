import Link from "next/link";
import type { Metadata } from "next";
import { KeyRound } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthIcon } from "@/components/auth/AuthIcon";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      icon={
        <AuthIcon icon={KeyRound} className="bg-primary/10 text-foreground" />
      }
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to choose a new one."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground underline">
            Create one
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
