"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CartItem, Product } from "@/types/product";

interface CartContextValue {
  items: CartItem[];
  isCartOpen: boolean;
  toast: { visible: boolean; productName: string };
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, size: string | null, qty?: number) => void;
  updateQty: (index: number, delta: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, productName: "" });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addToCart = useCallback(
    (product: Product, size: string | null, qty = 1) => {
      setItems((prev) => {
        const existingIdx = prev.findIndex(
          (i) => i.product.id === product.id && i.size === size
        );
        if (existingIdx > -1) {
          const next = [...prev];
          const existing = next[existingIdx];
          if (existing) next[existingIdx] = { ...existing, qty: existing.qty + qty };
          return next;
        }
        const resolvedSize = size ?? (product.sizes[0] ?? null);
        return [...prev, { product, size: resolvedSize, qty }];
      });

      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ visible: true, productName: product.name });
      toastTimer.current = setTimeout(() => {
        setToast((t) => ({ ...t, visible: false }));
      }, 4000);
    },
    []
  );

  const updateQty = useCallback((index: number, delta: number) => {
    setItems((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        next.splice(index, 1);
        return next;
      }
      next[index] = { ...item, qty: newQty };
      return next;
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const dismissToast = useCallback(
    () => setToast((t) => ({ ...t, visible: false })),
    []
  );

  const cartCount = useMemo(
    () => items.reduce((s, i) => s + i.qty, 0),
    [items]
  );
  const cartTotal = useMemo(
    () => items.reduce((s, i) => s + i.product.price * i.qty, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    isCartOpen,
    toast,
    cartCount,
    cartTotal,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    dismissToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
