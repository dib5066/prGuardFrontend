/**
 * API client for backend communication.
 * All functions return typed responses matching lib/types.ts.
 */

import {
  Repository,
  PullRequest,
  Review,
  Finding,
  ReviewRun,
  DashboardStats,
  ReviewStatus,
  AuthUser,
} from "./types";

// Empty by default — the browser calls the Next origin and next.config.ts
// rewrites /api/* to the backend (keeps the session cookie first-party).
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    // Send the session cookie on every request.
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });

  // 401 is surfaced as an ApiError; routing to /login is owned by AppShell
  // (doing a hard redirect here too caused a reload loop).

  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json())?.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail);
  }

  return res.status === 204 ? (undefined as T) : res.json();
}

const fetchAPI = <T>(path: string) => request<T>(path);

export const api = {
  // ==========================================================================
  // Repos
  // ==========================================================================

  getRepos: () => fetchAPI<Repository[]>("/api/repos"),

  getRepo: (id: number) => fetchAPI<Repository>(`/api/repos/${id}`),

  getRepoPRs: (id: number) => fetchAPI<PullRequest[]>(`/api/repos/${id}/prs`),

  // ==========================================================================
  // Pull Requests
  // ==========================================================================

  getPR: (id: number) => fetchAPI<PullRequest>(`/api/prs/${id}`),

  getPRReviews: (id: number) => fetchAPI<Review[]>(`/api/prs/${id}/reviews`),

  // ==========================================================================
  // Reviews
  // ==========================================================================

  getReview: (id: number) => fetchAPI<Review>(`/api/reviews/${id}`),

  getReviewFindings: (id: number, publishedOnly: boolean = true) =>
    fetchAPI<Finding[]>(
      `/api/reviews/${id}/findings?published_only=${publishedOnly}`
    ),

  getReviewMetrics: (id: number) =>
    fetchAPI<ReviewRun[]>(`/api/reviews/${id}/metrics`),

  // ==========================================================================
  // Review Status (phase tracking)
  // ==========================================================================

  getReviewStatus: (id: number) =>
    fetchAPI<ReviewStatus>(`/api/reviews/${id}/status`),

  // ==========================================================================
  // Stats
  // ==========================================================================

  getStats: () => fetchAPI<DashboardStats>("/api/stats"),

  // ==========================================================================
  // Auth
  // ==========================================================================

  me: () => fetchAPI<AuthUser>("/api/auth/me"),

  logout: () => request<void>("/api/auth/logout", { method: "POST" }),

  getInstallUrl: () => fetchAPI<{ url: string }>("/api/github/install-url"),
};
