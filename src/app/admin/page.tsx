"use client";

import { useEffect, useState } from "react";
import { apiFetch, isApiConfigured } from "@/lib/api-client";
import { AdminCharts } from "@/components/admin/admin-charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AnalyticsPayload = {
  userCount: number;
  volume30d: string;
  statusBreakdown: { status: string; count: number }[];
  dailyVolume: { day: string; total: string; count: number }[];
};

export default function AdminHomePage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiConfigured()) {
      setError("Set NEXT_PUBLIC_API_URL to load admin analytics.");
      return;
    }
    (async () => {
      try {
        const res = await apiFetch("/admin/analytics");
        const json = (await res.json().catch(() => ({}))) as AnalyticsPayload & {
          error?: string;
        };
        if (!res.ok) throw new Error(json.error ?? "Failed to load analytics");
        setData({
          userCount: json.userCount ?? 0,
          volume30d: json.volume30d ?? "0",
          statusBreakdown: json.statusBreakdown ?? [],
          dailyVolume: json.dailyVolume ?? [],
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Admin analytics</h1>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin analytics</h1>
        <p className="text-sm text-muted-foreground">
          From <code className="rounded bg-muted px-1">GET /admin/analytics</code>
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Users</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{data.userCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>30d successful volume</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{data.volume30d}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <AdminCharts
        dailyVolume={data.dailyVolume}
        statusBreakdown={data.statusBreakdown}
      />
      <Card>
        <CardHeader>
          <CardTitle>Audit & compliance</CardTitle>
          <CardDescription>
            Implement audit logging in your API; this UI only displays aggregates.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Secure admin routes on the server; this dashboard sends the bearer token from login.
        </CardContent>
      </Card>
    </div>
  );
}
