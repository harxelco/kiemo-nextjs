"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface ShopBridgeValue {
  pendingCategory: string | null;
  requestCategory: (category: string) => void;
  clearPending: () => void;
}

const ShopBridgeContext = createContext<ShopBridgeValue | null>(null);

export function ShopBridgeProvider({ children }: { children: React.ReactNode }) {
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);

  const requestCategory = useCallback((category: string) => {
    setPendingCategory(category);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const clearPending = useCallback(() => setPendingCategory(null), []);

  return (
    <ShopBridgeContext.Provider value={{ pendingCategory, requestCategory, clearPending }}>
      {children}
    </ShopBridgeContext.Provider>
  );
}

export function useShopBridge(): ShopBridgeValue {
  const ctx = useContext(ShopBridgeContext);
  if (!ctx) throw new Error("useShopBridge must be used within ShopBridgeProvider");
  return ctx;
}
