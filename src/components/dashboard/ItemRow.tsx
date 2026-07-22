import { Pin, Star } from "lucide-react";

import { itemTypesById, type Item } from "@/lib/mock-data";
import { getItemTypeIcon } from "@/lib/item-type-icons";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function ItemRow({ item }: { item: Item }) {
  const type = itemTypesById[item.itemTypeId];
  const accent = type?.color ?? "#6b7280";
  const Icon = getItemTypeIcon(type?.icon ?? "File");

  return (
    <div
      className="flex items-start gap-4 rounded-xl border border-l-4 bg-card p-4"
      style={{ borderLeftColor: accent }}
    >
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"
        style={{ color: accent }}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium">{item.title}</h3>
          {item.isPinned ? (
            <Pin className="size-3.5 shrink-0 text-muted-foreground" />
          ) : null}
          {item.isFavorite ? (
            <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
          ) : null}
        </div>
        {item.description ? (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {item.description}
          </p>
        ) : null}
        {item.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">
        {dateFormatter.format(new Date(item.createdAt))}
      </span>
    </div>
  );
}
