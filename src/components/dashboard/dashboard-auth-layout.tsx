"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getStoredAccessToken, isApiConfigured } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

/**
 * Dashboard gate for both API mode and static/demo mode.
 */
export function DashboardAuthLayout({
  children,
  requireAdmin,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isApiConfigured()) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const res = await apiFetch("/auth/me");
        const json = (await res.json().catch(() => ({}))) as {
          error?: string;
          id?: string;
          email?: string;
          name?: string | null;
          role?: string;
        };
        if (!res.ok) throw new Error(json.error ?? "Unauthorized");
        if (json.id && json.email && json.role) {
          setUser({
            id: json.id,
            email: json.email,
            name: json.name ?? null,
            role: json.role,
          });
        }
        if (requireAdmin && json.role !== "ADMIN") {
          window.location.href = "/dashboard";
          return;
        }
      } catch {
        // Static/demo fallback: allow if a local token is present.
        if (getStoredAccessToken()) {
          if (!cancelled) setReady(true);
          return;
        }
        router.replace("/login?next=/dashboard");
        return;
      }

      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [router, setUser, requireAdmin]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <DashboardShell isAdmin={user?.role === "ADMIN"}>{children}</DashboardShell>
  );
}
