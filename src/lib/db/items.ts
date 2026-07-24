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
