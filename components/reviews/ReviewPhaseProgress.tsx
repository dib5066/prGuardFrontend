"use client";

import { AgentProgress, ReviewStatus } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface ReviewPhaseProgressProps {
  reviewStatus: ReviewStatus;
  agents?: AgentProgress[];
}

/**
 * Ordered list of review phases for the progress display.
 */
const phases = [
  { key: "fetching_context", label: "Fetching PR context" },
  { key: "indexing", label: "Indexing repository" },
  { key: "building_rag", label: "Building RAG context" },
  { key: "running_agents", label: "Running AI agents" },
  { key: "validating", label: "Validating findings" },
  { key: "publishing", label: "Publishing review" },
  { key: "completed", label: "Completed" },
];

const AGENT_LABELS: Record<string, string> = {
  correctness_agent: "Correctness",
  security_agent: "Security",
  error_handling_agent: "Error handling",
  quality_agent: "Code quality",
  testing_agent: "Testing",
};

function agentLabel(agent: string): string {
  return (
    AGENT_LABELS[agent] ??
    agent.replace(/_agent$/, "").replace(/_/g, " ")
  );
}

function AgentRows({ agents }: { agents: AgentProgress[] }) {
  if (!agents.length) return null;

  return (
    <div className="ml-9 mt-2 space-y-1.5 border-l border-dashed border-gray-200 pl-4">
      {agents.map((a) => (
        <div
          key={a.agent}
          className="flex items-center gap-2 text-xs"
        >
          {a.status === "done" ? (
            <span className="text-green-600">✓</span>
          ) : (
            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
          )}
          <span
            className={
              a.status === "done"
                ? "text-green-600"
                : "text-blue-600 font-medium"
            }
          >
            {agentLabel(a.agent)}
          </span>
          {a.status === "done" && (
            <span className="text-muted-foreground">
              {a.findings ?? 0} finding{(a.findings ?? 0) === 1 ? "" : "s"}
              {a.latency_ms != null &&
                ` · ${(a.latency_ms / 1000).toFixed(1)}s`}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function ReviewPhaseProgress({
  reviewStatus,
  agents = [],
}: ReviewPhaseProgressProps) {
  const { status, current_phase, phase_message } = reviewStatus;

  if (status !== "RUNNING" && status !== "PENDING") {
    return null;
  }

  const currentPhaseIndex = phases.findIndex(
    (p) => p.key === current_phase
  );
  const agentsPhaseIndex = phases.findIndex(
    (p) => p.key === "running_agents"
  );

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        <h3 className="text-lg font-semibold">
          {phase_message || "Review in progress..."}
        </h3>
      </div>

      <div className="space-y-3">
        {phases.map((phase, index) => {
          const isCompleted = currentPhaseIndex > index;
          const isCurrent = currentPhaseIndex === index;

          // Show the per-agent breakdown once the run has reached the
          // "running AI agents" phase (and keep it visible afterwards).
          const showAgents =
            index === agentsPhaseIndex &&
            currentPhaseIndex >= agentsPhaseIndex &&
            agents.length > 0;

          return (
            <div key={phase.key}>
              <div
                className={`flex items-center gap-3 text-sm ${
                  isCurrent
                    ? "text-blue-600 font-medium"
                    : isCompleted
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
              >
                {/* Status indicator */}
                <div className="relative flex h-6 w-6 items-center justify-center">
                  {isCompleted ? (
                    <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>

                {/* Phase label */}
                <span>{phase.label}</span>

                {/* Current phase indicator */}
                {isCurrent && (
                  <span className="text-xs text-blue-500">(current)</span>
                )}
              </div>

              {showAgents && <AgentRows agents={agents} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
