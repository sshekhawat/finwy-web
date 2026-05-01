"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Copy, CreditCard, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiFetch, isApiConfigured } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

const minAmount = 250;
const maxAmount = 4000;
const quickAmounts = [500, 1000, 1500, 2000];

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

export default function AddWalletPage() {
  const user = useAuthStore((s) => s.user);
  const fileRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState<number>(250);
  const [amountInput, setAmountInput] = useState("250");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<"form" | "gateway">("form");

  const upiId = useMemo(() => {
    const u = user?.username?.trim();
    if (u) return `${u}@ybl`;
    const local = user?.email?.split("@")[0]?.trim();
    if (local) return `${local}@ybl`;
    return "finwy@ybl";
  }, [user?.username, user?.email]);

  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(upiId);
      toast.success("UPI ID copied");
    } catch {
      toast.error("Could not copy UPI ID");
    }
  }

  async function submitPayment() {
    if (!isApiConfigured()) {
      toast.error("API is not configured.");
      return;
    }
    if (!paymentFile) {
      toast.error("Please select a payment screenshot before submitting.");
      return;
    }
    if (amount < minAmount || amount > maxAmount) {
      toast.error(`Amount must be between ₹${minAmount} and ₹${maxAmount}`);
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("screenshot", paymentFile);
      const upRes = await apiFetch("/profile/wallet/upload-screenshot", { method: "POST", body: fd });
      const upJson = await upRes.json().catch(() => ({}));
      const upData = parseApiData<{ screenshotUrl: string }>(upRes, upJson);
      const screenshotUrl = upData.screenshotUrl;
      if (!screenshotUrl?.trim()) throw new Error("Upload did not return a screenshot URL.");

      const res = await apiFetch("/profile/wallet/add-money", {
        method: "POST",
        body: JSON.stringify({ amount, upiId, screenshotUrl, note: "Wallet top-up" }),
      });
      const json = await res.json().catch(() => ({}));
      const out = parseApiData<{ message?: string }>(res, json);
      toast.success(out.message ?? "Top-up submitted for admin review.");
      window.location.href = "/dashboard/wallet";
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment could not be recorded");
    } finally {
      setSubmitting(false);
    }
  }

  const qrData = encodeURIComponent(`upi://pay?pa=${upiId}&am=${amount}&cu=INR`);
  const canSubmit = isApiConfigured() && Boolean(paymentFile) && amount >= minAmount && amount <= maxAmount && !submitting;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => setPaymentFile(e.target.files?.[0] ?? null)}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Add Wallet</h1>
          <p className="text-sm text-slate-600">Complete all steps to submit wallet top-up for approval.</p>
        </div>
        <Link href="/dashboard/wallet">
          <Button variant="outline">Back to Wallet</Button>
        </Link>
      </div>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-5 p-4">

          {tab === "form" ? (
            <>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Add Money to Wallet</h2>
                <p className="text-sm text-slate-600">Top up instantly and use it for scan and pay.</p>
              </div>
              <div className="rounded-lg bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800 ring-1 ring-sky-100">Use it for Scan &amp; Pay</div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Enter Amount</p>
                <Input
                  value={amountInput}
                  inputMode="numeric"
                  placeholder="Enter amount"
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setAmountInput(digits);
                    if (!digits) return setAmount(0);
                    const n = Number.parseInt(digits, 10);
                    if (!Number.isNaN(n)) setAmount(n);
                  }}
                  onBlur={() => {
                    if (!amountInput) return;
                    const n = Number.parseInt(amountInput, 10);
                    if (Number.isNaN(n)) return;
                    const bounded = Math.max(minAmount, Math.min(maxAmount, n));
                    setAmount(bounded);
                    setAmountInput(String(bounded));
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
                    onClick={() => {
                      const bounded = Math.max(minAmount, Math.min(maxAmount, a));
                      setAmount(bounded);
                      setAmountInput(String(bounded));
                    }}
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

              <Button className="h-11 w-full bg-[#6C63FF] text-sm font-semibold hover:bg-[#5a52e8]" onClick={() => setTab("gateway")}>
                Add Money to Wallet
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setTab("form")}
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

              <div>
                <CardTitle className="inline-flex items-center gap-2 text-xl">
                  <CreditCard className="size-5 text-[#6C63FF]" />
                  Payment Gateway
                </CardTitle>
                <CardDescription>Scan this QR with any UPI app.</CardDescription>
              </div>

              <div className="space-y-2 text-center">
                <div className="mx-auto grid size-10 place-items-center rounded-md border border-slate-200 bg-white">
                  <span className="text-sm font-semibold text-[#6C63FF]">A</span>
                </div>
                <p className="text-2xl font-semibold text-slate-900">Axis Bank - 3121</p>
              </div>

              <div className="mx-auto w-full max-w-[320px]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=640x640&data=${qrData}`}
                  alt="Payment QR"
                  width={320}
                  height={320}
                  className="h-auto w-full rounded-md border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-center">
                <p className="text-xl font-medium text-slate-500">UPI ID: {upiId}</p>
                <button type="button" className="text-slate-500 hover:text-slate-700" aria-label="Copy UPI ID" onClick={() => void copyUpi()}>
                  <Copy className="size-4" />
                </button>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm text-slate-500">
                Amount: {formatInr(amount)}
              </div>

              <div className="space-y-2">
                <Button type="button" variant="outline" className="h-11 w-full" onClick={() => fileRef.current?.click()}>
                  {paymentFile ? `Selected: ${paymentFile.name}` : "Select payment screenshot"}
                </Button>
                {!paymentFile ? (
                  <p className="text-center text-xs text-amber-800">
                    Payment screenshot is required. After you pay via UPI, attach the proof image, then submit for review.
                  </p>
                ) : null}
                <Button className="h-11 w-full bg-[#6C63FF] text-sm font-semibold hover:bg-[#5a52e8]" disabled={!canSubmit} onClick={() => void submitPayment()}>
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Submitting...
                    </span>
                  ) : (
                    "Submit for admin approval"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
