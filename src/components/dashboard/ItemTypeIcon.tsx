import { createElement } from "react";
import type { LucideProps } from "lucide-react";

import { getItemTypeIcon } from "@/lib/item-type-icons";

export function ItemTypeIcon({
  icon,
  ...props
}: { icon: string } & LucideProps) {
  return createElement(getItemTypeIcon(icon), props);
}
