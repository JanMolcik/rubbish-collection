"use client";

import { createContext, useContext } from "react";
import type { WasteCalendarConfig } from "@/components/wasteCalendarTypes";

const WasteCalendarConfigContext = createContext<WasteCalendarConfig | null>(null);

export function WasteCalendarConfigProvider({
  config,
  children,
}: {
  config: WasteCalendarConfig;
  children: React.ReactNode;
}) {
  return <WasteCalendarConfigContext.Provider value={config}>{children}</WasteCalendarConfigContext.Provider>;
}

export function useWasteCalendarConfig(): WasteCalendarConfig {
  const context = useContext(WasteCalendarConfigContext);

  if (!context) {
    throw new Error("useWasteCalendarConfig must be used inside WasteCalendarConfigProvider");
  }

  return context;
}
