"use client";

import { useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { useShopBridge } from "@/hooks/ShopBridgeContext";

export function ShopSection() {
  const { pendingCategory, clearPending } = useShopBridge();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))],
    []
  );

  // Collection card "Shop Now" cross-navigation (see ShopBridgeContext) —
  // equivalent to the legacy code programmatically .click()-ing the
  // matching filter pill. This is subscribing to an external one-shot
  // signal (not deriving state from a prop), so an effect is the right
  // tool here.
  useEffect(() => {
    if (pendingCategory && categories.includes(pendingCategory)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- subscribing to an external one-shot signal, not deriving state from a prop.
      setCategory(pendingCategory);
      clearPending();
    }
  }, [pendingCategory, categories, clearPending]);

  const searchTerm = search.trim().toLowerCase();

  const visibleIds = useMemo(() => {
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const ids = new Set<number>();
    for (const p of PRODUCTS) {
      const matchCat = category === "All" || p.category === category;
      const haystack = `${p.name} ${p.subcategory || ""} ${p.sku || ""}`.toLowerCase();
      const matchSearch = !searchTerm || haystack.includes(searchTerm);
      const matchMin = min === null || p.price >= min;
      const matchMax = max === null || p.price <= max;
      if (matchCat && matchSearch && matchMin && matchMax) ids.add(p.id);
    }
    return ids;
  }, [category, searchTerm, minPrice, maxPrice]);

  const hasActiveFilter =
    category !== "All" || searchTerm !== "" || minPrice !== "" || maxPrice !== "";
  const visibleCount = visibleIds.size;
  const showNoResults = hasActiveFilter && visibleCount === 0;

  function clearAll() {
    setCategory("All");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
  }

  return (
    <section id="shop" className="section-wrap alt-bg" aria-label="Shop All">
      <div className="section-header">
        <span className="section-label" data-reveal>The Collection</span>
        <h2 className="section-title" data-reveal>Shop <em>Kiemo</em></h2>
        <p className="section-sub" data-reveal>Every piece, crafted for the modern gentleman.</p>
      </div>

      {/* Search */}
      <div className="search-wrap" data-reveal>
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            id="product-search"
            placeholder="Search products…"
            aria-label="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              id="search-clear"
              aria-label="Clear search"
              onClick={() => setSearch("")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <div id="search-results-count" className="search-count" aria-live="polite">
          {searchTerm ? `${visibleCount} ${visibleCount === 1 ? "result" : "results"}` : ""}
        </div>
      </div>

      {/* Category filter */}
      <div className="filter-row" id="filter-row" data-reveal>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`filter-pill${cat === category ? " active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Price filter — Part 2.7 */}
      <div className="price-filter" data-reveal>
        <span className="price-filter-label">Price</span>
        <div className="price-filter-input-wrap">
          <span>KSh</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            aria-label="Minimum price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <span className="price-filter-dash">–</span>
        <div className="price-filter-input-wrap">
          <span>KSh</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            aria-label="Maximum price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        {(minPrice || maxPrice) && (
          <button
            type="button"
            className="price-filter-clear"
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="product-grid" id="product-grid">
        {PRODUCTS.map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            visible={hasActiveFilter ? visibleIds.has(p.id) : true}
            transitionDelayMs={i * 60}
          />
        ))}
      </div>

      {showNoResults && (
        <div id="no-results" className="no-results">
          <p>
            {searchTerm ? (
              <>No products found for &quot;<span id="no-results-term">{search}</span>&quot;</>
            ) : (
              <>No products match your current filters.</>
            )}
          </p>
          <button id="clear-search-btn" className="btn-secondary" onClick={clearAll}>
            Clear {searchTerm ? "Search" : "Filters"}
          </button>
        </div>
      )}
    </section>
  );
}
