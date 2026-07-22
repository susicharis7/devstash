import Link from "next/link";
import { Star } from "lucide-react";

import { itemTypesById, type Collection } from "@/lib/mock-data";
import { getItemTypeIcon } from "@/lib/item-type-icons";

export function CollectionCard({ collection }: { collection: Collection }) {
  const dominantType = itemTypesById[collection.itemTypeIds[0]];
  const accent = dominantType?.color ?? "#6b7280";

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="flex flex-col rounded-xl border border-l-4 bg-card p-5 transition-colors hover:bg-muted/40"
      style={{ borderLeftColor: accent }}
    >
      <div className="flex items-center gap-2">
        <h3 className="min-w-0 flex-1 truncate font-semibold">
          {collection.name}
        </h3>
        {collection.isFavorite ? (
          <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
        ) : null}
      </div>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {collection.itemCount} items
      </p>
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {collection.description}
      </p>
      <div className="mt-4 flex items-center gap-2">
        {collection.itemTypeIds.map((id) => {
          const type = itemTypesById[id];
          if (!type) return null;
          const Icon = getItemTypeIcon(type.icon);
          return <Icon key={id} className="size-4" style={{ color: type.color }} />;
        })}
      </div>
    </Link>
  );
}
