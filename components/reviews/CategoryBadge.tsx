"use client";

import { Badge } from "@/components/ui/badge";

const categoryConfig: Record<string, { label: string; emoji: string }> = {
  security: { label: "Security", emoji: "🛡️" },
  correctness: { label: "Correctness", emoji: "🔍" },
  quality: { label: "Quality", emoji: "✨" },
  error_handling: { label: "Error Handling", emoji: "⚠️" },
  testing: { label: "Testing", emoji: "🧪" },
  performance: { label: "Performance", emoji: "⚡" },
};

export function CategoryBadge({ category }: { category: string }) {
  const config = categoryConfig[category] || {
    label: category.replace(/_/g, " "),
    emoji: "📋",
  };

  return (
    <Badge variant="outline" className="text-xs">
      {config.emoji} {config.label}
    </Badge>
  );
}
