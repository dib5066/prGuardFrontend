"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">PRGuard</h1>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            {user.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt=""
                className="h-7 w-7 rounded-full"
              />
            )}
            <span className="text-muted-foreground">
              {user.github_username ?? user.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Sign out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
