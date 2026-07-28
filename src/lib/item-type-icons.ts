import {
  Code,
  File,
  Image,
  Link,
  Sparkles,
  StickyNote,
  Terminal,
  type LucideIcon,
} from "lucide-react";

import type { ItemTypeIconName } from "@/lib/item-types";

export const ITEM_TYPE_ICONS: Record<ItemTypeIconName, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
};

export function getItemTypeIcon(icon: string): LucideIcon {
  return ITEM_TYPE_ICONS[icon as ItemTypeIconName] ?? File;
}
