import { connection } from "next/server";

import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/sidebar-context";
import { TopBar } from "@/components/dashboard/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const [session, itemTypes, collections] = await Promise.all([
    auth(),
    getSidebarItemTypes(),
    getSidebarCollections(),
  ]);

  return (
    <SidebarProvider>
      <div className="flex h-dvh overflow-hidden">
        <Sidebar
          itemTypes={itemTypes}
          collections={collections}
          user={session?.user ?? null}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
