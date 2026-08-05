import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/db/current-user";
import { PRO_TYPE_NAMES, SYSTEM_TYPE_ORDER } from "@/lib/item-types";

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

type ItemRecord = Prisma.ItemGetPayload<typeof itemQuery>;

function toDashboardItem(item: ItemRecord): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    icon: item.itemType.icon,
    accentColor: item.itemType.color,
    tags: item.tags.map((tag) => tag.name),
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    createdAt: item.createdAt.toISOString(),
  };
}

export async function getPinnedItems(): Promise<DashboardItem[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    ...itemQuery,
  });
  return items.map(toDashboardItem);
}

export async function getRecentItems(limit = 10): Promise<DashboardItem[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const items = await prisma.item.findMany({
    where: { userId },
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

async function countItemsByType(userId: string | null) {
  if (!userId) return new Map<string, number>();

  const grouped = await prisma.item.groupBy({
    by: ["itemTypeId"],
    where: { userId },
    _count: { _all: true },
  });

  return new Map(grouped.map((group) => [group.itemTypeId, group._count._all]));
}

export const getSidebarItemTypes = cache(async (): Promise<
  SidebarItemType[]
> => {
  const userId = await getCurrentUserId();
  const [types, countByType] = await Promise.all([
    prisma.itemType.findMany({
      where: { isSystem: true },
      select: { id: true, name: true, icon: true, color: true },
    }),
    countItemsByType(userId),
  ]);

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
});
