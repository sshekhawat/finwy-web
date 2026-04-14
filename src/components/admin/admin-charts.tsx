"use client";

import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Chart = dynamic(
  () => import("./volume-chart-inner").then((m) => m.VolumeChartInner),
  { ssr: false, loading: () => <p className="text-sm text-muted-foreground">Loading chart…</p> },
);

export type VolumePoint = { day: string; total: string; count: number };

export function AdminCharts({
  dailyVolume,
  statusBreakdown,
}: {
  dailyVolume: VolumePoint[];
  statusBreakdown: { status: string; count: number }[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>30-day volume</CardTitle>
          <CardDescription>Successful transaction amounts by day.</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <Chart data={dailyVolume} type="area" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Status mix</CardTitle>
          <CardDescription>Counts by transaction status (30d).</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <Chart data={statusBreakdown} type="bar" />
        </CardContent>
      </Card>
    </div>
  );
}
