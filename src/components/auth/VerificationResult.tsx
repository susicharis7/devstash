import Link from "next/link";
import { BadgeCheck, CircleCheck, CircleX, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthIcon } from "@/components/auth/AuthIcon";
import { ResendVerificationButton } from "@/components/auth/ResendVerificationButton";
import { Button } from "@/components/ui/button";
import type { VerificationState } from "@/lib/auth/verification-tokens";

interface ResultContent {
  icon: LucideIcon;
  tone: string;
  title: string;
  description: string;
  canResend: boolean;
}

const RESULTS: Record<VerificationState, ResultContent> = {
  verified: {
    icon: CircleCheck,
    tone: "bg-emerald-500/10 text-emerald-500",
    title: "Email verified",
    description: "Your account is ready. Sign in to start stashing.",
    canResend: false,
  },
  "already-verified": {
    icon: BadgeCheck,
    tone: "bg-emerald-500/10 text-emerald-500",
    title: "Already verified",
    description:
      "This link has been used before. Your email is confirmed, so you can sign in.",
    canResend: false,
  },
  expired: {
    icon: Clock,
    tone: "bg-amber-500/10 text-amber-500",
    title: "Link expired",
    description:
      "Verification links last 24 hours. Send yourself a fresh one to finish setting up.",
    canResend: true,
  },
  invalid: {
    icon: CircleX,
    tone: "bg-destructive/10 text-destructive",
    title: "Link not valid",
    description:
      "We don't recognise this verification link. It may have been altered, or replaced by a newer one.",
    canResend: false,
  },
};

export function VerificationResult({
  state,
  email,
}: {
  state: VerificationState;
  email: string | null;
}) {
  const content = RESULTS[state];
  const showResend = content.canResend && Boolean(email);

  return (
    <AuthCard
      icon={<AuthIcon icon={content.icon} className={content.tone} />}
      title={content.title}
      description={content.description}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground underline">
            Create one
          </Link>
        </>
      }
    >
      <div className="space-y-3">
        {showResend && email ? (
          <ResendVerificationButton email={email} />
        ) : null}
        <Button
          asChild
          variant={showResend ? "ghost" : "default"}
          className="w-full"
        >
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
