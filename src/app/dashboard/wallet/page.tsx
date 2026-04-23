"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Copy, CreditCard, Info, Search, Wallet2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Screen = "wallet" | "gateway" | "history";
type StatusFilter = "ALL" | "APPROVED" | "PENDING" | "REJECTED";

const minAmount = 250;
const maxAmount = 4000;
const quickAmounts = [500, 1000, 1500, 2000];

const historyRows: Array<{ id: string; status: Exclude<StatusFilter, "ALL"> }> = [];

export default function WalletPage() {
  const [screen, setScreen] = useState<Screen>("wallet");
  const [amount, setAmount] = useState<number>(250);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return historyRows.filter((row) => {
      if (filter !== "ALL" && row.status !== filter) return false;
      if (!q) return true;
      return row.id.toLowerCase().includes(q);
    });
  }, [filter, query]);

  const pageRows = filteredRows.slice((page - 1) * 10, page * 10);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / 10));

  const screenTabs: Array<{ key: Screen; label: string }> = [
    { key: "wallet", label: "Wallet" },
    { key: "gateway", label: "Payment Gateway" },
    { key: "history", label: "Upload History" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-4">
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Wallet</h1>
          <p className="text-sm text-slate-600">Manage balance, add money, and track wallet uploads.</p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {screenTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setScreen(tab.key)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                screen === tab.key
                  ? "bg-[#6C63FF]/15 text-[#6C63FF]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {screen === "wallet" ? (
        <>
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 text-lg font-semibold leading-none text-slate-900">
                    <Wallet2 className="size-5 text-[#6C63FF]" />
                    Balance
                  </p>
                  <p className="mt-2 text-base text-slate-500">Main Wallet</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-left sm:text-right">
                  <p className="text-2xl font-semibold text-emerald-600">₹0.00</p>
                  <p className="mt-1 text-sm text-slate-500">Main Wallet: ₹0.00</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Add Money to Wallet</CardTitle>
              <CardDescription>Top up instantly and use it for scan and pay.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="rounded-lg bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800 ring-1 ring-sky-100">
                Use it for Scan &amp; Pay
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Enter Amount</p>
                <Input
                  value={`₹ ${amount}`}
                  inputMode="numeric"
                  onChange={(e) => {
                    const n = Number.parseInt(e.target.value.replace(/\D/g, ""), 10);
                    if (!Number.isNaN(n)) setAmount(Math.max(minAmount, Math.min(maxAmount, n)));
                  }}
                  className="h-12 text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {quickAmounts.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                    onClick={() => setAmount(Math.max(minAmount, Math.min(maxAmount, a)))}
                  >
                    + ₹{a}
                  </button>
                ))}
              </div>

              <div className="space-y-0.5 text-slate-600">
                <p className="inline-flex items-center gap-1 text-sm font-medium">
                  <Info className="size-4" /> Minimum Amount ₹{minAmount}
                </p>
                <p className="text-sm">You can add up to ₹{maxAmount}</p>
              </div>

              <Button
                className="h-11 w-full bg-[#6C63FF] text-sm font-semibold hover:bg-[#5a52e8]"
                onClick={() => setScreen("gateway")}
              >
                Add Money to Wallet
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Transaction History</h3>
                <button
                  type="button"
                  onClick={() => setScreen("history")}
                  className="rounded-full bg-[#6C63FF] px-3 py-1 text-xs font-medium text-white"
                >
                  See All
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 p-6 text-center text-base text-slate-500">
                No recent transactions
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      {screen === "gateway" ? (
        <>
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setScreen("wallet")}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>
                <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600">
                  <Info className="size-4" />
                  Help
                </button>
              </div>
              <CardTitle className="inline-flex items-center gap-2 text-xl">
                <CreditCard className="size-5 text-[#6C63FF]" />
                Payment Gateway
              </CardTitle>
              <CardDescription>Scan this QR with any UPI app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-4">
              <div className="space-y-2 text-center">
                <div className="mx-auto grid size-10 place-items-center rounded-md border border-slate-200 bg-white">
                  <span className="text-sm font-semibold text-[#6C63FF]">A</span>
                </div>
                <p className="text-2xl font-semibold text-slate-900">Axis Bank - 3121</p>
              </div>

              <div className="mx-auto flex w-fit items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-slate-300" />
                <span className="h-1.5 w-5 rounded-full bg-slate-900" />
                <span className="size-1.5 rounded-full bg-slate-300" />
              </div>

              <div className="mx-auto w-full max-w-[320px]">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=640x640&data=finwy-wallet"
                  alt="Payment QR"
                  width={320}
                  height={320}
                  className="h-auto w-full rounded-md border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-center">
                <p className="text-xl font-medium text-slate-500">UPI ID: vs1190@ybl</p>
                <button type="button" className="text-slate-500 hover:text-slate-700" aria-label="Copy UPI ID">
                  <Copy className="size-4" />
                </button>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm text-slate-500">
                Amount: ₹{amount}
              </div>

              <Button className="h-11 w-full bg-[#6C63FF] text-sm font-semibold hover:bg-[#5a52e8]">
                Upload Screenshot
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setScreen("history")}>
              View Upload History
            </Button>
          </div>
        </>
      ) : null}

      {screen === "history" ? (
        <>
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <button
                type="button"
                onClick={() => setScreen("wallet")}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>
              <CardTitle className="text-xl">Upload History</CardTitle>
              <CardDescription>Search and filter wallet screenshot uploads.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by Transaction ID"
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
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      filter === s
                        ? "bg-[#6C63FF] text-white"
                        : "bg-slate-100 text-slate-700",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="min-h-[260px] rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                {pageRows.length === 0 ? "No upload history found." : "Loaded"}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <p className="text-base font-semibold text-slate-800">
              Page {page} / {totalPages}
            </p>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(Math.max(1, totalPages), p + 1))}
            >
              Next
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
