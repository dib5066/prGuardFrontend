"use client";

import { ReviewRun } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AgentMetricsProps {
  metrics: ReviewRun[];
}

export function AgentMetrics({ metrics }: AgentMetricsProps) {
  if (metrics.length === 0) {
    return null;
  }

  // Sort by latency (fastest first)
  const sortedMetrics = [...metrics].sort(
    (a, b) => (a.latency_ms || 0) - (b.latency_ms || 0)
  );

  // Format agent name for display
  const formatAgentName = (name: string) => {
    return name
      .replace(/_agent$/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Agent Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead className="text-right">Latency</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMetrics.map((metric) => (
              <TableRow key={metric.id}>
                <TableCell className="font-medium">
                  {formatAgentName(metric.agent_name)}
                </TableCell>
                <TableCell className="text-right">
                  {metric.latency_ms
                    ? `${(metric.latency_ms / 1000).toFixed(1)}s`
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {metric.tokens_used
                    ? metric.tokens_used.toLocaleString()
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
