"use client";

import { Review } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReviewSummaryProps {
  review: Review;
}

const statusConfig: Record<string, { label: string; variant: string }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  RUNNING: { label: "Running", variant: "default" },
  COMPLETED: { label: "Completed", variant: "default" },
  FAILED: { label: "Failed", variant: "destructive" },
};

const severityEmojis: Record<string, string> = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🟢",
};

const severityOrder = ["critical", "high", "medium", "low"];

export function ReviewSummary({ review }: ReviewSummaryProps) {
  const status = statusConfig[review.status] || {
    label: review.status,
    variant: "secondary",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Review Summary</CardTitle>
          <Badge variant={status.variant as "default" | "secondary" | "destructive"}>
            {review.status === "COMPLETED" && "✅ "}
            {review.status === "FAILED" && "❌ "}
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 flex-wrap">
          {severityOrder.map((severity) => {
            const count = review.severity_counts[severity] || 0;
            if (count === 0) return null;
            return (
              <div key={severity} className="flex items-center gap-1">
                <span>{severityEmojis[severity]}</span>
                <span className="font-semibold capitalize">{severity}:</span>
                <span>{count}</span>
              </div>
            );
          })}
        </div>
        {review.error_message && (
          <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {review.error_message}
          </div>
        )}
        <div className="mt-4 text-xs text-muted-foreground">
          Created: {new Date(review.created_at).toLocaleString()}
          {review.completed_at && (
            <> | Completed: {new Date(review.completed_at).toLocaleString()}</>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
