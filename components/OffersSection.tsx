import { PRODUCTS } from "@/data/products";
import { ProductCard } from "./ProductCard";

export function OffersSection() {
  const items = PRODUCTS.filter((p) => p.isOffer);
  if (items.length === 0) return null;

  return (
    <section id="offers" className="section-wrap" aria-label="Special Offers">
      <div className="section-header">
        <span className="section-label" data-reveal>Limited Time</span>
        <h2 className="section-title" data-reveal>Special <em>Offers</em></h2>
        <p className="section-sub" data-reveal>Premium pieces. Exceptional value. For a limited time only.</p>
      </div>
      <div className="product-grid" id="offers-grid">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} transitionDelayMs={i * 80} />
        ))}
      </div>
    </section>
  );
}
