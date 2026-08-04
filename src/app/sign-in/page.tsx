import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <AuthCard
      title="Sign in"
      description="Access your snippets, prompts and commands."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground underline">
            Create one
          </Link>
        </>
      }
    >
      <SignInForm callbackUrl={callbackUrl ?? "/dashboard"} />
    </AuthCard>
  );
}
