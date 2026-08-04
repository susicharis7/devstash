import Link from "next/link";
import { Layers } from "lucide-react";

import { cn } from "@/lib/utils";

export function AuthCard({
  title,
  description,
  icon,
  children,
  footer,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-lg font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Layers className="size-4" />
          </span>
          DevStash
        </Link>

        <div className="rounded-xl border bg-card p-6">
          {icon ? <div className="mb-5 flex justify-center">{icon}</div> : null}
          <h1 className={cn("text-xl font-semibold", icon && "text-center")}>
            {title}
          </h1>
          <p
            className={cn(
              "mt-1 text-sm break-words text-muted-foreground",
              icon && "text-center"
            )}
          >
            {description}
          </p>
          <div className="mt-6">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </p>
      </div>
    </div>
  );
}
