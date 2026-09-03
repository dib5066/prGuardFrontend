"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSWRConfig } from "swr";
import { useRepos } from "@/hooks/useRepos";
import { useAuth } from "@/hooks/useAuth";
import { RepoCard } from "@/components/dashboard/RepoCard";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { InstallAppCard } from "@/components/dashboard/InstallAppCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: repos, isLoading } = useRepos();
  const { user } = useAuth();
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const params = useSearchParams();

  // Back from the GitHub install flow → refresh, drop the marker.
  useEffect(() => {
    if (params.get("installed")) {
      mutate("auth-me");
      mutate("repos");
      mutate("stats");
      router.replace("/dashboard");
    }
  }, [params, mutate, router]);

  const showInstall =
    !!user && !user.has_installation && (!repos || repos.length === 0);

  if (showInstall) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <InstallAppCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <StatsOverview />

      <div>
        <h2 className="text-lg font-semibold mb-4">Repositories</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : repos && repos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        ) : (
          <InstallAppCard />
        )}
      </div>
    </div>
  );
}
