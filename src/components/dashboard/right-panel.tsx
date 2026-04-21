"use client";

import { ArrowUpRight, Plus, Send, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileCreditCard } from "@/components/dashboard/profile-credit-card";

const linkedAccounts = [
  { initials: "HS", color: "bg-sky-100 text-sky-700" },
  { initials: "AJ", color: "bg-emerald-100 text-emerald-700" },
  { initials: "RK", color: "bg-violet-100 text-violet-700" },
];

export function RightPanelRest() {
  return (
    <div className="space-y-4">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-slate-900">$25,360</p>
          <p className="mt-1 inline-flex items-center text-xs font-medium text-emerald-600">
            <ArrowUpRight className="mr-1 size-3" />
            +16%
          </p>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {[
            { label: "Send", icon: Send },
            { label: "Receive", icon: Wallet },
            { label: "Top-up", icon: Plus },
            { label: "Link account", icon: Plus },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <Icon className="size-3.5" />
                {action.label}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Linked Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {linkedAccounts.map((acc, index) => (
              <div
                key={acc.initials}
                className={`-ml-2 grid size-9 place-items-center rounded-full border-2 border-white text-xs font-semibold ${acc.color} ${index === 0 ? "ml-0" : ""}`}
              >
                {acc.initials}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-[#6C63FF] to-[#4f46e5] text-white shadow-lg">
        <CardContent className="p-4">
          <p className="text-sm text-white/85">Upgrade your account</p>
          <p className="mt-1 text-lg font-semibold">Go Pro</p>
          <button className="mt-3 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30">
            Go Pro
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

/** Full sidebar column: profile + wallet and below (desktop). */
export function RightPanel() {
  return (
    <div className="space-y-4">
      <ProfileCreditCard />
      <RightPanelRest />
    </div>
  );
}
