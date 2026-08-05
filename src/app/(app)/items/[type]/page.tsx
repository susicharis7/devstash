import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { getItemsByType } from "@/lib/db/items";
import { getSystemTypeBySlug, typeLabel } from "@/lib/item-types";
import { ItemCard } from "@/components/items/ItemCard";
import { ItemTypeIcon } from "@/components/dashboard/ItemTypeIcon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const systemType = getSystemTypeBySlug(type);
  return { title: systemType ? typeLabel(systemType.name) : "Items" };
}

export default async function ItemsByTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  await connection();

  const { type } = await params;
  const systemType = getSystemTypeBySlug(type);
  if (!systemType) notFound();

  const items = await getItemsByType(systemType.name);
  const label = typeLabel(systemType.name);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex items-center gap-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted"
          style={{ color: systemType.color }}
        >
          <ItemTypeIcon icon={systemType.icon} className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{label}</h1>
          <p className="mt-1 text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </header>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-card/40 p-12 text-center">
          <p className="text-muted-foreground">
            No {label.toLowerCase()} yet.
          </p>
        </div>
      )}
    </div>
  );
}
