"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useQuickView } from "@/hooks/QuickViewContext";
import { useCart } from "@/hooks/CartContext";
import { useCheckout } from "@/hooks/CheckoutContext";
import { formatPrice } from "@/lib/format";

function Stars() {
  return (
    <div id="qv-stars" className="product-stars">
      <div className="stars-svg">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="star" viewBox="0 0 24 24" aria-hidden="true">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </div>
    </div>
  );
}

export function QuickViewModal() {
  const qv = useQuickView();
  const { addToCart } = useCart();
  const checkout = useCheckout();
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!qv.isOpen) return;
      if (e.key === "Escape") qv.close();
      if (e.key === "ArrowRight") qv.nextImage();
      if (e.key === "ArrowLeft") qv.prevImage();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [qv]);

  useEffect(() => {
    document.body.style.overflow = qv.isOpen ? "hidden" : "";
  }, [qv.isOpen]);

  if (!qv.product) return null;
  const product = qv.product;

  const savePct = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) qv.nextImage();
      else qv.prevImage();
    }
    touchStartX.current = null;
  }

  function handleAddToCart() {
    addToCart(product, qv.size, qv.qty);
    qv.close();
  }

  function handleCheckout() {
    checkout.open([
      {
        product_id: product.id,
        name: product.name,
        price: product.price,
        qty: qv.qty,
        size: qv.size,
      },
    ]);
    qv.close();
  }

  return (
    <div
      id="qv-overlay"
      className={qv.isOpen ? "open" : ""}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) qv.close();
      }}
    >
      <div id="qv-panel">
        <div
          className="qv-img-side"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {qv.gallery.map((src, i) => (
            <div key={src} className={`qv-gallery-img${i === qv.imageIndex ? " active" : ""}`}>
              <Image
                src={src}
                alt={`${product.name} — view ${i + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, 46vw"
                style={{ objectFit: "contain" }}
                priority={i === 0}
              />
            </div>
          ))}

          {qv.gallery.length > 1 && (
            <>
              <button
                type="button"
                className="qv-gallery-arrow qv-arrow-prev"
                aria-label="Previous image"
                onClick={qv.prevImage}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                className="qv-gallery-arrow qv-arrow-next"
                aria-label="Next image"
                onClick={qv.nextImage}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <div className="qv-thumbs">
                {qv.gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    className={`qv-thumb${i === qv.imageIndex ? " active" : ""}`}
                    aria-label={`View image ${i + 1}`}
                    onClick={() => qv.setImageIndex(i)}
                  >
                    <Image src={src} alt="" width={44} height={44} style={{ objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="qv-details-side">
          <button id="qv-close" aria-label="Close quick view" onClick={qv.close}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div id="qv-cat">{product.subcategory || product.category}</div>
          <div id="qv-name">{product.name}</div>

          <div id="qv-price-row">
            <span id="qv-price">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span id="qv-old-price">{formatPrice(product.oldPrice)}</span>
            )}
            {savePct !== null && <span id="qv-save-badge">-{savePct}%</span>}
          </div>

          {product.reviews ? <Stars /> : null}

          <div id="qv-desc">{product.desc}</div>

          {product.colors.length > 0 && (
            <>
              <div className="qv-label">Colour</div>
              <div className="qv-colors">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`qv-swatch${c === qv.color ? " active" : ""}`}
                    style={{ background: c }}
                    aria-label={`Select colour ${c}`}
                    onClick={() => qv.setColor(c)}
                  />
                ))}
              </div>
            </>
          )}

          {product.sizes.length > 0 && (
            <>
              <div className="qv-label">Size</div>
              <div className="qv-sizes">
                {product.sizes.map((s) => {
                  const unavailable = product.unavailable.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={unavailable}
                      className={`qv-size-pill${s === qv.size ? " active" : ""}${unavailable ? " unavail" : ""}`}
                      onClick={() => !unavailable && qv.setSize(s)}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="qv-label">Quantity</div>
          <div className="qv-qty">
            <button type="button" className="qty-btn" aria-label="Decrease quantity" onClick={qv.decrementQty}>
              −
            </button>
            <span className="qty-num">{qv.qty}</span>
            <button type="button" className="qty-btn" aria-label="Increase quantity" onClick={qv.incrementQty}>
              +
            </button>
          </div>

          <div className="qv-actions">
            <button type="button" className="qv-add-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button type="button" className="qv-wa-btn checkout-cta-btn" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
