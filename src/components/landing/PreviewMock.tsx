import { Pin } from "lucide-react";

import { ItemTypeIcon } from "@/components/dashboard/ItemTypeIcon";
import {
  SAMPLE_COLLECTIONS,
  SAMPLE_ITEMS,
} from "@/components/landing/landing-content";

export function PreviewMock() {
  return (
    <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
      <div className="min-w-0 space-y-3">
        {SAMPLE_ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-4 rounded-xl border border-l-4 bg-card p-4 transition-transform hover:-translate-y-0.5"
            style={{ borderLeftColor: item.accentColor }}
          >
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"
              style={{ color: item.accentColor }}
            >
              <ItemTypeIcon icon={item.icon} className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-medium">{item.title}</h3>
                {item.isPinned ? (
                  <Pin className="size-3.5 shrink-0 text-muted-foreground" />
                ) : null}
              </div>
              <p className="mt-0.5 truncate font-mono text-sm text-muted-foreground">
                {item.description}
              </p>
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
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {item.date}
            </span>
          </div>
        ))}
      </div>

      <div className="min-w-0 space-y-3">
        {SAMPLE_COLLECTIONS.map((collection) => (
          <div
            key={collection.name}
            className="rounded-xl border bg-card p-4 transition-transform hover:-translate-y-0.5"
            style={{ borderColor: `${collection.accentColor}55` }}
          >
            <div className="flex items-center gap-2.5">
              <ItemTypeIcon
                icon={collection.icon}
                className="size-4 shrink-0"
                style={{ color: collection.accentColor }}
              />
              <h3 className="truncate font-medium">{collection.name}</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {collection.itemCount} items
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
