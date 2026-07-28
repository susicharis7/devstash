import Link from "next/link";

import { CtaButtons } from "@/components/landing/CtaButtons";

export function ClosingCta() {
  return (
    <section className="reveal mx-auto w-full max-w-6xl px-6 py-16">
      <div className="rounded-xl border bg-card p-8 sm:p-12">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Start your stash
        </h2>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Save the first snippet in under a minute. Everything you add stays
          searchable, taggable and yours to export.
        </p>
        <CtaButtons className="mt-8" />
        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-foreground underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
