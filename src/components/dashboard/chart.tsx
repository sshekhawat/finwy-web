"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const monthlyData = [
  { month: "Jan", value: 2600 },
  { month: "Feb", value: 3200 },
  { month: "Mar", value: 2900 },
  { month: "Apr", value: 3600 },
  { month: "May", value: 3400 },
  { month: "Jun", value: 3900 },
  { month: "Jul", value: 4200 },
  { month: "Aug", value: 4700 },
];

export function DashboardChart() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={30} />
              <Tooltip
                cursor={{ fill: "rgba(108,99,255,0.08)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
                }}
              />
              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
                fill="#c7d2fe"
              >
                {monthlyData.map((entry) => (
                  <Cell
                    key={entry.month}
                    fill={entry.month === "Aug" ? "#6C63FF" : "#c7d2fe"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
