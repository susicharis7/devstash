import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaButtons({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Button asChild size="lg">
        <Link href="/register">Create account</Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link href="/sign-in">Sign in</Link>
      </Button>
    </div>
  );
}
