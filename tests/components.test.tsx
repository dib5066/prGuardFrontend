/**
 * Component integration tests for key UI components.
 *
 * Tests verify that components render correctly with real prop shapes,
 * handle null/empty states, and display formatted data.
 */

import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { SeverityBadge } from "@/components/reviews/SeverityBadge";
import { FindingCard } from "@/components/reviews/FindingCard";
import { ReviewSummary } from "@/components/reviews/ReviewSummary";
import { AgentMetrics } from "@/components/reviews/AgentMetrics";
import type { Finding, Review, ReviewRun } from "@/lib/types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const FINDING: Finding = {
  id: 1,
  review_id: 100,
  severity: "critical",
  category: "security",
  title: "SQL Injection Vulnerability",
  description: "User input is directly concatenated into a SQL query.",
  file_path: "src/db/query.py",
  line_number: 42,
  evidence: 'query = f"SELECT * FROM users WHERE id={uid}"',
  confidence: 0.95,
  validation_status: null,
  is_published: true,
  created_at: "2026-09-02T08:01:00Z",
};

const FINDING_NULL_FIELDS: Finding = {
  id: 2,
  review_id: 100,
  severity: "low",
  category: "quality",
  title: "Long function",
  description: "Function exceeds 50 lines.",
  file_path: "src/utils.py",
  line_number: null,
  evidence: null,
  confidence: 0.6,
  validation_status: null,
  is_published: true,
  created_at: "2026-09-02T08:01:00Z",
};

const REVIEW: Review = {
  id: 100,
  pull_request_id: 10,
  status: "COMPLETED",
  error_message: null,
  created_at: "2026-09-02T08:00:00Z",
  completed_at: "2026-09-02T08:01:30Z",
  finding_count: 3,
  severity_counts: { critical: 1, high: 1, medium: 1, low: 0 },
};

const REVIEW_FAILED: Review = {
  id: 101,
  pull_request_id: 10,
  status: "FAILED",
  error_message: "Groq rate limit exceeded",
  created_at: "2026-09-02T08:00:00Z",
  completed_at: null,
  finding_count: 0,
  severity_counts: {},
};

const REVIEW_RUNS: ReviewRun[] = [
  {
    id: 300,
    review_id: 100,
    agent_name: "security_agent",
    latency_ms: 1500,
    tokens_used: 2048,
    created_at: "2026-09-02T08:01:00Z",
  },
  {
    id: 301,
    review_id: 100,
    agent_name: "correctness_agent",
    latency_ms: 800,
    tokens_used: 1500,
    created_at: "2026-09-02T08:01:00Z",
  },
];

// ---------------------------------------------------------------------------
// Tests: SeverityBadge
// ---------------------------------------------------------------------------

