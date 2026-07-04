"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface MpesaContextValue {
  isOpen: boolean;
  amount: number;
  open: (amount: number) => void;
  close: () => void;
}

const MpesaContext = createContext<MpesaContextValue | null>(null);

export function MpesaProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(0);

  const open = useCallback((amt: number) => {
    setAmount(amt);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <MpesaContext.Provider value={{ isOpen, amount, open, close }}>
      {children}
    </MpesaContext.Provider>
  );
}

export function useMpesa(): MpesaContextValue {
  const ctx = useContext(MpesaContext);
  if (!ctx) throw new Error("useMpesa must be used within MpesaProvider");
  return ctx;
}
