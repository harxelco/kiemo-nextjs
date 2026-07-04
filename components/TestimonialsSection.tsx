"use client";

import { useMemo, useState } from "react";
import type { Review } from "@/types/review";

interface Testimonial {
  key: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
}

const CURATED_TESTIMONIALS: Testimonial[] = [
  { key: "c1", name: "Brian Mutua", location: "Westlands, Nairobi", rating: 5, quote: "Kiemo completely transformed my wardrobe. The quality of the blazer is on another level — I've received compliments everywhere from the boardroom to social events. Truly world-class." },
  { key: "c2", name: "James Kariuki", location: "Karen, Nairobi", rating: 5, quote: "I've been shopping at Kiemo for over three years. The curation is exceptional — from the weight of the fabric to the precision of the cut. Worth every shilling." },
  { key: "c3", name: "David Ochieng", location: "Kilimani, Nairobi", rating: 5, quote: "Bought a full suit from Kiemo for my wedding. My groomsmen were amazed. The team went above and beyond. Truly 5-star service and quality." },
  { key: "c4", name: "Kevin Otieno", location: "Lavington, Nairobi", rating: 5, quote: "Walked in for one shirt, left with a whole new sense of how I dress for work. The staff actually know fit — rare to find on Kimathi Street these days." },
  { key: "c5", name: "Samuel Njoroge", location: "Runda, Nairobi", rating: 5, quote: "Ordered ahead and had a blazer at my office in Upper Hill the same afternoon. Fabric and stitching feel imported, not local. Already planning my next order." },
  { key: "c6", name: "Felix Wanjiru", location: "Kileleshwa, Nairobi", rating: 5, quote: "Their footwear collection is criminally underrated. Got a pair of Oxfords that have outlasted shoes twice the price from other boutiques in town." },
];

function reviewToTestimonial(r: Review): Testimonial {
  return {
    key: r.id,
    name: r.name,
    location: "Verified Customer",
    quote: r.message,
    rating: r.rating,
  };
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="testimonial-card">
      <div className="t-stars" aria-label={`${t.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className="t-star"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ opacity: i < t.rating ? 1 : 0.25 }}
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </div>
      <blockquote className="t-quote">&ldquo;{t.quote}&rdquo;</blockquote>
      <div className="t-author">{t.name}</div>
      <div className="t-location">{t.location}</div>
    </div>
  );
}

function MarqueeRow({ items, reverse }: { items: Testimonial[]; reverse?: boolean }) {
  // Duplicated once so the 0% -> -50% scroll loops seamlessly — same
  // technique as initTestimonialsMarquee(). Guard against a too-short
  // list (e.g. only 1 live review) making a visibly sparse loop.
  const doubled = items.length > 0 ? [...items, ...items] : [];
  return (
    <div className={`t-row${reverse ? " row-reverse" : ""}`}>
      {doubled.map((t, i) => (
        <TestimonialCard key={`${t.key}-${i}`} t={t} />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="review-star-picker" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="review-star-btn"
          onClick={() => onChange(n)}
          style={{ opacity: n <= value ? 1 : 0.3 }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function TestimonialsSection({ liveReviews }: { liveReviews: Review[] }) {
  // Real approved reviews lead, curated ones fill out the rest — once
  // there's enough genuine review volume, the curated set becomes purely
  // a floor rather than most of what's shown. Nothing here removes the
  // curated testimonials themselves (they're real historical customer
  // sentiment already published on the legacy site, not placeholder copy).
  const allTestimonials = useMemo(
    () => [...liveReviews.map(reviewToTestimonial), ...CURATED_TESTIMONIALS],
    [liveReviews]
  );
  const rowA = allTestimonials.filter((_, i) => i % 2 === 0);
  const rowB = allTestimonials.filter((_, i) => i % 2 === 1);

  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedComment = comment.trim();
    if (!trimmedName || !trimmedComment) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, message: trimmedComment, rating }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setName("");
      setComment("");
      setRating(5);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 6000);
    } catch {
      setErrorMsg("Network error — please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <section id="testimonials" className="section-wrap alt-bg" aria-label="Testimonials">
      <div className="section-header">
        <span className="section-label" data-reveal>Testimonials</span>
        <h2 className="section-title" data-reveal>
          What the Gentlemen <em>Are Saying</em>
        </h2>
      </div>

      <div className="marquee-grid" id="marquee-grid" data-reveal>
        <MarqueeRow items={rowA} />
        <MarqueeRow items={rowB} reverse />
      </div>

      <div className="review-form-wrap">
        <div className="review-form-title">Leave a Review</div>
        <p className="review-form-sub">Tell other gentlemen about your Kiemo experience.</p>
        <form className="review-form" id="review-form" onSubmit={handleSubmit}>
          <StarPicker value={rating} onChange={setRating} />
          <input
            type="text"
            id="review-name"
            placeholder="Your name"
            maxLength={60}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            id="review-comment"
            placeholder="Share your experience…"
            maxLength={400}
            minLength={10}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {status === "error" && (
            <p className="review-form-error" role="alert">{errorMsg}</p>
          )}
          <button type="submit" className="review-submit-btn" disabled={status === "submitting"}>
            {status === "submitting" ? "Submitting…" : "Submit Review"}
          </button>
        </form>
        <p className="review-form-note">Reviews are briefly checked before appearing publicly.</p>
        <div className={`review-confirm${status === "success" ? " visible" : ""}`} id="review-confirm">
          Thanks! Your review will appear after a quick review.
        </div>
      </div>
    </section>
  );
}
