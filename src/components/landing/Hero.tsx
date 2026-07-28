import { CtaButtons } from "@/components/landing/CtaButtons";
import { QueryDemo } from "@/components/landing/QueryDemo";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-16 pb-20 sm:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase motion-safe:animate-rise">
            Developer knowledge hub
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl motion-safe:animate-rise motion-safe:[animation-delay:90ms]">
            Everything you saved, one search away.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground motion-safe:animate-rise motion-safe:[animation-delay:180ms]">
            Snippets, commands, prompts, notes and links live in one place
            instead of scattered across editors, chat histories and bookmarks.
          </p>
          <CtaButtons className="mt-8 motion-safe:animate-rise motion-safe:[animation-delay:270ms]" />
          <p className="mt-4 font-mono text-xs text-muted-foreground motion-safe:animate-rise motion-safe:[animation-delay:340ms]">
            Free to start · No card required
          </p>
        </div>

        <div className="motion-safe:animate-rise motion-safe:[animation-delay:420ms]">
          <QueryDemo />
        </div>
      </div>
    </section>
  );
}