describe("SeverityBadge", () => {
  it("renders critical severity with uppercase label", () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
  });

  it("renders high severity", () => {
    render(<SeverityBadge severity="high" />);
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("renders medium severity", () => {
    render(<SeverityBadge severity="medium" />);
    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
  });

  it("renders low severity", () => {
    render(<SeverityBadge severity="low" />);
    expect(screen.getByText("LOW")).toBeInTheDocument();
  });

  it("handles unknown severity gracefully", () => {
    render(<SeverityBadge severity="blocker" />);
    expect(screen.getByText("BLOCKER")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tests: FindingCard
// ---------------------------------------------------------------------------

describe("FindingCard", () => {
  it("renders finding title", () => {
    render(<FindingCard finding={FINDING} />);
    expect(screen.getByText("SQL Injection Vulnerability")).toBeInTheDocument();
  });

  it("renders finding description", () => {
    render(<FindingCard finding={FINDING} />);
    expect(
      screen.getByText("User input is directly concatenated into a SQL query."),
    ).toBeInTheDocument();
  });

  it("renders severity badge", () => {
    render(<FindingCard finding={FINDING} />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
  });

  it("renders category badge with label", () => {
    render(<FindingCard finding={FINDING} />);
    // CategoryBadge renders "🛡️ Security" for security category
    expect(screen.getByText(/Security/)).toBeInTheDocument();
  });

  it("renders file path with line number", () => {
    render(<FindingCard finding={FINDING} />);
    // File path appears in card metadata AND evidence block — use getAllByText
    const pathMatches = screen.getAllByText(/src\/db\/query\.py/);
    expect(pathMatches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/L42/)).toBeInTheDocument();
  });

  it("renders confidence as percentage", () => {
    render(<FindingCard finding={FINDING} />);
    expect(screen.getByText(/95%/)).toBeInTheDocument();
  });

  it("renders evidence block when evidence is present", () => {
    render(<FindingCard finding={FINDING} />);
    expect(
      screen.getByText(/SELECT \* FROM users/),
    ).toBeInTheDocument();
  });

  it("handles null line_number gracefully", () => {
    render(<FindingCard finding={FINDING_NULL_FIELDS} />);
    expect(screen.getByText("Long function")).toBeInTheDocument();
    // Should not show :L when line_number is null
    expect(screen.queryByText(/L\d+/)).not.toBeInTheDocument();
  });

  it("hides evidence block when evidence is null", () => {
    render(<FindingCard finding={FINDING_NULL_FIELDS} />);
    // EvidenceBlock should not render
    expect(screen.queryByRole("pre")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tests: ReviewSummary
// ---------------------------------------------------------------------------

describe("ReviewSummary", () => {
  it("renders Review Summary heading", () => {
    render(<ReviewSummary review={REVIEW} />);
    expect(screen.getByText("Review Summary")).toBeInTheDocument();
  });

  it("renders completed status badge", () => {
    render(<ReviewSummary review={REVIEW} />);
    // "Completed" appears in badge AND in timestamp text — use getAllByText
    const completedMatches = screen.getAllByText(/Completed/);
    expect(completedMatches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders severity breakdown with counts", () => {
    render(<ReviewSummary review={REVIEW} />);
    // Critical: 1, High: 1, Medium: 1
    expect(screen.getByText("critical:")).toBeInTheDocument();
    expect(screen.getByText("high:")).toBeInTheDocument();
    expect(screen.getByText("medium:")).toBeInTheDocument();
    // Low count is 0, should not render
    expect(screen.queryByText("low:")).not.toBeInTheDocument();
  });

  it("renders creation timestamp", () => {
    render(<ReviewSummary review={REVIEW} />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("renders completed timestamp", () => {
    render(<ReviewSummary review={REVIEW} />);
    expect(screen.getByText(/Completed:/)).toBeInTheDocument();
  });

  it("renders failed status with error message", () => {
    render(<ReviewSummary review={REVIEW_FAILED} />);
    expect(screen.getByText(/Failed/)).toBeInTheDocument();
    expect(
      screen.getByText("Groq rate limit exceeded"),
    ).toBeInTheDocument();
  });

  it("hides completed timestamp when null", () => {
    render(<ReviewSummary review={REVIEW_FAILED} />);
    expect(screen.queryByText(/Completed:/)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tests: AgentMetrics
// ---------------------------------------------------------------------------

describe("AgentMetrics", () => {
  it("renders Agent Performance heading", () => {
    render(<AgentMetrics metrics={REVIEW_RUNS} />);
    expect(screen.getByText("Agent Performance")).toBeInTheDocument();
  });

  it("renders formatted agent names (title case, no _agent suffix)", () => {
    render(<AgentMetrics metrics={REVIEW_RUNS} />);
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("Correctness")).toBeInTheDocument();
  });

  it("renders latency in seconds format", () => {
    render(<AgentMetrics metrics={REVIEW_RUNS} />);
    expect(screen.getByText("1.5s")).toBeInTheDocument();
    expect(screen.getByText("0.8s")).toBeInTheDocument();
  });

  it("renders token counts", () => {
    render(<AgentMetrics metrics={REVIEW_RUNS} />);
    expect(screen.getByText("2,048")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument();
  });

  it("sorts metrics by latency (fastest first)", () => {
    render(<AgentMetrics metrics={REVIEW_RUNS} />);
    const rows = screen.getAllByRole("row");
    // Row 0 is header, row 1 should be correctness (800ms), row 2 security (1500ms)
    expect(rows[1]).toHaveTextContent("Correctness");
    expect(rows[2]).toHaveTextContent("Security");
  });

  it("renders null when no metrics provided", () => {
    const { container } = render(<AgentMetrics metrics={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("handles metrics with null latency_ms", () => {
    const runsWithNull: ReviewRun[] = [
      {
        id: 302,
        review_id: 100,
        agent_name: "quality_agent",
        latency_ms: null,
        tokens_used: 1000,
        created_at: "2026-09-02T08:01:00Z",
      },
    ];
    render(<AgentMetrics metrics={runsWithNull} />);
    expect(screen.getByText("—")).toBeInTheDocument(); // null latency shows dash
  });

  it("handles metrics with null tokens_used", () => {
    const runsWithNull: ReviewRun[] = [
      {
        id: 303,
        review_id: 100,
        agent_name: "testing_agent",
        latency_ms: 500,
        tokens_used: null,
        created_at: "2026-09-02T08:01:00Z",
      },
    ];
    render(<AgentMetrics metrics={runsWithNull} />);
    expect(screen.getByText("—")).toBeInTheDocument(); // null tokens shows dash
  });
});
