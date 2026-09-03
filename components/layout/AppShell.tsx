"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";

const BARE_ROUTES = ["/login", "/register"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const redirected = useRef(false);

  const isBare = BARE_ROUTES.includes(pathname);

  // Not signed in on a protected route → go to /login, exactly once.
  useEffect(() => {
    if (isBare) {
      redirected.current = false;
      return;
    }
    if (!isLoading && user === null && !redirected.current) {
      redirected.current = true;
      router.replace("/login");
    }
  }, [isBare, isLoading, user, router]);

  if (isBare) return <>{children}</>;

  if (isLoading || user === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        {user === null ? "Redirecting to sign in…" : "Loading…"}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
