"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const severityConfig: Record<string, { label: string; className: string }> = {
  critical: {
    label: "CRITICAL",
    className: "bg-red-500 hover:bg-red-600 text-white",
  },
  high: {
    label: "HIGH",
    className: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  medium: {
    label: "MEDIUM",
    className: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  low: {
    label: "LOW",
    className: "bg-green-500 hover:bg-green-600 text-white",
  },
};

export function SeverityBadge({ severity }: { severity: string }) {
  const config = severityConfig[severity] || {
    label: severity.toUpperCase(),
    className: "bg-gray-500 text-white",
  };

  return (
    <Badge className={cn("text-xs font-semibold", config.className)}>
      {config.label}
    </Badge>
  );
}
