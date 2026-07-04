"use client";

import { useCart } from "@/hooks/CartContext";

export function CartToast() {
  const cart = useCart();

  return (
    <div
      id="cart-toast"
      className={cart.toast.visible ? "show" : ""}
      aria-live="assertive"
      role="alert"
      aria-atomic="true"
    >
      <div className="toast-inner">
        <div className="toast-check">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="toast-text">
          <div className="toast-title">Added to Cart</div>
          <div className="toast-product" id="toast-product-name">
            {cart.toast.productName}
          </div>
        </div>
        <div className="toast-actions">
          <button
            className="toast-view-cart"
            id="toast-view-cart"
            onClick={() => {
              cart.dismissToast();
              cart.openCart();
            }}
          >
            View Cart
          </button>
          <button className="toast-continue" id="toast-dismiss" onClick={cart.dismissToast}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
