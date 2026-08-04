import type { Metadata } from "next";

import { VerificationResult } from "@/components/auth/VerificationResult";
import { consumeVerificationToken } from "@/lib/auth/verification-tokens";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const outcome = token
    ? await consumeVerificationToken(token)
    : ({ state: "invalid", email: null } as const);

  return <VerificationResult state={outcome.state} email={outcome.email} />;
}
