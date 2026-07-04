"use client";

import Image from "next/image";
import { useShopBridge } from "@/hooks/ShopBridgeContext";

const COLLECTIONS = [
  {
    img: "https://res.cloudinary.com/dtsixdjix/image/upload/v1782888405/Polo_shirt_on_mannequin_202607010811_rhn2wc.jpg",
    alt: "Clothing Collection",
    badge: "New Season",
    cat: "Clothing",
  },
  {
    img: "https://res.cloudinary.com/dtsixdjix/image/upload/v1782762557/Geometric_patterned_shorts_202606292246_pfzbng.jpg",
    alt: "Bottom Wear Collection",
    badge: "Bestseller",
    cat: "Bottom Wear",
  },
  {
    img: "https://res.cloudinary.com/dtsixdjix/image/upload/v1782873062/Dark_grey_puffer_jacket_white_202607010530_eypu4o.jpg",
    alt: "Accessories",
    badge: "Curated",
    cat: "Accessories",
  },
  {
    img: "https://res.cloudinary.com/dtsixdjix/image/upload/v1782869963/01_Hero_202607010437_11_cdoeco.jpg",
    alt: "Footwear",
    badge: "Limited",
    cat: "Footwear",
  },
];

export function CollectionsSection() {
  const { requestCategory } = useShopBridge();
  return (
    <section id="collections" className="section-wrap" aria-label="Collections">
      <div className="section-header">
        <span className="section-label" data-reveal>Our Collections</span>
        <h2 className="section-title" data-reveal>
          Dressed for Every <em>Occasion</em>
        </h2>
        <p className="section-sub" data-reveal>
          From the boardroom to the weekend — we have you covered.
        </p>
      </div>
      <div className="collections-scroller" id="collections-track">
        {COLLECTIONS.map((c) => (
          <div className="collection-card" data-reveal key={c.cat}>
            <div className="col-img-wrap">
              <Image src={c.img} alt={c.alt} fill sizes="75vw" style={{ objectFit: "cover" }} loading="lazy" />
            </div>
            <div className="col-overlay" />
            <span className="col-badge">{c.badge}</span>
            <div className="col-content">
              <button
                type="button"
                className="col-shop-btn"
                onClick={() => requestCategory(c.cat)}
              >
                Shop Now →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
