"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/hooks/CartContext";
import { useCheckout } from "@/hooks/CheckoutContext";
import { useMpesa } from "@/hooks/MpesaContext";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const cart = useCart();
  const checkout = useCheckout();
  const mpesa = useMpesa();

  useEffect(() => {
    document.body.style.overflow = cart.isCartOpen ? "hidden" : "";
  }, [cart.isCartOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") cart.closeCart();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cart]);

  function handleCheckout() {
    checkout.open(
      cart.items.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        qty: i.qty,
        size: i.size,
      }))
    );
    cart.closeCart();
  }

  return (
    <>
      <div
        id="cart-overlay"
        className={cart.isCartOpen ? "open" : ""}
        aria-hidden={!cart.isCartOpen}
        onClick={cart.closeCart}
      />
      <aside
        id="cart-drawer"
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        aria-hidden={!cart.isCartOpen}
        className={cart.isCartOpen ? "open" : ""}
      >
        <div className="cart-header">
          <h2 className="cart-title" id="cart-title">
            Your Cart <span id="cart-title-count">({cart.cartCount})</span>
          </h2>
          <button id="cart-close" aria-label="Close cart" onClick={cart.closeCart}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div id="cart-items" aria-live="polite">
          {cart.items.length === 0 ? (
            <p className="cart-empty-msg">
              Your cart is empty.<br />
              <small>Browse our collection and add some pieces.</small>
            </p>
          ) : (
            cart.items.map((ci, idx) => (
              <div className="cart-item visible" key={`${ci.product.id}-${ci.size}`}>
                <Image
                  className="cart-item-img"
                  src={ci.product.img}
                  alt={ci.product.name}
                  width={64}
                  height={80}
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                />
                <div className="cart-item-details">
                  <div className="cart-item-name">{ci.product.name}</div>
                  {ci.size && <div className="cart-item-size">Size: {ci.size}</div>}
                  <div className="cart-item-row">
                    <div className="cart-qty">
                      <button
                        className="cart-qty-btn"
                        aria-label="Decrease quantity"
                        onClick={() => cart.updateQty(idx, -1)}
                      >
                        −
                      </button>
                      <span className="cart-qty-num">{ci.qty}</span>
                      <button
                        className="cart-qty-btn"
                        aria-label="Increase quantity"
                        onClick={() => cart.updateQty(idx, 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="cart-item-price">
                      {formatPrice(ci.product.price * ci.qty)}
                    </span>
                  </div>
                  <button
                    className="cart-remove"
                    aria-label={`Remove ${ci.product.name} from cart`}
                    onClick={() => cart.removeItem(idx)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="cart-footer" id="cart-footer">
            <div className="cart-subtotal">
              <span className="cart-subtotal-label">Subtotal</span>
              <span className="cart-subtotal-price" id="cart-subtotal-price">
                {formatPrice(cart.cartTotal)}
              </span>
            </div>
            <div className="cart-footer-btns">
              <button
                id="cart-wa-btn"
                className="cart-wa-btn checkout-cta-btn"
                onClick={handleCheckout}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                </svg>
                Checkout
              </button>
              <button
                id="cart-mpesa-btn"
                className="cart-mpesa-btn"
                onClick={() => mpesa.open(cart.cartTotal)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Pay via M-Pesa
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
