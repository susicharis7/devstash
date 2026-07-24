"use client";

import { cn } from "@/lib/utils";
import type { SidebarCollections } from "@/lib/db/collections";
import type { SidebarItemType } from "@/lib/db/items";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarContent } from "@/components/dashboard/SidebarContent";
import { useSidebar } from "@/components/dashboard/sidebar-context";

export function Sidebar({
  itemTypes,
  collections,
}: {
  itemTypes: SidebarItemType[];
  collections: SidebarCollections;
}) {
  const { open, openMobile, setOpenMobile } = useSidebar();

  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 overflow-hidden border-r transition-[width] duration-200 ease-in-out md:block",
          open ? "w-64" : "w-0 border-r-0"
        )}
      >
        <div className="h-full w-64">
          <SidebarContent itemTypes={itemTypes} collections={collections} />
        </div>
      </aside>

      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-64 gap-0 p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar navigation</SheetTitle>
            <SheetDescription>
              Browse item types and collections.
            </SheetDescription>
          </SheetHeader>
          <SidebarContent itemTypes={itemTypes} collections={collections} />
        </SheetContent>
      </Sheet>
    </>
  );
}
