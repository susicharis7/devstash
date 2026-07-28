import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function FavoriteStar({ className }: { className?: string }) {
  return <Star className={cn("fill-yellow-400 text-yellow-400", className)} />;
}
