/**
 * Type validation tests for lib/types.ts.
 *
 * These tests verify that our TypeScript interfaces correctly describe
 * the shape of data returned by the backend. We cast mock JSON into
 * the interface types and check that all expected fields are present
 * and have the correct types at runtime.
 */

import { describe, it, expect } from "vitest";
import type {
  Repository,
  PullRequest,
  Review,
  Finding,
  ReviewRun,
  DashboardStats,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers — assert a value matches a type shape at runtime
// ---------------------------------------------------------------------------

function assertType<T>(_value: T) {
  // This function exists purely for compile-time type checking.
  // If the code compiles, the types are compatible.
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Type: Repository", () => {
  it("accepts a valid repository object", () => {
    const repo: Repository = {
      id: 1,
      github_id: 12345,
      name: "my-repo",
      full_name: "org/my-repo",
      installation_id: 999,
      is_indexed: true,
      last_indexed_at: "2026-09-01T12:00:00Z",
      created_at: "2026-08-01T00:00:00Z",
      pr_count: 5,
      review_count: 3,
    };

    assertType(repo);
    expect(repo.id).toBeTypeOf("number");
    expect(repo.github_id).toBeTypeOf("number");
    expect(repo.name).toBeTypeOf("string");
    expect(repo.full_name).toBeTypeOf("string");
    expect(repo.installation_id).toBeTypeOf("number");
    expect(repo.is_indexed).toBeTypeOf("boolean");
    expect(repo.pr_count).toBeTypeOf("number");
    expect(repo.review_count).toBeTypeOf("number");
  });

  it("accepts null last_indexed_at", () => {
    const repo: Repository = {
      id: 1,
      github_id: 12345,
      name: "my-repo",
      full_name: "org/my-repo",
      installation_id: 999,
      is_indexed: false,
      last_indexed_at: null,
      created_at: "2026-08-01T00:00:00Z",
      pr_count: 0,
      review_count: 0,
    };

    expect(repo.last_indexed_at).toBeNull();
    expect(repo.is_indexed).toBe(false);
  });
});

describe("Type: PullRequest", () => {
  it("accepts a valid pull request object", () => {
    const pr: PullRequest = {
      id: 10,
      repository_id: 1,
      number: 42,
      title: "Add feature X",
      state: "open",
      base_sha: "aaa1111111111111111111111111111111111111",
      head_sha: "bbb2222222222222222222222222222222222222",
      user_login: "dev",
      created_at: "2026-09-01T10:00:00Z",
      latest_review_status: "COMPLETED",
      latest_review_id: null,
      review_count: 2,
    };

    assertType(pr);
    expect(pr.number).toBeTypeOf("number");
    expect(pr.state).toBeTypeOf("string");
    expect(pr.base_sha).toHaveLength(40);
    expect(pr.head_sha).toHaveLength(40);
  });

  it("accepts null latest_review_status", () => {
    const pr: PullRequest = {
      id: 10,
      repository_id: 1,
      number: 42,
      title: "Add feature X",
      state: "open",
      base_sha: "aaa111",
      head_sha: "bbb222",
      user_login: "dev",
      created_at: "2026-09-01T10:00:00Z",
      latest_review_status: null,
      latest_review_id: null,
      review_count: 0,
    };

    expect(pr.latest_review_status).toBeNull();
    expect(pr.review_count).toBe(0);
  });
});

