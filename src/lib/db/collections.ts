import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { demoUserWhere } from "@/lib/db/demo-user";
import { FALLBACK_COLOR } from "@/lib/item-types";

export interface DashboardCollectionType {
  icon: string;
  color: string;
}

export interface DashboardCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  accentColor: string;
  types: DashboardCollectionType[];
}

export interface DashboardStats {
  items: number;
  collections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

export interface SidebarCollection {
  id: string;
  name: string;
  itemCount: number;
  accentColor: string;
}

export interface SidebarCollections {
  favorites: SidebarCollection[];
  recents: SidebarCollection[];
}

const collectionTypeInclude = {
  items: {
    select: {
      item: {
        select: {
          itemType: { select: { icon: true, color: true, name: true } },
        },
      },
    },
  },
} as const;

type CollectionRecord = Prisma.CollectionGetPayload<{
  include: typeof collectionTypeInclude;
}>;

type CollectionTypeItem = CollectionRecord["items"][number];

const fetchDemoCollections = cache(() =>
  prisma.collection.findMany({
    where: demoUserWhere,
    orderBy: { updatedAt: "desc" },
    include: collectionTypeInclude,
  })
);

function rankCollectionTypes(items: CollectionTypeItem[]) {
  const counts = new Map<
    string,
    { icon: string; color: string; count: number }
  >();
  for (const { item } of items) {
    const type = item.itemType;
    const existing = counts.get(type.name);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(type.name, { icon: type.icon, color: type.color, count: 1 });
    }
  }

  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.icon.localeCompare(b.icon)
  );
}

function toDashboardCollection(
  collection: CollectionRecord
): DashboardCollection {
  const ranked = rankCollectionTypes(collection.items);

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    itemCount: collection.items.length,
    accentColor: ranked[0]?.color ?? FALLBACK_COLOR,
    types: ranked.map(({ icon, color }) => ({ icon, color })),
  };
}

function toSidebarCollection(collection: CollectionRecord): SidebarCollection {
  return {
    id: collection.id,
    name: collection.name,
    itemCount: collection.items.length,
    accentColor: rankCollectionTypes(collection.items)[0]?.color ?? FALLBACK_COLOR,
  };
}

export async function getRecentCollections(
  limit = 6
): Promise<DashboardCollection[]> {
  const collections = await fetchDemoCollections();
  return collections.slice(0, limit).map(toDashboardCollection);
}

export async function getSidebarCollections(
  recentLimit = 6
): Promise<SidebarCollections> {
  const collections = await fetchDemoCollections();

  return {
    favorites: collections
      .filter((collection) => collection.isFavorite)
      .map(toSidebarCollection),
    recents: collections
      .filter((collection) => !collection.isFavorite)
      .slice(0, recentLimit)
      .map(toSidebarCollection),
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const where = demoUserWhere;
  const [items, collections, favoriteItems, favoriteCollections] =
    await Promise.all([
      prisma.item.count({ where }),
      prisma.collection.count({ where }),
      prisma.item.count({ where: { ...where, isFavorite: true } }),
      prisma.collection.count({ where: { ...where, isFavorite: true } }),
    ]);

  return { items, collections, favoriteItems, favoriteCollections };
}
