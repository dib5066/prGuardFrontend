/**
 * SWR hook for repository data.
 */

import useSWR from "swr";
import { api } from "@/lib/api";
import { Repository, PullRequest } from "@/lib/types";

export function useRepos() {
  return useSWR<Repository[]>("repos", api.getRepos);
}

export function useRepo(id: number | null) {
  return useSWR<Repository>(id ? `repo-${id}` : null, () =>
    api.getRepo(id!)
  );
}

export function useRepoPRs(id: number | null) {
  return useSWR<PullRequest[]>(id ? `repo-${id}-prs` : null, () =>
    api.getRepoPRs(id!)
  );
}
