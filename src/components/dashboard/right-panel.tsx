"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  Info,
  Pencil,
  Plus,
  Send,
  Wallet,
} from "lucide-react";
import { displayHandle, initialsFromUser } from "@/lib/auth-user";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const linkedAccounts = [
  { initials: "HS", color: "bg-sky-100 text-sky-700" },
  { initials: "AJ", color: "bg-emerald-100 text-emerald-700" },
  { initials: "RK", color: "bg-violet-100 text-violet-700" },
];

export function RightPanel() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.name?.trim() || "User";
  const handle = user ? displayHandle(user) : "@—";
  const email = user?.email ?? "";
  const initials = user ? initialsFromUser(user) : "—";

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="flex flex-col items-center px-4 pb-5 pt-6 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-[#6C63FF]/20 to-[#4aa3ff]/25 font-serif text-lg font-semibold text-[#5c52e8] ring-2 ring-white shadow-sm">
            {initials}
          </div>
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <p className="font-serif text-base font-semibold tracking-tight text-slate-900">
              {displayName}
            </p>
            <Link
              href="/dashboard/profile/personal-details"
              className="inline-flex rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[#6C63FF]"
              aria-label="Edit profile"
            >
              <Pencil className="size-3.5" strokeWidth={1.75} />
            </Link>
          </div>
          <p className="mt-0.5 font-serif text-sm italic text-slate-500">{handle}</p>
          {email ? (
            <p className="mt-1 max-w-full break-all text-xs text-slate-500" title={email}>
              {email}
            </p>
          ) : null}
          <p className="mt-2 font-sans text-xs font-medium tracking-wide text-sky-500">
            <span className="uppercase">User ID:</span>{" "}
            <span className="font-normal tabular-nums">
              {user?.publicUserId?.trim() || "—"}
            </span>
          </p>

          <div className="mt-6 w-full rounded-2xl bg-[#f5f5f5] p-4 text-left">
            <p className="flex items-center gap-1.5 text-xs leading-snug text-[#757575]">
              <span>Total Credit Limit: ₹1,000 - ₹50,000</span>
              <span
                className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-[#bdbdbd] text-[#9e9e9e]"
                title="Credit limit range for your account"
              >
                <Info className="size-2.5" strokeWidth={2.5} />
              </span>
            </p>
            <p className="mt-3 text-xs text-[#757575]">
              Available Credit Limit:{" "}
              <span className="text-lg font-semibold tracking-tight text-[#FF8A65]">
                ₹0.00
              </span>
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1 rounded-lg bg-[#4A76A8] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#3d6590]"
            >
              Get Cash
              <ChevronRight className="size-4 opacity-90" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-3 w-full rounded-2xl bg-[#f5f5f5] p-4 text-left">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[#757575]">Finwy Score</p>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                Good
              </span>
            </div>
            <div className="mt-3 flex items-end justify-between border-t border-slate-200/80 pt-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#9e9e9e]">
                  This month
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">₹12,400</p>
              </div>
              <div className="text-right">
                <p className="flex items-center justify-end gap-0.5 text-[10px] text-[#9e9e9e]">
                  Cashback
                  <Info className="size-3 text-[#bdbdbd]" strokeWidth={2} />
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#FF8A65]">₹240</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
