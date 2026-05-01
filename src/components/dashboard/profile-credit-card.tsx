"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Gift, Info, Pencil } from "lucide-react";
import { apiFetch, getStoredAccessToken } from "@/lib/api-client";
import {
  displayHandle,
  initialsFromUser,
} from "@/lib/auth-user";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { ReferralShareDialog } from "@/components/dashboard/referral-share-dialog";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

type CreditState = {
  min: number;
  max: number;
  available: number;
  loading: boolean;
};

function parseCreditSummary(json: unknown): Pick<CreditState, "min" | "max" | "available"> {
  if (!json || typeof json !== "object") {
    return { min: 1000, max: 50000, available: 0 };
  }
  const d = json as Record<string, unknown>;
  const min = Number(d.totalCreditLimitMin ?? d.creditLimitMin ?? 1000);
  const max = Number(d.totalCreditLimitMax ?? d.creditLimitMax ?? 50000);
  const rawAvail = d.availableCreditLimit ?? d.availableCredit ?? 0;
  const available =
    typeof rawAvail === "string" ? Number.parseFloat(rawAvail) : Number(rawAvail);
  return {
    min: Number.isFinite(min) ? min : 1000,
    max: Number.isFinite(max) ? max : 50000,
    available: Number.isFinite(available) ? available : 0,
  };
}

export function ProfileCreditCard() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.name?.trim() || "User";
  const handle = user ? displayHandle(user) : "@—";
  const email = user?.email ?? "";
  const initials = user ? initialsFromUser(user) : "—";

  const [credit, setCredit] = useState<CreditState>({
    min: 1000,
    max: 50000,
    available: 0,
    loading: true,
  });
  const [referralOpen, setReferralOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = getStoredAccessToken();
    if (!token) {
      setCredit((c) => ({ ...c, loading: false }));
      return;
    }

    (async () => {
      try {
        const res = await apiFetch("/dashboard/summary");
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error("summary failed");
        const parsed = parseCreditSummary(json);
        if (!cancelled) {
          setCredit({ ...parsed, loading: false });
        }
      } catch {
        if (!cancelled) {
          setCredit((c) => ({
            ...c,
            min: 1000,
            max: 50000,
            available: 0,
            loading: false,
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const limitLabel = useMemo(
    () => `₹${credit.min.toLocaleString("en-IN")} - ₹${credit.max.toLocaleString("en-IN")}`,
    [credit.min, credit.max],
  );

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
            <span>
              Total Credit Limit: {credit.loading ? "…" : limitLabel}
            </span>
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
              {credit.loading ? "…" : inr.format(credit.available)}
            </span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#4A76A8] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#3d6590] min-w-[7rem]"
            >
              Get Cash
              <ChevronRight className="size-4 opacity-90" strokeWidth={2} />
            </button>
            {user?.publicUserId?.trim() ? (
              <button
                type="button"
                onClick={() => setReferralOpen(true)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-teal-600 bg-white px-3 py-2 text-sm font-semibold text-teal-800 shadow-sm transition hover:bg-teal-50 min-w-[7rem]"
              >
                <Gift className="size-4 shrink-0" strokeWidth={2} />
                Referral
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-3 w-full rounded-2xl bg-[#f5f5f5] p-4 text-left">
          <p className="text-xs font-medium text-[#757575]">Finwy Score</p>
          <div className="mt-3 flex items-end justify-between border-t border-slate-200/80 pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9e9e9e]">This month</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">₹0</p>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-0.5 text-[10px] text-[#9e9e9e]">
                Cashback
                <Info className="size-3 text-[#bdbdbd]" strokeWidth={2} />
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-[#FF8A65]">₹0</p>
            </div>
          </div>
        </div>
      </CardContent>
      <ReferralShareDialog open={referralOpen} onOpenChange={setReferralOpen} />
    </Card>
  );
}
