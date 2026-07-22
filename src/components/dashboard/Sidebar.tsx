import { Layers } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Layers className="size-4" />
        </div>
        <span className="text-base font-semibold">DevStash</span>
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold">Sidebar</h2>
      </div>
    </aside>
  );
}
