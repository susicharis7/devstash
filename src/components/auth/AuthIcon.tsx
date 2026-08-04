import { createElement } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function AuthIcon({
  icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-12 items-center justify-center rounded-full",
        className
      )}
    >
      {createElement(icon, { className: "size-6" })}
    </span>
  );
}
