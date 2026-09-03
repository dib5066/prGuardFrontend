/**
 * SWR hook for dashboard statistics.
 */

import useSWR from "swr";
import { api } from "@/lib/api";
import { DashboardStats } from "@/lib/types";

export function useStats() {
  return useSWR<DashboardStats>("stats", api.getStats);
}
