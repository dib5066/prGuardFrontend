"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { AuthUser } from "@/lib/types";

/**
 * Current session. `user` is undefined while loading, `null` if not
 * logged in, or the user object.
 */
export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<AuthUser | null>(
    "auth-me",
    async () => {
      try {
        return await api.me();
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );

  const router = useRouter();

  return {
    user: data ?? null,
    isLoading,
    isError: !!error,
    refresh: mutate,
    login() {
      window.location.href = "/api/auth/github/login";
    },
    async logout() {
      await api.logout();
      await mutate(null, { revalidate: false });
      router.push("/login");
    },
  };
}
