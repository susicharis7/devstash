"use client";

import * as React from "react";

import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarContextValue {
  open: boolean;
  openMobile: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  setOpenMobile: (open: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(true);
  const [openMobile, setOpenMobile] = React.useState(false);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((value) => !value);
      return;
    }
    setOpen((value) => !value);
  }, [isMobile]);

  const value = React.useMemo(
    () => ({ open, openMobile, isMobile, toggleSidebar, setOpenMobile }),
    [open, openMobile, isMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
