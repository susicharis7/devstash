import Link from "next/link";
import { Star } from "lucide-react";

import type { DashboardCollection } from "@/lib/db/collections";
import { ItemTypeIcon } from "@/components/dashboard/ItemTypeIcon";

export function CollectionCard({ collection }: { collection: DashboardCollection }) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="flex flex-col rounded-xl border border-l-4 bg-card p-5 transition-colors hover:bg-muted/40"
      style={{ borderLeftColor: collection.accentColor }}
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
        {collection.types.map((type) => (
          <ItemTypeIcon
            key={type.icon}
            icon={type.icon}
            className="size-4"
            style={{ color: type.color }}
          />
        ))}
      </div>
    </Link>
  );
}
