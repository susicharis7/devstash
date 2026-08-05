import { ItemTypeIcon } from "@/components/dashboard/ItemTypeIcon";
import type { SidebarItemType } from "@/lib/db/items";

export function TypeBreakdown({ types }: { types: SidebarItemType[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {types.map((type) => (
        <div
          key={type.id}
          className="flex items-center gap-3 rounded-lg border bg-background p-3"
        >
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"
            style={{ color: type.color }}
          >
            <ItemTypeIcon icon={type.icon} className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold leading-none">{type.count}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {type.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
