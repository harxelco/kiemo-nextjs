"use client";

import { CartProvider } from "@/hooks/CartContext";
import { QuickViewProvider } from "@/hooks/QuickViewContext";
import { CheckoutProvider } from "@/hooks/CheckoutContext";
import { ShopBridgeProvider } from "@/hooks/ShopBridgeContext";
import { MpesaProvider } from "@/hooks/MpesaContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <QuickViewProvider>
        <CheckoutProvider>
          <ShopBridgeProvider>
            <MpesaProvider>{children}</MpesaProvider>
          </ShopBridgeProvider>
        </CheckoutProvider>
      </QuickViewProvider>
    </CartProvider>
  );
}
