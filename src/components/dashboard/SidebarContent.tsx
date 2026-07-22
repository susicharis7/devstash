"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Collapsible } from "radix-ui";
import { ChevronDown, Folder, Layers, Settings, Star } from "lucide-react";

import { collections, currentUser, itemTypes } from "@/lib/mock-data";
import { getItemTypeIcon } from "@/lib/item-type-icons";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/dashboard/sidebar-context";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CollapsibleSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Collapsible.Root defaultOpen className="group/section">
      <Collapsible.Trigger className="flex w-full items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
        <span>{label}</span>
        <ChevronDown className="size-3.5 transition-transform group-data-[state=closed]/section:-rotate-90" />
      </Collapsible.Trigger>
      <Collapsible.Content className="mt-1 space-y-0.5">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function NavLink({
  href,
  icon,
  label,
  trailing,
  active,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
    </Link>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pt-3 pb-1 text-[0.65rem] font-semibold tracking-wider text-muted-foreground/70 uppercase">
      {children}
    </p>
  );
}

export function SidebarContent() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const closeMobile = () => setOpenMobile(false);
  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const otherCollections = collections.filter((c) => !c.isFavorite);

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Layers className="size-4" />
        </div>
        <span className="text-base font-semibold">DevStash</span>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav className="flex flex-col gap-4 p-3">
          <CollapsibleSection label="Types">
            {itemTypes.map((type) => {
              const Icon = getItemTypeIcon(type.icon);
              const href = `/items/${type.slug}`;
              return (
                <NavLink
                  key={type.id}
                  href={href}
                  active={pathname === href}
                  onNavigate={closeMobile}
                  icon={<Icon className="size-4" style={{ color: type.color }} />}
                  label={type.name}
                  trailing={
                    <span className="text-xs text-muted-foreground">
                      {type.count}
                    </span>
                  }
                />
              );
            })}
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection label="Collections">
            <GroupLabel>Favorites</GroupLabel>
            {favoriteCollections.map((collection) => {
              const href = `/collections/${collection.id}`;
              return (
                <NavLink
                  key={collection.id}
                  href={href}
                  active={pathname === href}
                  onNavigate={closeMobile}
                  icon={<Folder className="size-4 text-muted-foreground" />}
                  label={collection.name}
                  trailing={
                    <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                  }
                />
              );
            })}

            <GroupLabel>All Collections</GroupLabel>
            {otherCollections.map((collection) => {
              const href = `/collections/${collection.id}`;
              return (
                <NavLink
                  key={collection.id}
                  href={href}
                  active={pathname === href}
                  onNavigate={closeMobile}
                  icon={<Folder className="size-4 text-muted-foreground" />}
                  label={collection.name}
                  trailing={
                    <span className="text-xs text-muted-foreground">
                      {collection.itemCount}
                    </span>
                  }
                />
              );
            })}
          </CollapsibleSection>
        </nav>
      </ScrollArea>

      <div className="flex shrink-0 items-center gap-3 border-t p-3">
        <Avatar>
          {currentUser.image ? (
            <AvatarImage src={currentUser.image} alt={currentUser.name} />
          ) : null}
          <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{currentUser.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {currentUser.email}
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="size-4" />
        </Button>
      </div>
    </div>
  );
}
