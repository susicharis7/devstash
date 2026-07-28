import Link from "next/link";

import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}) {
  const { callbackUrl, registered } = await searchParams;

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
      {registered ? (
        <p className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
          Account created. Sign in to continue.
        </p>
      ) : null}
      <SignInForm callbackUrl={callbackUrl ?? "/dashboard"} />
    </AuthCard>
  );
}
