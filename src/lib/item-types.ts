export type ItemTypeIconName =
  | "Code"
  | "Sparkles"
  | "Terminal"
  | "StickyNote"
  | "File"
  | "Image"
  | "Link";

export interface SystemItemType {
  name: string;
  icon: ItemTypeIconName;
  color: string;
  isPro: boolean;
}

export const SYSTEM_ITEM_TYPES: SystemItemType[] = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isPro: false },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isPro: false },
  { name: "command", icon: "Terminal", color: "#f97316", isPro: false },
  { name: "note", icon: "StickyNote", color: "#fde047", isPro: false },
  { name: "file", icon: "File", color: "#6b7280", isPro: true },
  { name: "image", icon: "Image", color: "#ec4899", isPro: true },
  { name: "link", icon: "Link", color: "#10b981", isPro: false },
];

export const SYSTEM_TYPE_ORDER = SYSTEM_ITEM_TYPES.map((type) => type.name);

export const PRO_TYPE_NAMES = new Set(
  SYSTEM_ITEM_TYPES.filter((type) => type.isPro).map((type) => type.name)
);

export const FALLBACK_COLOR = "#6b7280";
