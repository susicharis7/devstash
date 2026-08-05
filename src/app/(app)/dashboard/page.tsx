import { connection } from "next/server";
import Link from "next/link";
import { FolderHeart, FolderOpen, LayoutGrid, Pin, Star } from "lucide-react";

import { getDashboardStats, getRecentCollections } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems } from "@/lib/db/items";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { ItemRow } from "@/components/dashboard/ItemRow";
import { StatCard } from "@/components/dashboard/StatCard";

function SectionHeader({
  title,
  icon: Icon,
  action,
}: {
  title: string;
  icon?: typeof Pin;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        {Icon ? <Icon className="size-5 text-muted-foreground" /> : null}
        {title}
      </h2>
      {action}
    </div>
  );
}

export default async function DashboardPage() {
  await connection();

  const [recentCollections, stats, pinnedItems, recentItems] =
    await Promise.all([
      getRecentCollections(),
      getDashboardStats(),
      getPinnedItems(),
      getRecentItems(),
    ]);

  const statCards = [
    { icon: LayoutGrid, label: "Items", value: stats.items },
    { icon: FolderOpen, label: "Collections", value: stats.collections },
    { icon: Star, label: "Favorite Items", value: stats.favoriteItems },
    {
      icon: FolderHeart,
      label: "Favorite Collections",
      value: stats.favoriteCollections,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Your developer knowledge hub
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>

      <section>
        <SectionHeader
          title="Collections"
          action={
            <Link
              href="/collections"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {pinnedItems.length > 0 ? (
        <section>
          <SectionHeader title="Pinned" icon={Pin} />
          <div className="space-y-3">
            {pinnedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader title="Recent" icon={LayoutGrid} />
        <div className="space-y-3">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
