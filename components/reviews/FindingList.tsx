"use client";

import { Finding } from "@/lib/types";
import { FindingCard } from "./FindingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FindingListProps {
  findings: Finding[];
}

export function FindingList({ findings }: FindingListProps) {
  if (findings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No findings in this review.
      </div>
    );
  }

  // Group findings by severity
  const grouped = {
    critical: findings.filter((f) => f.severity === "critical"),
    high: findings.filter((f) => f.severity === "high"),
    medium: findings.filter((f) => f.severity === "medium"),
    low: findings.filter((f) => f.severity === "low"),
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Findings ({findings.length})
      </h2>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({findings.length})</TabsTrigger>
          {grouped.critical.length > 0 && (
            <TabsTrigger value="critical">
              🔴 Critical ({grouped.critical.length})
            </TabsTrigger>
          )}
          {grouped.high.length > 0 && (
            <TabsTrigger value="high">
              🟠 High ({grouped.high.length})
            </TabsTrigger>
          )}
          {grouped.medium.length > 0 && (
            <TabsTrigger value="medium">
              🟡 Medium ({grouped.medium.length})
            </TabsTrigger>
          )}
          {grouped.low.length > 0 && (
            <TabsTrigger value="low">
              🟢 Low ({grouped.low.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {findings.map((finding) => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4 mt-4">
          {grouped.critical.map((finding) => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </TabsContent>

        <TabsContent value="high" className="space-y-4 mt-4">
          {grouped.high.map((finding) => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </TabsContent>

        <TabsContent value="medium" className="space-y-4 mt-4">
          {grouped.medium.map((finding) => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </TabsContent>

        <TabsContent value="low" className="space-y-4 mt-4">
          {grouped.low.map((finding) => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
