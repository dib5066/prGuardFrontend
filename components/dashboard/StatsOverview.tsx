"use client";

import { useStats } from "@/hooks/useStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GitBranch,
  GitPullRequest,
  Search,
  AlertTriangle,
} from "lucide-react";

export function StatsOverview() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Repositories",
      value: stats?.total_repos ?? 0,
      subtitle: `${stats?.indexed_repos ?? 0} indexed`,
      icon: GitBranch,
    },
    {
      title: "Pull Requests",
      value: stats?.total_prs ?? 0,
      subtitle: "Total tracked",
      icon: GitPullRequest,
    },
    {
      title: "Reviews",
      value: stats?.total_reviews ?? 0,
      subtitle: `${stats?.completed_reviews ?? 0} completed`,
      icon: Search,
    },
    {
      title: "Findings",
      value: stats?.total_findings ?? 0,
      subtitle: `${stats?.critical_findings ?? 0} critical`,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
