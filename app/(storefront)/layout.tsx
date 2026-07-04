import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { CartDrawer } from "@/components/CartDrawer";
import { QuickViewModal } from "@/components/QuickViewModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { CartToast } from "@/components/CartToast";
import { MpesaModal } from "@/components/MpesaModal";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { BackToTopButton } from "@/components/BackToTopButton";
import { Footer } from "@/components/Footer";

// Everything storefront-specific (nav, cart, quick view, checkout, the
// M-Pesa demo, footer) lives in THIS layout rather than the root one —
// see app/admin/layout.tsx for why: /admin needed a clean slate with none
// of this mounted, which a single shared root layout couldn't give it.
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div id="scroll-progress" aria-hidden="true" />
      <Header />
      {children}
      <Footer />
      <FloatingWhatsApp />
      <BackToTopButton />
      <CartDrawer />
      <QuickViewModal />
      <CheckoutModal />
      <CartToast />
      <MpesaModal />
      <ScrollProgressBar />
    </Providers>
  );
}
