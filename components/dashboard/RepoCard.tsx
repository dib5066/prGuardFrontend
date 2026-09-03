"use client";

import Link from "next/link";
import { Repository } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, CheckCircle, Clock } from "lucide-react";

export function RepoCard({ repo }: { repo: Repository }) {
  return (
    <Link href={`/repos/${repo.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-muted-foreground" />
            {repo.full_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
        </CardContent>
      </Card>
    </Link>
  );
}
