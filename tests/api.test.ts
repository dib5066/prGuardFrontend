/**
 * Integration tests for the API client (lib/api.ts).
 *
 * These tests verify:
 *   1. Every endpoint constructs the correct URL.
 *   2. The correct HTTP method and headers are sent.
 *   3. Response bodies are returned as typed objects.
 *   4. Non-2xx responses throw descriptive errors.
 *   5. Network failures are propagated.
 *
 * Mock strategy: We mock the global `fetch` so no real HTTP calls are made.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "@/lib/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Spy on global.fetch and return a mock implementation. */
function mockFetch(
  response: { ok: boolean; status: number; statusText: string; json: () => Promise<any> },
) {
  const fn = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

function ok(body: unknown) {
  return mockFetch({
    ok: true,
    status: 200,
    statusText: "OK",
    json: () => Promise.resolve(body),
  });
}

function fail(status: number, statusText: string) {
  return mockFetch({
    ok: false,
    status,
    statusText,
    json: () => Promise.resolve({ detail: statusText }),
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const REPO_FIXTURE = {
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

const PR_FIXTURE = {
  id: 10,
  repository_id: 1,
  number: 42,
  title: "Add feature X",
  state: "open",
  base_sha: "aaa111",
  head_sha: "bbb222",
  user_login: "dev",
  created_at: "2026-09-01T10:00:00Z",
  latest_review_status: "COMPLETED",
  review_count: 2,
};

const REVIEW_FIXTURE = {
  id: 100,
  pull_request_id: 10,
  status: "COMPLETED",
  error_message: null,
  created_at: "2026-09-02T08:00:00Z",
  completed_at: "2026-09-02T08:01:30Z",
  finding_count: 4,
  severity_counts: { critical: 1, high: 1, medium: 1, low: 1 },
};

const FINDING_FIXTURE = {
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
  created_at: "2026-09-02T08:01:00Z",
};

const REVIEW_RUN_FIXTURE = {
  id: 300,
  review_id: 100,
  agent_name: "security_agent",
  latency_ms: 1500,
  tokens_used: 2048,
  created_at: "2026-09-02T08:01:00Z",
};

const STATS_FIXTURE = {
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("API Client — Repos", () => {
  afterEach(() => vi.restoreAllMocks());

  it("getRepos returns an array of repositories", async () => {
    const fetchFn = ok([REPO_FIXTURE]);
    const repos = await api.getRepos();

    expect(fetchFn).toHaveBeenCalledOnce();
    expect(fetchFn.mock.calls[0][0]).toContain("/api/repos");
    expect(repos).toHaveLength(1);
    expect(repos[0].full_name).toBe("org/my-repo");
  });

  it("getRepo returns a single repository by id", async () => {
    const fetchFn = ok(REPO_FIXTURE);
    const repo = await api.getRepo(1);

    expect(fetchFn.mock.calls[0][0]).toContain("/api/repos/1");
    expect(repo.id).toBe(1);
    expect(repo.github_id).toBe(12345);
  });

  it("getRepoPRs returns an array of pull requests", async () => {
    const fetchFn = ok([PR_FIXTURE]);
    const prs = await api.getRepoPRs(1);

    expect(fetchFn.mock.calls[0][0]).toContain("/api/repos/1/prs");
    expect(prs).toHaveLength(1);
    expect(prs[0].number).toBe(42);
  });
});

describe("API Client — Pull Requests", () => {
  afterEach(() => vi.restoreAllMocks());

  it("getPR returns a single pull request", async () => {
    const fetchFn = ok(PR_FIXTURE);
    const pr = await api.getPR(10);

    expect(fetchFn.mock.calls[0][0]).toContain("/api/prs/10");
    expect(pr.title).toBe("Add feature X");
    expect(pr.state).toBe("open");
  });

  it("getPRReviews returns an array of reviews for a PR", async () => {
    const fetchFn = ok([REVIEW_FIXTURE]);
    const reviews = await api.getPRReviews(10);

    expect(fetchFn.mock.calls[0][0]).toContain("/api/prs/10/reviews");
    expect(reviews).toHaveLength(1);
    expect(reviews[0].status).toBe("COMPLETED");
  });
});

describe("API Client — Reviews", () => {
  afterEach(() => vi.restoreAllMocks());

  it("getReview returns a single review", async () => {
    const fetchFn = ok(REVIEW_FIXTURE);
    const review = await api.getReview(100);

    expect(fetchFn.mock.calls[0][0]).toContain("/api/reviews/100");
    expect(review.id).toBe(100);
    expect(review.finding_count).toBe(4);
    expect(review.severity_counts).toEqual({
      critical: 1,
      high: 1,
      medium: 1,
      low: 1,
    });
  });

  it("getReviewFindings returns an array of findings", async () => {
    const fetchFn = ok([FINDING_FIXTURE]);
    const findings = await api.getReviewFindings(100);

    expect(fetchFn.mock.calls[0][0]).toContain("/api/reviews/100/findings");
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe("high");
    expect(findings[0].category).toBe("security");
    expect(findings[0].confidence).toBe(0.92);
  });

  it("getReviewMetrics returns an array of review runs", async () => {
    const fetchFn = ok([REVIEW_RUN_FIXTURE]);
    const metrics = await api.getReviewMetrics(100);

    expect(fetchFn.mock.calls[0][0]).toContain("/api/reviews/100/metrics");
    expect(metrics).toHaveLength(1);
    expect(metrics[0].agent_name).toBe("security_agent");
    expect(metrics[0].latency_ms).toBe(1500);
  });
});

describe("API Client — Stats", () => {
  afterEach(() => vi.restoreAllMocks());

  it("getStats returns dashboard statistics", async () => {
    const fetchFn = ok(STATS_FIXTURE);
    const stats = await api.getStats();

    expect(fetchFn.mock.calls[0][0]).toContain("/api/stats");
    expect(stats.total_repos).toBe(10);
    expect(stats.completed_reviews).toBe(35);
    expect(stats.total_findings).toBe(120);
    expect(stats.avg_latency_ms).toBe(1200);
  });
});

describe("API Client — Error handling", () => {
  afterEach(() => vi.restoreAllMocks());

  it("throws on 404 responses", async () => {
    fail(404, "Not Found");

    await expect(api.getRepo(999)).rejects.toThrow("Not Found");
  });

  it("throws on 500 responses", async () => {
    fail(500, "Internal Server Error");

    await expect(api.getStats()).rejects.toThrow("Internal Server Error");
  });

  it("throws on network failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(api.getRepos()).rejects.toThrow("Failed to fetch");
  });
});

describe("API Client — Request configuration", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends Content-Type: application/json header", async () => {
    const fetchFn = ok([]);
    await api.getRepos();

    const options = fetchFn.mock.calls[0][1];
    expect(options.headers).toEqual({ "Content-Type": "application/json" });
  });

  it("constructs URLs with the correct base", async () => {
    const fetchFn = ok([]);
    await api.getRepos();

    const url = fetchFn.mock.calls[0][0];
    expect(url).toBe("/api/repos");
  });

  it("handles numeric IDs in URL paths", async () => {
    const fetchFn = ok(REVIEW_FIXTURE);
    await api.getReview(42);

    expect(fetchFn.mock.calls[0][0]).toContain("/api/reviews/42");
  });
});

describe("API Client — Empty responses", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns empty array when repos endpoint returns empty", async () => {
    ok([]);
    const repos = await api.getRepos();
    expect(repos).toEqual([]);
  });

  it("returns empty array when findings endpoint returns empty", async () => {
    ok([]);
    const findings = await api.getReviewFindings(100);
    expect(findings).toEqual([]);
  });
});
