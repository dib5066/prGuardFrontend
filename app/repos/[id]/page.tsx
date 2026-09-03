"use client";

import { useParams } from "next/navigation";
import { useRepo, useRepoPRs } from "@/hooks/useRepos";
import { PRList } from "@/components/repos/PRList";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GitBranch, CheckCircle, Clock } from "lucide-react";

export default function RepoPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data: repo, isLoading: repoLoading } = useRepo(id);
  const { data: prs, isLoading: prsLoading } = useRepoPRs(id);

  if (repoLoading || prsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Repository not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitBranch className="w-6 h-6" />
          {repo.full_name}
        </h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>{repo.pr_count} PRs</span>
          <span>{repo.review_count} Reviews</span>
          <Badge variant={repo.is_indexed ? "default" : "secondary"}>
            {repo.is_indexed ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" /> Indexed
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" /> Not indexed
              </>
            )}
          </Badge>
        </div>
      </div>

      <PRList prs={prs || []} repoId={id} />
    </div>
  );
}
