import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";
const FALLBACK_COLOR = "#6b7280";

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

type CollectionTypeItem = {
  item: { itemType: { icon: string; color: string; name: string } };
};

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

export async function getRecentCollections(
  limit = 6
): Promise<DashboardCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { user: { email: DEMO_USER_EMAIL } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: collectionTypeInclude,
  });

  return collections.map((collection) => {
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
  });
}

export async function getSidebarCollections(
  recentLimit = 6
): Promise<SidebarCollections> {
  const collections = await prisma.collection.findMany({
    where: { user: { email: DEMO_USER_EMAIL } },
    orderBy: { updatedAt: "desc" },
    include: collectionTypeInclude,
  });

  const toSidebarCollection = (
    collection: (typeof collections)[number]
  ): SidebarCollection => ({
    id: collection.id,
    name: collection.name,
    itemCount: collection.items.length,
    accentColor: rankCollectionTypes(collection.items)[0]?.color ?? FALLBACK_COLOR,
  });

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
  const where = { user: { email: DEMO_USER_EMAIL } };
  const [items, collections, favoriteItems, favoriteCollections] =
    await Promise.all([
      prisma.item.count({ where }),
      prisma.collection.count({ where }),
      prisma.item.count({ where: { ...where, isFavorite: true } }),
      prisma.collection.count({ where: { ...where, isFavorite: true } }),
    ]);

  return { items, collections, favoriteItems, favoriteCollections };
}
