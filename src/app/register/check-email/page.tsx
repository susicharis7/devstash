import Link from "next/link";
import type { Metadata } from "next";
import { MailCheck } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthIcon } from "@/components/auth/AuthIcon";
import { ResendVerificationButton } from "@/components/auth/ResendVerificationButton";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Check your inbox",
  robots: { index: false, follow: false },
};

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthCard
      icon={
        <AuthIcon icon={MailCheck} className="bg-primary/10 text-foreground" />
      }
      title="Check your inbox"
      description={
        email
          ? `We sent a verification link to ${email}. Click it to activate your account.`
          : "We sent you a verification link. Click it to activate your account."
      }
      footer={
        <>
          Already verified?{" "}
          <Link href="/sign-in" className="text-foreground underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-center text-sm text-muted-foreground">
          The link expires in 24 hours. Nothing in your inbox? Check spam first.
        </p>
        {email ? <ResendVerificationButton email={email} /> : null}
        <Button asChild variant="ghost" className="w-full">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
