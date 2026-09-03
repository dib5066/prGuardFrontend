"use client";

import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface ReviewStatusCellProps {
  latestReviewStatus: string | null;
}

const reviewStatusConfig: Record<string, { label: string; variant: string }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  RUNNING: { label: "Running", variant: "default" },
  COMPLETED: { label: "Completed", variant: "default" },
  FAILED: { label: "Failed", variant: "destructive" },
};

/**
 * Phase labels for the loading spinner.
 * Maps backend phase identifiers to human-readable messages.
 */
const phaseLabels: Record<string, string> = {
  fetching_context: "Fetching PR context...",
  indexing: "Indexing repository for RAG...",
  building_rag: "Building RAG context...",
  running_agents: "Running AI review agents...",
  validating: "Validating findings...",
  publishing: "Publishing to GitHub...",
  completed: "Review completed",
  failed: "Review failed",
};

export function ReviewStatusCell({ latestReviewStatus }: ReviewStatusCellProps) {
  if (!latestReviewStatus) {
    return (
      <span className="text-muted-foreground text-sm">No review</span>
    );
  }

  const config = reviewStatusConfig[latestReviewStatus];

  if (latestReviewStatus === "RUNNING") {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span className="text-sm font-medium text-blue-600">
          Reviewing...
        </span>
      </div>
    );
  }

  if (latestReviewStatus === "PENDING") {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Starting...</span>
      </div>
    );
  }

  if (config) {
    return (
      <Badge
        variant={config.variant as "default" | "secondary" | "destructive"}
      >
        {config.label}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">{latestReviewStatus}</Badge>
  );
}
