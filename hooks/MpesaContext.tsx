"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface MpesaOpenParams {
  amount: number;
  phone: string;
  orderRef: string;
  onSuccess?: () => void;
}

interface MpesaContextValue {
  isOpen: boolean;
  amount: number;
  phone: string;
  orderRef: string;
  open: (params: MpesaOpenParams) => void;
  close: () => void;
  onSuccess: (() => void) | null;
}

const MpesaContext = createContext<MpesaContextValue | null>(null);

export function MpesaProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [phone, setPhone] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [onSuccess, setOnSuccess] = useState<(() => void) | null>(null);

  const open = useCallback((params: MpesaOpenParams) => {
    setAmount(params.amount);
    setPhone(params.phone);
    setOrderRef(params.orderRef);
    // Store as a lazy initializer so React doesn't treat the passed-in
    // function as a state updater.
    setOnSuccess(() => params.onSuccess ?? null);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <MpesaContext.Provider value={{ isOpen, amount, phone, orderRef, open, close, onSuccess }}>
      {children}
    </MpesaContext.Provider>
  );
}

export function useMpesa(): MpesaContextValue {
  const ctx = useContext(MpesaContext);
  if (!ctx) throw new Error("useMpesa must be used within MpesaProvider");
  return ctx;
}
