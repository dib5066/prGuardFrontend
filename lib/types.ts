/**
 * TypeScript interfaces matching backend Pydantic schemas.
 * These types ensure type safety between frontend and backend.
 */

export interface Repository {
  id: number;
  github_id: number;
  name: string;
  full_name: string;
  installation_id: number;
  is_indexed: boolean;
  last_indexed_at: string | null;
  created_at: string;
  pr_count: number;
  review_count: number;
}

export interface PullRequest {
  id: number;
  repository_id: number;
  number: number;
  title: string;
  state: string;
  base_sha: string;
  head_sha: string;
  user_login: string;
  created_at: string;
  latest_review_status: string | null;
  latest_review_id: number | null;
  review_count: number;
}

export interface Review {
  id: number;
  pull_request_id: number;
  status: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  finding_count: number;
  severity_counts: Record<string, number>;
}

export interface Finding {
  id: number;
  review_id: number;
  severity: string;
  category: string;
  title: string;
  description: string;
  file_path: string;
  line_number: number | null;
  evidence: string | null;
  confidence: number;
  validation_status: string | null;
  is_published: boolean;
  created_at: string;
}

export interface ReviewRun {
  id: number;
  review_id: number;
  agent_name: string;
  latency_ms: number | null;
  tokens_used: number | null;
  created_at: string;
}

export interface DashboardStats {
  total_repos: number;
  indexed_repos: number;
  total_prs: number;
  total_reviews: number;
  completed_reviews: number;
  failed_reviews: number;
  total_findings: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  avg_latency_ms: number | null;
  avg_tokens_used: number | null;
}

export interface AuthUser {
  id: number;
  github_username: string | null;
  email: string | null;
  avatar_url: string | null;
  has_installation: boolean;
}

export interface ReviewStatus {
  id: number;
  status: string;
  current_phase: string | null;
  phase_message: string | null;
  created_at: string;
  completed_at: string | null;
}

/** Live per-agent progress, derived from the SSE `agent` events. */
export interface AgentProgress {
  agent: string;
  status: "running" | "done";
  findings: number | null;
  latency_ms: number | null;
}
