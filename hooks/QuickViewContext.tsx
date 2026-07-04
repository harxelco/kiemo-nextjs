"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Product } from "@/types/product";

interface QuickViewContextValue {
  product: Product | null;
  isOpen: boolean;
  size: string | null;
  color: string | null;
  qty: number;
  imageIndex: number;
  gallery: string[];
  open: (product: Product) => void;
  close: () => void;
  setSize: (size: string) => void;
  setColor: (color: string) => void;
  incrementQty: () => void;
  decrementQty: () => void;
  nextImage: () => void;
  prevImage: () => void;
  setImageIndex: (i: number) => void;
}

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSizeState] = useState<string | null>(null);
  const [color, setColorState] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  const gallery = useMemo(() => {
    if (!product) return [];
    return product.images && product.images.length ? product.images : [product.img];
  }, [product]);

  const open = useCallback((p: Product) => {
    setProduct(p);
    setQty(1);
    setImageIndex(0);
    setSizeState(p.sizes && p.sizes.length ? (p.sizes[0] ?? null) : null);
    setColorState(p.colors && p.colors.length ? (p.colors[0] ?? null) : null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setProduct(null);
  }, []);

  const setSize = useCallback((s: string) => setSizeState(s), []);
  const setColor = useCallback((c: string) => setColorState(c), []);
  const incrementQty = useCallback(() => setQty((q) => q + 1), []);
  const decrementQty = useCallback(() => setQty((q) => Math.max(1, q - 1)), []);

  const nextImage = useCallback(() => {
    setImageIndex((i) => (gallery.length ? (i + 1) % gallery.length : 0));
  }, [gallery.length]);

  const prevImage = useCallback(() => {
    setImageIndex((i) =>
      gallery.length ? (i - 1 + gallery.length) % gallery.length : 0
    );
  }, [gallery.length]);

  const value: QuickViewContextValue = {
    product,
    isOpen,
    size,
    color,
    qty,
    imageIndex,
    gallery,
    open,
    close,
    setSize,
    setColor,
    incrementQty,
    decrementQty,
    nextImage,
    prevImage,
    setImageIndex,
  };

  return (
    <QuickViewContext.Provider value={value}>
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView(): QuickViewContextValue {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used within QuickViewProvider");
  return ctx;
}
