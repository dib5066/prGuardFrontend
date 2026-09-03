"use client";

import Link from "next/link";
import { PullRequest } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReviewStatusCell } from "./ReviewStatusCell";

interface PRListProps {
  prs: PullRequest[];
  repoId: number;
}

export function PRList({ prs, repoId }: PRListProps) {
  if (prs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No pull requests found for this repository.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        Pull Requests ({prs.length})
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PR</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Review Status</TableHead>
            <TableHead className="text-right">Reviews</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prs.map((pr) => (
            <TableRow key={pr.id}>
              <TableCell className="font-mono">#{pr.number}</TableCell>
              <TableCell>
                {pr.latest_review_id ? (
                  <Link
                    href={`/reviews/${pr.latest_review_id}`}
                    className="text-primary hover:underline"
                  >
                    {pr.title}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">{pr.title}</span>
                )}
              </TableCell>
              <TableCell>{pr.user_login}</TableCell>
              <TableCell>
                <Badge variant={pr.state === "open" ? "default" : "secondary"}>
                  {pr.state}
                </Badge>
              </TableCell>
              <TableCell>
                <ReviewStatusCell latestReviewStatus={pr.latest_review_status} />
              </TableCell>
              <TableCell className="text-right">{pr.review_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
