"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 text-center space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">PRGuard</h1>
          <p className="text-sm text-muted-foreground">
            AI code review for your pull requests
          </p>
        </div>
        <Button
          className="w-full"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            window.location.href = "/api/auth/github/login";
          }}
        >
          {busy ? "Redirecting…" : "Continue with GitHub"}
        </Button>
        <p className="text-xs text-muted-foreground">
          You&apos;ll then install the PRGuard GitHub App on the repositories
          you want reviewed.
        </p>
      </div>
    </div>
  );
}
