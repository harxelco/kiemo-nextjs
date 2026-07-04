export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  name: string;
  rating: number;
  message: string;
  status: ReviewStatus;
  created_at: string;
  reviewed_at: string | null;
}

export interface ReviewRequestBody {
  name: string;
  rating: number;
  message: string;
}
