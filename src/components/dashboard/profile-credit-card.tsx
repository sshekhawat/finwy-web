"use client";

import Link from "next/link";
import { ChevronRight, Info, Pencil } from "lucide-react";
import { displayHandle, initialsFromUser } from "@/lib/auth-user";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";

export function ProfileCreditCard() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.name?.trim() || "User";
  const handle = user ? displayHandle(user) : "@—";
  const email = user?.email ?? "";
  const initials = user ? initialsFromUser(user) : "—";

  return (
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
  );
}
