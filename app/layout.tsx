import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

// Self-hosted via next/font — same three families as the legacy
// <link href="fonts.googleapis.com/..."> tag, but served from Vercel's
// edge instead of a render-blocking third-party request, with automatic
// font-display swap and no layout shift. This is part of the Part 2.5
// loading-speed fix, not a font change. Declared once here, at the true
// root, so both the storefront and /admin share the same typefaces via
// CSS variables on <html> — even though /admin has its own stylesheet
// (app/admin/admin.css), it's not a different brand.
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dmsans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "Kiemo Mens Wear — Premium Menswear, Nairobi",
  description:
    "Premium menswear for the modern gentleman. Lyric House, 6th Floor, Kimathi Street, Nairobi.",
  openGraph: {
    title: "Kiemo Mens Wear — Premium Menswear, Nairobi",
    description: "Premium menswear for the modern gentleman.",
    type: "website",
    locale: "en_KE",
  },
  // Full SEO treatment (robots.txt, sitemap, richer per-page metadata) is
  // Phase 5 (Manual 04) — /admin's own layout sets a page-level noindex
  // in the meantime, since that route has no business being indexed.
};

export const viewport: Viewport = {
  themeColor: "#1A1714",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${cormorant.variable} ${dmSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
