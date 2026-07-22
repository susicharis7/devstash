"use client";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarContent } from "@/components/dashboard/SidebarContent";
import { useSidebar } from "@/components/dashboard/sidebar-context";

export function Sidebar() {
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
          <SidebarContent />
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
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
