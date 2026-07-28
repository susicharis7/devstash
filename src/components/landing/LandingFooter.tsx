import { Layers } from "lucide-react";

import { GitHubIcon } from "@/components/icons/GitHubIcon";

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-6 py-8 sm:flex-row sm:items-center">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Layers className="size-4" />
          DevStash
        </span>
        <span className="text-sm text-muted-foreground">
          A developer knowledge hub.
        </span>
        <a
          href="https://github.com/susicharis7/devstash"
          target="_blank"
          rel="noreferrer"
          aria-label="DevStash on GitHub"
          className="text-muted-foreground transition-colors hover:text-foreground sm:ml-auto"
        >
          <GitHubIcon className="size-5" />
        </a>
      </div>
    </footer>
  );
}
