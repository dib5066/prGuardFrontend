/**
 * SWR hooks for review data.
 */

import useSWR from "swr";
import { api } from "@/lib/api";
import { Review, Finding, ReviewRun } from "@/lib/types";

export function useReview(id: number | null) {
  return useSWR<Review>(id ? `review-${id}` : null, () =>
    api.getReview(id!)
  );
}

export function useReviewFindings(
  id: number | null,
  publishedOnly: boolean = true
) {
  return useSWR<Finding[]>(
    id ? `review-${id}-findings-${publishedOnly}` : null,
    () => api.getReviewFindings(id!, publishedOnly)
  );
}

export function useReviewMetrics(id: number | null) {
  return useSWR<ReviewRun[]>(id ? `review-${id}-metrics` : null, () =>
    api.getReviewMetrics(id!)
  );
}
