import { ItemTypeIcon } from "@/components/dashboard/ItemTypeIcon";
import { TYPE_BLURBS } from "@/components/landing/landing-content";
import { Badge } from "@/components/ui/badge";
import { SYSTEM_ITEM_TYPES } from "@/lib/item-types";

export function TypeGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {SYSTEM_ITEM_TYPES.map((type) => (
        <div
          key={type.name}
          className="rounded-xl border border-l-4 bg-card p-4 transition-colors hover:bg-muted/40"
          style={{ borderLeftColor: type.color }}
        >
          <div className="flex items-center gap-2.5">
            <ItemTypeIcon
              icon={type.icon}
              className="size-4 shrink-0"
              style={{ color: type.color }}
            />
            <h3 className="font-medium capitalize">{type.name}</h3>
            {type.isPro ? (
              <Badge
                variant="outline"
                className="ml-auto h-4 border-pro/30 bg-pro/10 px-1.5 text-[0.6rem] font-semibold tracking-wider text-pro"
              >
                PRO
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {TYPE_BLURBS[type.name]}
          </p>
        </div>
      ))}
    </div>
  );
}
