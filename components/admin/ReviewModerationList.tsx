"use client";

import { useState } from "react";
import type { Review } from "@/types/review";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="admin-review-stars" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export function ReviewModerationList({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  async function moderate(id: string, status: "approved" | "rejected") {
    setPendingId(id);
    setErrorId(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setErrorId(id);
        return;
      }
      // Optimistically drop it from the pending queue — the source of
      // truth (Supabase) already has the update; no need to refetch.
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setErrorId(id);
    } finally {
      setPendingId(null);
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="admin-empty-state">
        No pending reviews. New submissions from the storefront will show up
        here.
      </div>
    );
  }

  return (
    <div>
      {reviews.map((r) => (
        <div className="admin-review-card" key={r.id}>
          <div className="admin-review-top">
            <div>
              <div className="admin-review-name">{r.name}</div>
              <div className="admin-review-date">
                {new Date(r.created_at).toLocaleString("en-KE")}
              </div>
            </div>
            <Stars rating={r.rating} />
          </div>
          <p className="admin-review-message">{r.message}</p>
          {errorId === r.id && (
            <p style={{ color: "#8b3a3a", fontSize: 12, marginBottom: 10 }}>
              Something went wrong — please try again.
            </p>
          )}
          <div className="admin-review-actions">
            <button
              className="admin-approve-btn"
              disabled={pendingId === r.id}
              onClick={() => moderate(r.id, "approved")}
            >
              Approve
            </button>
            <button
              className="admin-reject-btn"
              disabled={pendingId === r.id}
              onClick={() => moderate(r.id, "rejected")}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
