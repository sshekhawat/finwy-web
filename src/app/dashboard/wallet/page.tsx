"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiFetch, isApiConfigured } from "@/lib/api-client";
import { getApiBaseUrl } from "@/lib/config";

type StatusFilter = "ALL" | "APPROVED" | "PENDING" | "REJECTED";

const HISTORY_PAGE_SIZE = 10;
const RECENT_LIMIT = 5;

type WalletSummary = {
  pinWallet: string;
};

type WalletTx = {
  uuid: string;
  amount: string;
  screenshotUrl: string | null;
  status: number;
  createdDate: string;
};

type ApiSuccess<T> = { success: true; data: T };
type ApiErr = { success?: boolean; error?: { message?: string } };

function parseApiData<T>(res: Response, json: unknown): T {
  if (!res.ok) {
    const err = json as ApiErr;
    throw new Error(err.error?.message ?? `Request failed (${res.status})`);
  }
  const body = json as ApiSuccess<T> | T;
  if (body && typeof body === "object" && "success" in body && (body as ApiSuccess<T>).success === true) {
    return (body as ApiSuccess<T>).data;
  }
  return body as T;
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatInr(value: string | number): string {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  if (!Number.isFinite(n)) return inr.format(0);
  return inr.format(n);
}

function txStatusLabel(status: number): Exclude<StatusFilter, "ALL"> {
  if (status === 2) return "APPROVED";
  if (status === 3) return "REJECTED";
  return "PENDING";
}

function backendAssetUrl(relative: string | null | undefined): string | null {
  if (!relative) return null;
  if (relative.startsWith("http")) return relative;
  const base = getApiBaseUrl();
  if (base.startsWith("http")) {
    try {
      const u = new URL(base);
      return `${u.protocol}//${u.host}${relative}`;
    } catch {
      return relative;
    }
  }
  return relative;
}

export default function WalletPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [recentTx, setRecentTx] = useState<WalletTx[]>([]);
  const [historyItems, setHistoryItems] = useState<WalletTx[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadSummary = useCallback(async () => {
    if (!isApiConfigured()) {
      setSummary(null);
      return;
    }
    setLoadingSummary(true);
    try {
      const res = await apiFetch("/profile/wallet/summary");
      const json = await res.json().catch(() => ({}));
      setSummary(parseApiData<WalletSummary>(res, json));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load wallet summary");
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const loadRecent = useCallback(async () => {
    if (!isApiConfigured()) {
      setRecentTx([]);
      return;
    }
    setLoadingRecent(true);
    try {
      const qs = new URLSearchParams({ page: "1", limit: String(RECENT_LIMIT), status: "ALL" });
      const res = await apiFetch(`/profile/wallet/transactions?${qs.toString()}`);
      const json = await res.json().catch(() => ({}));
      const data = parseApiData<{ items: WalletTx[] }>(res, json);
      setRecentTx(data.items ?? []);
    } catch {
      setRecentTx([]);
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    if (!isApiConfigured()) {
      setHistoryItems([]);
      setHistoryTotal(0);
      return;
    }
    setLoadingHistory(true);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(HISTORY_PAGE_SIZE),
        status: filter,
      });
      const q = debouncedQuery.trim();
      if (q) qs.set("search", q);
      const res = await apiFetch(`/profile/wallet/transactions?${qs.toString()}`);
      const json = await res.json().catch(() => ({}));
      const data = parseApiData<{ items: WalletTx[]; total: number }>(res, json);
      setHistoryItems(data.items ?? []);
      setHistoryTotal(data.total ?? 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load history");
      setHistoryItems([]);
      setHistoryTotal(0);
    } finally {
      setLoadingHistory(false);
    }
  }, [page, filter, debouncedQuery]);

  const apiWarnedRef = useRef(false);
  useEffect(() => {
    if (!isApiConfigured()) {
      if (!apiWarnedRef.current) {
        apiWarnedRef.current = true;
        toast.error("Set NEXT_PUBLIC_API_URL in .env.local to use wallet APIs.");
      }
      return;
    }
    void loadSummary();
    void loadRecent();
  }, [loadSummary, loadRecent]);

  useEffect(() => {
    if (!showHistory) return;
    const t = window.setTimeout(() => setDebouncedQuery(query), 400);
    return () => window.clearTimeout(t);
  }, [query, showHistory]);

  useEffect(() => {
    if (!showHistory) return;
    void loadHistory();
  }, [showHistory, loadHistory]);

  const totalPages = Math.max(1, Math.ceil(historyTotal / HISTORY_PAGE_SIZE));
  const creditsDebits = useMemo(() => {
    let credits = 0;
    for (const t of recentTx) {
      const a = Number.parseFloat(t.amount);
      if (t.status === 2 && Number.isFinite(a) && a > 0) credits += a;
    }
    return { credits, debits: 0 };
  }, [recentTx]);

  const pinDisplay = summary ? formatInr(summary.pinWallet) : isApiConfigured() ? "..." : formatInr(0);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Wallet</h1>
          </div>
          <Link href="/dashboard/wallet/add">
            <Button className="h-10 bg-[#6C63FF] px-4 text-sm font-semibold text-white hover:bg-[#5a52e8]">Add Wallet</Button>
          </Link>
        </div>
      </div>

      {!showHistory ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Available balance</p>
                <p className="mt-1 text-xl font-semibold text-emerald-700">
                  {loadingSummary ? (
                    <span className="inline-flex items-center gap-2 text-slate-500">
                      <Loader2 className="size-5 animate-spin" /> Loading...
                    </span>
                  ) : (
                    pinDisplay
                  )}
                </p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total credits</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{formatInr(creditsDebits.credits)}</p>
                <p className="mt-1 text-xs text-slate-500">Approved top-ups only (last {RECENT_LIMIT})</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total debits</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{formatInr(creditsDebits.debits)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Wallet activity</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowHistory(true);
                    setPage(1);
                  }}
                  className="rounded-full bg-[#6C63FF] px-3 py-1 text-xs font-medium text-white"
                >
                  See all
                </button>
              </div>
              {loadingRecent ? (
                <div className="flex justify-center py-8 text-slate-500">
                  <Loader2 className="size-8 animate-spin" />
                </div>
              ) : recentTx.length === 0 ? (
                <div className="rounded-xl border border-slate-200 p-6 text-center text-base text-slate-500">No recent transactions</div>
              ) : (
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {recentTx.map((row) => (
                    <li key={row.uuid} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-slate-900">+ {formatInr(row.amount)}</p>
                        <p className="text-xs text-slate-500">{new Date(row.createdDate).toLocaleString()}</p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          txStatusLabel(row.status) === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : txStatusLabel(row.status) === "REJECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-900",
                        )}
                      >
                        {txStatusLabel(row.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-3 p-4">
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Back
              </button>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by reference, UPI, or note"
                  className="h-11 pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(["ALL", "APPROVED", "PENDING", "REJECTED"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setFilter(s);
                      setPage(1);
                    }}
                    className={cn("rounded-full px-3 py-1 text-xs font-semibold", filter === s ? "bg-[#6C63FF] text-white" : "bg-slate-100 text-slate-700")}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="min-h-[260px] rounded-md border border-dashed border-slate-200 p-0 text-sm text-slate-500">
                {loadingHistory ? (
                  <div className="flex h-[260px] items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-slate-400" />
                  </div>
                ) : historyItems.length === 0 ? (
                  <div className="flex h-[260px] items-center justify-center p-4 text-center">No history found.</div>
                ) : (
                  <>
                    <div className="divide-y divide-slate-100 md:hidden">
                      {historyItems.map((row, i) => {
                        const img = backendAssetUrl(row.screenshotUrl);
                        return (
                          <div key={row.uuid} className="space-y-2 px-3 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs font-medium text-slate-500">#{(page - 1) * HISTORY_PAGE_SIZE + i + 1}</p>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                                  txStatusLabel(row.status) === "APPROVED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : txStatusLabel(row.status) === "REJECTED"
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-amber-100 text-amber-900",
                                )}
                              >
                                {txStatusLabel(row.status)}
                              </span>
                            </div>
                            <p className="truncate font-mono text-xs text-slate-600">{row.uuid}</p>
                            <p className="text-sm font-semibold text-slate-900">{formatInr(row.amount)}</p>
                            <p className="text-xs text-slate-500">{new Date(row.createdDate).toLocaleString()}</p>
                            {img ? (
                              <a href={img} target="_blank" rel="noreferrer" className="text-xs font-medium text-[#6C63FF] hover:underline">
                                View Screenshot
                              </a>
                            ) : (
                              <p className="text-xs text-slate-400">No screenshot</p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                          <tr>
                            <th className="px-3 py-2">#</th>
                            <th className="px-3 py-2">Reference</th>
                            <th className="px-3 py-2">Amount</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Screenshot</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {historyItems.map((row, i) => {
                            const img = backendAssetUrl(row.screenshotUrl);
                            return (
                              <tr key={row.uuid} className="text-slate-800">
                                <td className="px-3 py-2">{(page - 1) * HISTORY_PAGE_SIZE + i + 1}</td>
                                <td className="max-w-[140px] truncate px-3 py-2 font-mono text-xs">{row.uuid}</td>
                                <td className="px-3 py-2 font-medium">{formatInr(row.amount)}</td>
                                <td className="px-3 py-2">
                                  <span
                                    className={cn(
                                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                                      txStatusLabel(row.status) === "APPROVED"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : txStatusLabel(row.status) === "REJECTED"
                                          ? "bg-rose-100 text-rose-800"
                                          : "bg-amber-100 text-amber-900",
                                    )}
                                  >
                                    {txStatusLabel(row.status)}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600">{new Date(row.createdDate).toLocaleString()}</td>
                                <td className="px-3 py-2">
                                  {img ? (
                                    <a href={img} target="_blank" rel="noreferrer" className="text-[#6C63FF] hover:underline">
                                      View
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </Button>
            <p className="text-base font-semibold text-slate-800">
              Page {page} / {totalPages}
            </p>
            <Button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
