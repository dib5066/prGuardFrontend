"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function InstallAppCard() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function install() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await api.getInstallUrl();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start install.");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-8 text-center space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Connect your repositories</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Install the PRGuard GitHub App and pick the repositories you want
          reviewed. Every pull request on them is then reviewed automatically
          and shows up here.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={install} disabled={busy}>
        {busy ? "Redirecting…" : "Install the PRGuard GitHub App"}
      </Button>
    </div>
  );
}
