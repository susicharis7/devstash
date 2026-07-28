"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { DEMO_HITS, DEMO_QUERIES } from "@/components/landing/landing-content";

const TYPE_MS = 90;
const HOLD_MS = 2400;

export function QueryDemo() {
  const [index, setIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(DEMO_QUERIES[0].length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const query = DEMO_QUERIES[index];

    if (typedLength < query.length) {
      const id = setTimeout(() => setTypedLength(typedLength + 1), TYPE_MS);
      return () => clearTimeout(id);
    }

    const id = setTimeout(() => {
      setIndex((current) => (current + 1) % DEMO_QUERIES.length);
      setTypedLength(0);
    }, HOLD_MS);

    return () => clearTimeout(id);
  }, [index, typedLength]);

  const query = DEMO_QUERIES[index];
  const hits = DEMO_HITS[query] ?? [];

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <p className="flex min-h-7 min-w-0 items-center font-mono text-lg">
          <span className="truncate">{query.slice(0, typedLength)}</span>
          <span
            aria-hidden="true"
            className="ml-0.5 inline-block h-5 w-2 shrink-0 bg-primary motion-safe:animate-caret"
          />
        </p>
        <span className="ml-auto hidden shrink-0 rounded border px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:block">
          ⌘K
        </span>
      </div>

      <ul className="mt-4 border-t pt-1">
        {hits.map((hit) => (
          <li
            key={hit.title}
            className="flex items-baseline gap-3 border-b py-2 text-sm last:border-b-0"
          >
            <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">
              {hit.kind}
            </span>
            <span className="min-w-0 truncate">{hit.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
