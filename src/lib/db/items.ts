import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";
const FALLBACK_COLOR = "#6b7280";

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  accentColor: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: string;
}

const itemQuery = {
  select: {
    id: true,
    title: true,
    description: true,
    isPinned: true,
    isFavorite: true,
    createdAt: true,
    itemType: { select: { icon: true, color: true } },
    tags: { select: { name: true } },
  },
} as const;

type ItemRecord = {
  id: string;
  title: string;
  description: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: Date;
  itemType: { icon: string; color: string };
  tags: { name: string }[];
};

function toDashboardItem(item: ItemRecord): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    icon: item.itemType.icon,
    accentColor: item.itemType.color ?? FALLBACK_COLOR,
    tags: item.tags.map((tag) => tag.name),
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    createdAt: item.createdAt.toISOString(),
  };
}

export async function getPinnedItems(): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { user: { email: DEMO_USER_EMAIL }, isPinned: true },
    orderBy: { updatedAt: "desc" },
    ...itemQuery,
  });
  return items.map(toDashboardItem);
}

export async function getRecentItems(limit = 10): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { user: { email: DEMO_USER_EMAIL } },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...itemQuery,
  });
  return items.map(toDashboardItem);
}

export interface SidebarItemType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  count: number;
  isPro: boolean;
}

const SYSTEM_TYPE_ORDER = [
  "snippet",
  "prompt",
  "command",
  "note",
  "file",
  "image",
  "link",
];

const PRO_TYPE_NAMES = new Set(["file", "image"]);

export async function getSidebarItemTypes(): Promise<SidebarItemType[]> {
  const [types, grouped] = await Promise.all([
    prisma.itemType.findMany({
      where: { isSystem: true },
      select: { id: true, name: true, icon: true, color: true },
    }),
    prisma.item.groupBy({
      by: ["itemTypeId"],
      where: { user: { email: DEMO_USER_EMAIL } },
      _count: { _all: true },
    }),
  ]);

  const countByType = new Map(
    grouped.map((group) => [group.itemTypeId, group._count._all])
  );

  const orderIndex = (name: string) => {
    const index = SYSTEM_TYPE_ORDER.indexOf(name);
    return index === -1 ? SYSTEM_TYPE_ORDER.length : index;
  };

  return types
    .sort((a, b) => orderIndex(a.name) - orderIndex(b.name))
    .map((type) => ({
    id: type.id,
    name: `${type.name[0].toUpperCase()}${type.name.slice(1)}s`,
    slug: `${type.name}s`,
    icon: type.icon,
    color: type.color,
    count: countByType.get(type.id) ?? 0,
    isPro: PRO_TYPE_NAMES.has(type.name),
  }));
}
