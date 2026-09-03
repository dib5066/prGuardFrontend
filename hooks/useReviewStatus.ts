/**
 * Live review progress.
 *
 * Primary transport is Server-Sent Events (`GET /api/reviews/:id/events`),
 * which pushes phase changes and per-agent completion the moment they
 * happen. If the stream can't be established (or drops before the review
 * finishes) this falls back to polling `GET /api/reviews/:id/status`
 * every 2s — the same behaviour the app had before.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { api, API_BASE } from "@/lib/api";
import { AgentProgress, ReviewStatus } from "@/lib/types";

const POLL_INTERVAL = 2000;

interface UseReviewStatusResult {
  status: ReviewStatus | undefined;
  agents: AgentProgress[];
  /** True once the review reached COMPLETED or FAILED. */
  done: boolean;
  isLoading: boolean;
  isError: boolean;
}

export function useReviewStatus(
  id: number | null
): UseReviewStatusResult {
  const [status, setStatus] = useState<ReviewStatus>();
  const [agents, setAgents] = useState<AgentProgress[]>([]);
  const [done, setDone] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    if (id == null || Number.isNaN(id)) return;

    // Reset when the id changes.
    setStatus(undefined);
    setAgents([]);
    setDone(false);
    setUseFallback(false);
    doneRef.current = false;

    let closed = false;
    let es: EventSource | null = null;

    const patch = (ev: {
      status?: string;
      phase?: string | null;
      message?: string | null;
    }) => {
      setStatus((prev) => ({
        id,
        status: ev.status ?? prev?.status ?? "RUNNING",
        current_phase: ev.phase ?? prev?.current_phase ?? null,
        phase_message: ev.message ?? prev?.phase_message ?? null,
        created_at: prev?.created_at ?? "",
        completed_at: prev?.completed_at ?? null,
      }));
    };

    try {
      es = new EventSource(`${API_BASE}/api/reviews/${id}/events`);
    } catch {
      setUseFallback(true);
      return;
    }

    es.onmessage = (e) => {
      let ev: {
        type: string;
        status?: string;
        phase?: string | null;
        message?: string | null;
        agents?: string[];
        agent?: string;
        findings?: number;
        latency_ms?: number | null;
      };
      try {
        ev = JSON.parse(e.data);
      } catch {
        return;
      }

      switch (ev.type) {
        case "snapshot":
        case "phase":
          patch(ev);
          break;

        case "agents_started":
          setAgents(
            (ev.agents ?? []).map((a) => ({
              agent: a,
              status: "running" as const,
              findings: null,
              latency_ms: null,
            }))
          );
          break;

        case "agent": {
          const row: AgentProgress = {
            agent: ev.agent as string,
            status: (ev.status as "running" | "done") ?? "done",
            findings: ev.findings ?? null,
            latency_ms: ev.latency_ms ?? null,
          };
          setAgents((prev) =>
            prev.some((a) => a.agent === row.agent)
              ? prev.map((a) => (a.agent === row.agent ? row : a))
              : [...prev, row]
          );
          break;
        }

        case "done":
          doneRef.current = true;
          patch({
            status: ev.status ?? "COMPLETED",
            phase: ev.phase ?? "completed",
            message: ev.message ?? null,
          });
          setDone(true);
          closed = true;
          es?.close();
          break;

        // "findings_ready" / "error" — nothing to render directly.
        default:
          break;
      }
    };

    es.onerror = () => {
      es?.close();
      if (!doneRef.current && !closed) {
        // Stream failed mid-review — degrade to polling.
        setUseFallback(true);
      }
    };

    return () => {
      closed = true;
      es?.close();
    };
  }, [id]);

  // --- Polling fallback (only active if the stream failed) ---
  const { data: polled, error: pollError } = useSWR<ReviewStatus>(
    useFallback && id != null && !doneRef.current
      ? `review-status-poll-${id}`
      : null,
    () => api.getReviewStatus(id as number),
    {
      refreshInterval: (d) =>
        !d || d.status === "PENDING" || d.status === "RUNNING"
          ? POLL_INTERVAL
          : 0,
    }
  );

  useEffect(() => {
    if (!polled) return;
    setStatus(polled);
    if (polled.status === "COMPLETED" || polled.status === "FAILED") {
      doneRef.current = true;
      setDone(true);
    }
  }, [polled]);

  return {
    status,
    agents,
    done,
    isLoading: !status,
    isError: Boolean(pollError),
  };
}
