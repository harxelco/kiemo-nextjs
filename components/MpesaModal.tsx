"use client";

import { useEffect, useRef, useState } from "react";
import { useMpesa } from "@/hooks/MpesaContext";
import { formatPrice } from "@/lib/format";

type Step = 1 | 2 | 3;

export function MpesaModal() {
  const mpesa = useMpesa();
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mpesa.isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset tied to an external open/close signal; modal stays mounted for its CSS fade transition, so a key-remount isn't an option here.
      setStep(1);
      // Pre-fill from the phone number already entered in checkout. Strip
      // a leading 254/0 so it matches this input's "7XX XXX XXX" format.
      setPhone(mpesa.phone.replace(/\s/g, "").replace(/^(?:\+?254|0)/, ""));
      setPhoneError(false);
      setProgress(0);
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => phoneInputRef.current?.focus(), 400);
      return () => clearTimeout(t);
    } else {
      document.body.style.overflow = "";
    }
  }, [mpesa.isOpen, mpesa.phone]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && mpesa.isOpen) mpesa.close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mpesa]);

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  function runPayment() {
    setStep(2);
    let pct = 0;
    progressInterval.current = setInterval(() => {
      pct += 2;
      setProgress(Math.min(pct, 100));
      if (pct >= 100 && progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }, 48);

    // --- Daraja integration point ---
    // This setTimeout simulates "customer entered PIN, STK confirmed."
    // Swap this block for a real call: POST to your /api/mpesa/stk-push
    // route (orderRef = mpesa.orderRef, phone, amount = mpesa.amount),
    // then poll/subscribe for the callback result before advancing to
    // step 3. Keep the progress bar as a visual placeholder for "waiting
    // on the Daraja callback" — just drive `setStep(3)` from the real
    // callback result instead of a fixed timeout.
    setTimeout(() => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(100);
      setTimeout(() => {
        setStep(3);
      }, 300);
    }, 2600);
  }

  function handlePay() {
    const val = phone.replace(/\s/g, "");
    if (val.length < 9) {
      setPhoneError(true);
      setTimeout(() => setPhoneError(false), 1500);
      return;
    }
    runPayment();
  }

  function handleDone() {
    mpesa.close();
    mpesa.onSuccess?.();
  }

  return (
    <div id="mpesa-overlay" className={mpesa.isOpen ? "open" : ""} aria-hidden={!mpesa.isOpen}>
      <div id="mpesa-modal" role="dialog" aria-modal="true" aria-label="M-Pesa Payment">
        <button id="mpesa-close" aria-label="Close payment modal" onClick={mpesa.close}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {step === 1 && (
          <div className="mpesa-step">
            <div className="mpesa-logo">
              <div className="mpesa-logo-icon">M</div>
              <div className="mpesa-logo-text">M-PESA</div>
            </div>
            <h3 className="mpesa-title">Enter Phone Number</h3>
            <p className="mpesa-sub">A payment prompt will be sent to your Safaricom line.</p>
            <div className="mpesa-amount-display">
              <span className="mpesa-amount-label">Amount</span>
              <span className="mpesa-amount-value" id="mpesa-amount">
                {formatPrice(mpesa.amount)}
              </span>
            </div>
            <div className="mpesa-input-wrap" style={phoneError ? { borderColor: "#c0392b" } : undefined}>
              <span className="mpesa-prefix">+254</span>
              <input
                ref={phoneInputRef}
                type="tel"
                id="mpesa-phone"
                placeholder="7XX XXX XXX"
                maxLength={9}
                aria-label="Phone number without country code"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePay();
                }}
              />
            </div>
            <button id="mpesa-pay-btn" className="mpesa-pay-btn" onClick={handlePay}>
              Send STK Push →
            </button>
            <p className="mpesa-note">This is a demo. No real payment will be processed.</p>
          </div>
        )}

        {step === 2 && (
          <div className="mpesa-step">
            <div className="mpesa-spinner" aria-label="Processing payment">
              <div className="spinner-ring" />
            </div>
            <h3 className="mpesa-title">Sending STK Push…</h3>
            <p className="mpesa-sub">
              Check your phone for the M-Pesa prompt.<br />Enter your PIN to confirm.
            </p>
            <div className="mpesa-progress-bar">
              <div className="mpesa-progress-fill" id="mpesa-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mpesa-step">
            <div className="mpesa-success-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="mpesa-title">Payment Successful!</h3>
            <p className="mpesa-sub">
              Your order has been confirmed. We&apos;ll reach out on WhatsApp shortly to arrange delivery.
            </p>
            <div className="mpesa-ref">Ref: {mpesa.orderRef}</div>
            <button id="mpesa-done-btn" className="mpesa-pay-btn" onClick={handleDone}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
