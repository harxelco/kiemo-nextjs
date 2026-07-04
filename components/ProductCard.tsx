"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/hooks/CartContext";
import { useQuickView } from "@/hooks/QuickViewContext";
import { useCheckout } from "@/hooks/CheckoutContext";

function StarRating({ count }: { count: number }) {
  return (
    <div className="product-stars">
      <div className="stars-svg">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="star" viewBox="0 0 24 24" aria-hidden="true">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </div>
      <span className="review-count">({count})</span>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  /** Omit entirely for grids with no filtering (New Arrivals, Offers). */
  visible?: boolean;
  transitionDelayMs?: number;
}

// Mirrors the legacy applyFilters() timing exactly: a card being hidden
// fades/scales out over ~240ms and is THEN removed from grid flow, and a
// card being re-shown re-enters flow first, then fades in one tick later
// (has to — you can't transition from display:none). Until the visitor
// touches search/filter/price for the first time, no inline style is set
// at all here, so the very first scroll-reveal-in-view animation still
// runs off the plain CSS classes, untouched.
function useFilterPhase(visible: boolean | undefined) {
  const [phase, setPhase] = useState<"shown" | "showing" | "hiding" | "hidden">(
    visible === false ? "hidden" : "shown"
  );
  const firstRun = useRef(true);

  useEffect(() => {
    if (visible === undefined) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    // This is timer orchestration (a multi-step fade/collapse sequence
    // timed to match the CSS transition duration), not state mirroring a
    // prop — a legitimate effect use case, just one the blanket lint rule
    // can't distinguish from the anti-pattern it's guarding against.
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("showing");
      const t = setTimeout(() => setPhase("shown"), 20);
      return () => clearTimeout(t);
    } else {
      setPhase("hiding");
      const t = setTimeout(() => setPhase("hidden"), 240);
      return () => clearTimeout(t);
    }
  }, [visible]);

  return phase;
}

export function ProductCard({ product, visible, transitionDelayMs }: ProductCardProps) {
  const { addToCart } = useCart();
  const quickView = useQuickView();
  const checkout = useCheckout();
  const [activeColor, setActiveColor] = useState(product.colors[0] ?? null);
  const phase = useFilterPhase(visible);

  const hasColors = product.colors.length > 0;
  const firstSize = product.sizes[0] ?? null;

  let filterStyle: React.CSSProperties | undefined;
  if (visible !== undefined && !(phase === "shown" && visible)) {
    if (phase === "hidden") filterStyle = { display: "none" };
    else if (phase === "showing") filterStyle = { opacity: 0, transform: "scale(0.96) translateY(12px)" };
    else if (phase === "hiding") filterStyle = { opacity: 0, transform: "scale(0.96) translateY(12px)" };
    else filterStyle = { opacity: 1, transform: "translateY(0)" };
  }

  let badge: { text: string; className: string } | null = null;
  if (product.isNew) {
    badge = { text: "New", className: "new-badge" };
  } else if (product.badge === "Sale" || product.oldPrice) {
    badge = { text: "Sale", className: "sale-badge" };
  } else if (product.badge) {
    badge = { text: product.badge, className: "" };
  }

  let savePct: number | null = null;
  if (product.oldPrice) {
    savePct = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
  }

  function handleCheckoutClick() {
    checkout.open([
      {
        product_id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        size: firstSize,
      },
    ]);
  }

  return (
    <div
      className="product-card"
      data-cat={product.category}
      data-id={product.id}
      style={{
        ...filterStyle,
        ...(transitionDelayMs ? { transitionDelay: `${transitionDelayMs}ms` } : {}),
      }}
    >
      <div className="product-img-wrap">
        <Image
          src={product.img}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          style={{ objectFit: "cover" }}
          loading="lazy"
        />
        <div className="product-img-overlay" aria-hidden="true" />
        {badge && (
          <span className={`product-badge ${badge.className}`}>{badge.text}</span>
        )}
        <div className="product-hover-actions">
          <button
            className="qv-btn"
            aria-label={`Quick view ${product.name}`}
            onClick={() => quickView.open(product)}
          >
            Quick View
          </button>
        </div>
      </div>
      <div className="product-info">
        <div className="product-cat">{product.category}</div>
        <div className="product-name">{product.name}</div>
        {product.reviews ? <StarRating count={product.reviews} /> : null}
        {hasColors && (
          <div className="product-swatches">
            {product.colors.map((c) => (
              <div
                key={c}
                className={`swatch${c === activeColor ? " active" : ""}`}
                style={{ background: c }}
                data-color={c}
                aria-label="Colour option"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveColor(c);
                }}
              />
            ))}
          </div>
        )}
        <div className="price-row">
          <span className="price">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="old-price">{formatPrice(product.oldPrice)}</span>
          )}
          {savePct !== null && <span className="save-pill">-{savePct}%</span>}
        </div>
        <button
          className="add-cart-btn"
          aria-label={`Add ${product.name} to cart`}
          onClick={() => addToCart(product, firstSize)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          Add to Cart
        </button>
        <button
          className="wa-btn checkout-cta-btn"
          aria-label={`Checkout ${product.name}`}
          onClick={handleCheckoutClick}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
          </svg>
          Checkout
        </button>
      </div>
    </div>
  );
}
