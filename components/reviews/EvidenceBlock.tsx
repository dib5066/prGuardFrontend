"use client";

interface EvidenceBlockProps {
  evidence: string;
  filePath: string;
}

export function EvidenceBlock({ evidence, filePath }: EvidenceBlockProps) {
  // Detect language from file extension
  const ext = filePath.split(".").pop() || "";
  const languageMap: Record<string, string> = {
    py: "python",
    js: "javascript",
    ts: "typescript",
    tsx: "typescript",
    jsx: "javascript",
    go: "go",
    java: "java",
    rb: "ruby",
    rs: "rust",
    c: "c",
    cpp: "cpp",
    h: "c",
  };

  return (
    <div className="rounded-md bg-muted p-3 overflow-x-auto">
      <div className="text-xs text-muted-foreground mb-2">
        📂 {filePath}
      </div>
      <pre className="text-sm font-mono whitespace-pre-wrap">
        <code>{evidence}</code>
      </pre>
    </div>
  );
}
