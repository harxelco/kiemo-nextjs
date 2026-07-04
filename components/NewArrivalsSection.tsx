import { PRODUCTS } from "@/data/products";
import { ProductCard } from "./ProductCard";

export function NewArrivalsSection() {
  const items = PRODUCTS.filter((p) => p.isNew);
  if (items.length === 0) return null;

  return (
    <section id="new-arrivals" className="section-wrap alt-bg" aria-label="New Arrivals">
      <div className="section-header">
        <span className="section-label" data-reveal>Just In</span>
        <h2 className="section-title" data-reveal>New <em>Arrivals</em></h2>
        <p className="section-sub" data-reveal>The freshest pieces from this season&apos;s edit.</p>
      </div>
      <div className="product-grid" id="new-arrivals-grid">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} transitionDelayMs={i * 80} />
        ))}
      </div>
    </section>
  );
}
