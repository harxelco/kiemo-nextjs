"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { OrderLineItem } from "@/types/order";

interface CheckoutContextValue {
  isOpen: boolean;
  items: OrderLineItem[];
  open: (items: OrderLineItem[]) => void;
  close: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<OrderLineItem[]>([]);

  const open = useCallback((newItems: OrderLineItem[]) => {
    setItems(newItems);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <CheckoutContext.Provider value={{ isOpen, items, open, close }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within CheckoutProvider");
  return ctx;
}
