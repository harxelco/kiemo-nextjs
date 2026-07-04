"use client";

import { useEffect, useState } from "react";
import { useCheckout } from "@/hooks/CheckoutContext";
import { useMpesa } from "@/hooks/MpesaContext";
import { formatPrice } from "@/lib/format";
import { NAIROBI_DELIVERY_AREAS, buildWhatsAppOrderMessage, whatsappContactUrl } from "@/lib/site-config";
import type { Order, PickupMethod, PaymentMethod } from "@/types/order";

type Status = "form" | "submitting" | "success" | "error";

export function CheckoutModal() {
  const checkout = useCheckout();
  const mpesa = useMpesa();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupMethod, setPickupMethod] = useState<PickupMethod>("pickup");
  const [deliveryArea, setDeliveryArea] = useState("");
  const [status, setStatus] = useState<Status>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorFallback, setErrorFallback] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  // Tracks which button was clicked so we know, after the shared save,
  // whether to open the M-Pesa STK modal or redirect to WhatsApp.
  const [pendingMethod, setPendingMethod] = useState<PaymentMethod | null>(null);

  const subtotal = checkout.items.reduce((s, i) => s + i.price * i.qty, 0);

  // Reset internal form state each time the modal is freshly opened. This
  // stays an effect deliberately rather than a key-based remount: the
  // overlay needs to remain mounted (not unmount/remount) so its CSS
  // opacity transition can play on both open AND close.
  useEffect(() => {
    if (checkout.isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- timer/DOM-orchestration style reset tied to an external open/close signal, not a derived-state mirror; see comment above.
      setFullName("");
      setPhone("");
      setPickupMethod("pickup");
      setDeliveryArea("");
      setStatus("form");
      setErrorMsg("");
      setErrorFallback(false);
      setOrder(null);
      setPendingMethod(null);
    }
  }, [checkout.isOpen]);

  useEffect(() => {
    document.body.style.overflow = checkout.isOpen ? "hidden" : "";
  }, [checkout.isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && checkout.isOpen && status !== "submitting") {
        checkout.close();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [checkout, status]);

  const nameValid = fullName.trim().length >= 2;
  const phoneValid = /^(?:\+?254|0)7\d{8}$/.test(phone.replace(/\s/g, ""));
  const deliveryValid = pickupMethod === "pickup" || deliveryArea !== "";
  const canSubmit = nameValid && phoneValid && deliveryValid && checkout.items.length > 0;

  async function handleSubmit(method: PaymentMethod) {
    if (!canSubmit) return;
    setPendingMethod(method);
    setStatus("submitting");
    setErrorMsg("");
    setErrorFallback(false);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          pickup_method: pickupMethod,
          delivery_area: pickupMethod === "delivery" ? deliveryArea : null,
          items: checkout.items,
          payment_method: method,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setErrorFallback(data.fallback === "whatsapp");
        setStatus("error");
        return;
      }

      const savedOrder = data.order as Order;
      setOrder(savedOrder);

      if (method === "mpesa") {
        // Order is saved — hand off to the M-Pesa STK modal. Checkout
        // itself shows the success screen once the M-Pesa modal reports
        // success (see onSuccess below), so the customer isn't shown two
        // separate "success" screens back to back.
        mpesa.open({
          amount: savedOrder.subtotal,
          phone: savedOrder.phone,
          orderRef: savedOrder.order_ref,
          onSuccess: () => setStatus("success"),
        });
        setStatus("form");
      } else {
        // WhatsApp path: order is already saved, now redirect immediately.
        const waMessage = buildWhatsAppOrderMessage({
          orderRef: savedOrder.order_ref,
          fullName: savedOrder.full_name,
          phone: savedOrder.phone,
          items: savedOrder.items,
          subtotal: savedOrder.subtotal,
          pickupMethod: savedOrder.pickup_method,
          deliveryArea: savedOrder.delivery_area,
        });
        window.open(whatsappContactUrl(waMessage), "_blank", "noopener");
        setStatus("success");
      }
    } catch {
      setErrorMsg("Network error — please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <div
      id="checkout-overlay"
      className={checkout.isOpen ? "open" : ""}
      role="dialog"
      aria-modal="true"
      aria-label="Checkout"
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== "submitting") checkout.close();
      }}
    >
      <div id="checkout-modal">
        <button
          id="checkout-close"
          aria-label="Close checkout"
          onClick={checkout.close}
          disabled={status === "submitting"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {status === "success" && order ? (
          <>
            <div className="checkout-success-icon" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="checkout-title" style={{ textAlign: "center" }}>
              {order.payment_method === "whatsapp" ? "Order Sent" : "Order Received"}
            </div>
            <p className="checkout-sub" style={{ textAlign: "center" }}>
              {order.payment_method === "whatsapp" ? (
                <>Thank you, {order.full_name.split(" ")[0]}. We&apos;ve opened WhatsApp so you can confirm availability with us directly.</>
              ) : (
                <>Thank you, {order.full_name.split(" ")[0]}. We&apos;ll contact you on{" "}
                {order.phone} shortly to confirm{" "}
                {order.pickup_method === "delivery" ? "delivery" : "pickup"}.</>
              )}
            </p>
            <div className="checkout-ref">Order Ref: {order.order_ref}</div>
            <div className="checkout-summary">
              {order.items.map((item, i) => (
                <div className="checkout-summary-item" key={i}>
                  <span>
                    {item.name} {item.size ? `(${item.size})` : ""} × {item.qty}
                  </span>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="checkout-summary-total">
                <span>Total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
            </div>
            <button type="button" className="checkout-submit-btn" onClick={checkout.close}>
              Done
            </button>
          </>
        ) : (
          <>
            <div className="checkout-title">Checkout</div>
            <p className="checkout-sub">
              Tell us where to reach you — we&apos;ll confirm your order directly.
            </p>

            <div className="checkout-summary">
              {checkout.items.map((item, i) => (
                <div className="checkout-summary-item" key={i}>
                  <span>
                    {item.name} {item.size ? `(${item.size})` : ""} × {item.qty}
                  </span>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="checkout-summary-total">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>

            {status === "error" && (
              <div className="checkout-api-error">
                {errorMsg}
                {errorFallback && (
                  <>
                    {" "}
                    <a
                      href={whatsappContactUrl(
                        `Hello Kiemo! I'd like to order: ${checkout.items
                          .map((i) => `${i.name} x${i.qty}`)
                          .join(", ")}`
                      )}
                      target="_blank"
                      rel="noopener"
                    >
                      Chat with us on WhatsApp →
                    </a>
                  </>
                )}
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()}>
              <div className="checkout-field">
                <label htmlFor="checkout-name">Full Name</label>
                <input
                  type="text"
                  id="checkout-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-phone">Phone Number</label>
                <input
                  type="tel"
                  id="checkout-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XX XXX XXX"
                  autoComplete="tel"
                  required
                />
                {phone && !phoneValid && (
                  <div className="checkout-field-error">
                    Please enter a valid Kenyan phone number.
                  </div>
                )}
              </div>

              <div className="checkout-field">
                <label>Pickup Method</label>
                <div className="checkout-pickup-options">
                  <div
                    className={`checkout-pickup-option${pickupMethod === "pickup" ? " active" : ""}`}
                    onClick={() => setPickupMethod("pickup")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="checkout-pickup-option-title">Pickup at Shop</div>
                    <div className="checkout-pickup-option-sub">Kimathi Street</div>
                  </div>
                  <div
                    className={`checkout-pickup-option${pickupMethod === "delivery" ? " active" : ""}`}
                    onClick={() => setPickupMethod("delivery")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="checkout-pickup-option-title">Delivery</div>
                    <div className="checkout-pickup-option-sub">Nairobi only</div>
                  </div>
                </div>
              </div>

              {pickupMethod === "delivery" && (
                <div className="checkout-field">
                  <label htmlFor="checkout-area">Delivery Area (Nairobi only)</label>
                  <select
                    id="checkout-area"
                    value={deliveryArea}
                    onChange={(e) => setDeliveryArea(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select your area…</option>
                    {NAIROBI_DELIVERY_AREAS.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                className="checkout-submit-btn"
                disabled={!canSubmit || status === "submitting"}
                onClick={() => handleSubmit("mpesa")}
              >
                {status === "submitting" && pendingMethod === "mpesa"
                  ? "Placing Order…"
                  : "Pay with M-Pesa"}
              </button>

              <button
                type="button"
                className="checkout-submit-btn checkout-whatsapp-btn"
                disabled={!canSubmit || status === "submitting"}
                onClick={() => handleSubmit("whatsapp")}
              >
                {status === "submitting" && pendingMethod === "whatsapp"
                  ? "Placing Order…"
                  : "Order via WhatsApp"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
