"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileCreditCard } from "@/components/dashboard/profile-credit-card";

export function RightPanelRest() {
  return (
    <div className="space-y-4">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold tabular-nums text-slate-900">₹0</p>
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
