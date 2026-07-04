import { Fragment } from "react";

const MARQUEE_ITEMS = [
  "Premium Menswear",
  "Nairobi",
  "Lyric House · Kimathi Street",
  "Easy Checkout",
  "Est. 2018",
  "Delivery Available",
  "Blazers · Shirts · Trousers",
  "M-Pesa Accepted",
  "New Arrivals",
  "Premium Quality",
  "Tailored Fit",
];

export function Marquee() {
  // Duplicated once for a seamless loop — identical technique to the
  // legacy initMarquee(), just rendered declaratively instead of via
  // innerHTML string concatenation.
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div id="marquee" aria-hidden="true">
      <div className="marquee-track" id="marquee-track">
        {items.map((item, i) => (
          <Fragment key={i}>
            <span className="marquee-item">{item}</span>
            <span className="marquee-dot" aria-hidden="true">·</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