describe("Type: Review", () => {
  it("accepts a valid review object", () => {
    const review: Review = {
      id: 100,
      pull_request_id: 10,
      status: "COMPLETED",
      error_message: null,
      created_at: "2026-09-02T08:00:00Z",
      completed_at: "2026-09-02T08:01:30Z",
      finding_count: 4,
      severity_counts: { critical: 1, high: 1, medium: 1, low: 1 },
    };

    assertType(review);
    expect(review.status).toBeTypeOf("string");
    expect(review.finding_count).toBeTypeOf("number");
    expect(review.severity_counts).toBeTypeOf("object");
  });

  it("accepts FAILED status with error message", () => {
    const review: Review = {
      id: 101,
      pull_request_id: 10,
      status: "FAILED",
      error_message: "Groq rate limit exceeded",
      created_at: "2026-09-02T08:00:00Z",
      completed_at: null,
      finding_count: 0,
      severity_counts: {},
    };

    expect(review.status).toBe("FAILED");
    expect(review.error_message).toBeTypeOf("string");
    expect(review.completed_at).toBeNull();
  });
});

describe("Type: Finding", () => {
  it("accepts a valid finding object", () => {
    const finding: Finding = {
      id: 200,
      review_id: 100,
      severity: "high",
      category: "security",
      title: "SQL Injection",
      description: "User input concatenated into query.",
      file_path: "src/db.py",
      line_number: 42,
      evidence: 'query = f"SELECT * FROM users WHERE id={uid}"',
      confidence: 0.92,
      validation_status: null,
      is_published: true,
      created_at: "2026-09-02T08:01:00Z",
    };

    assertType(finding);
    expect(finding.file_path).toBeTypeOf("string");
    expect(finding.line_number).toBeTypeOf("number");
    expect(finding.confidence).toBeGreaterThanOrEqual(0);
    expect(finding.confidence).toBeLessThanOrEqual(1);
  });

  it("accepts null line_number and evidence", () => {
    const finding: Finding = {
      id: 201,
      review_id: 100,
      severity: "low",
      category: "quality",
      title: "Code smell",
      description: "Function is too long.",
      file_path: "src/utils.py",
      line_number: null,
      evidence: null,
      confidence: 0.6,
      validation_status: null,
      is_published: true,
      created_at: "2026-09-02T08:01:00Z",
    };

    expect(finding.line_number).toBeNull();
    expect(finding.evidence).toBeNull();
  });
});

describe("Type: ReviewRun", () => {
  it("accepts a valid review run object", () => {
    const run: ReviewRun = {
      id: 300,
      review_id: 100,
      agent_name: "security_agent",
      latency_ms: 1500,
      tokens_used: 2048,
      created_at: "2026-09-02T08:01:00Z",
    };

    assertType(run);
    expect(run.agent_name).toBeTypeOf("string");
    expect(run.latency_ms).toBeTypeOf("number");
    expect(run.tokens_used).toBeTypeOf("number");
  });
});

describe("Type: DashboardStats", () => {
  it("accepts a valid stats object", () => {
    const stats: DashboardStats = {
      total_repos: 10,
      indexed_repos: 8,
      total_prs: 50,
      total_reviews: 40,
      completed_reviews: 35,
      failed_reviews: 5,
      total_findings: 120,
      critical_findings: 10,
      high_findings: 30,
      medium_findings: 50,
      low_findings: 30,
      avg_latency_ms: 1200,
      avg_tokens_used: 1800,
    };

    assertType(stats);
    expect(stats.total_repos).toBeTypeOf("number");
    expect(stats.completed_reviews).toBeLessThanOrEqual(stats.total_reviews);
    expect(stats.total_findings).toBe(
      stats.critical_findings +
        stats.high_findings +
        stats.medium_findings +
        stats.low_findings,
    );
  });

  it("accepts null avg values", () => {
    const stats: DashboardStats = {
      total_repos: 0,
      indexed_repos: 0,
      total_prs: 0,
      total_reviews: 0,
      completed_reviews: 0,
      failed_reviews: 0,
      total_findings: 0,
      critical_findings: 0,
      high_findings: 0,
      medium_findings: 0,
      low_findings: 0,
      avg_latency_ms: null,
      avg_tokens_used: null,
    };

    expect(stats.avg_latency_ms).toBeNull();
    expect(stats.avg_tokens_used).toBeNull();
  });
});
