"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSWRConfig } from "swr";
import {
  useReview,
  useReviewFindings,
  useReviewMetrics,
} from "@/hooks/useReview";
import { useReviewStatus } from "@/hooks/useReviewStatus";
import { ReviewSummary } from "@/components/reviews/ReviewSummary";
import { ReviewPhaseProgress } from "@/components/reviews/ReviewPhaseProgress";
import { FindingList } from "@/components/reviews/FindingList";
import { AgentMetrics } from "@/components/reviews/AgentMetrics";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewPage() {
  const params = useParams();
  const id = Number(params.id);
  const { mutate } = useSWRConfig();

  // When on, also show findings the evidence-validator filtered out
  // (these are NOT posted to GitHub).
  const [showFiltered, setShowFiltered] = useState(false);

  const { data: review, isLoading: reviewLoading } = useReview(id);
  const { data: findings, isLoading: findingsLoading } = useReviewFindings(
    id,
    !showFiltered
  );
  const { data: metrics, isLoading: metricsLoading } = useReviewMetrics(id);

  const inProgress =
    review?.status === "RUNNING" || review?.status === "PENDING";

  const {
    status: reviewStatus,
    agents,
    done,
  } = useReviewStatus(inProgress ? id : null);

  // When the live stream reports the review finished, revalidate the
  // review, its findings and its agent metrics so the page fills in
  // without a manual refresh.
  useEffect(() => {
    if (!done) return;
    mutate(`review-${id}`);
    mutate(`review-${id}-findings-true`);
    mutate(`review-${id}-findings-false`);
    mutate(`review-${id}-metrics`);
  }, [done, id, mutate]);

  if (reviewLoading || (findingsLoading && !findings) || metricsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Review not found.
      </div>
    );
  }

  const filteredCount = (findings ?? []).filter((f) => !f.is_published).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Review #{id}</h1>

      {/* Live phase + per-agent progress while the review is running */}
      {reviewStatus && (
        <ReviewPhaseProgress reviewStatus={reviewStatus} agents={agents} />
      )}

      <ReviewSummary review={review} />

      {metrics && metrics.length > 0 && <AgentMetrics metrics={metrics} />}

      {!inProgress && (
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showFiltered}
            onChange={(e) => setShowFiltered(e.target.checked)}
          />
          Show findings filtered out by evidence validation
          {showFiltered && filteredCount > 0 ? ` (${filteredCount})` : ""}
        </label>
      )}

      <FindingList findings={findings || []} />
    </div>
  );
}
