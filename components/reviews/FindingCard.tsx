"use client";

import { Finding } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "./SeverityBadge";
import { CategoryBadge } from "./CategoryBadge";
import { EvidenceBlock } from "./EvidenceBlock";

export function FindingCard({ finding }: { finding: Finding }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <SeverityBadge severity={finding.severity} />
          {finding.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm">{finding.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <CategoryBadge category={finding.category} />
          <span>
            📂 {finding.file_path}
            {finding.line_number ? `:L${finding.line_number}` : ""}
          </span>
          <Badge variant="outline">
            📊 {Math.round(finding.confidence * 100)}%
          </Badge>
          {!finding.is_published && (
            <Badge
              variant="outline"
              className="border-amber-400 text-amber-600"
              title={
                finding.validation_status
                  ? `Validation: ${finding.validation_status}`
                  : "Filtered by evidence validation"
              }
            >
              ⚠ filtered — not posted to GitHub
            </Badge>
          )}
        </div>
        {finding.evidence && (
          <EvidenceBlock
            evidence={finding.evidence}
            filePath={finding.file_path}
          />
        )}
      </CardContent>
    </Card>
  );
}
