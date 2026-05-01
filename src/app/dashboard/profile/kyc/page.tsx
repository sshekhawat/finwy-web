"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { FileImage, Upload } from "lucide-react";
import { apiFetch, isApiConfigured } from "@/lib/api-client";
import { readApiError } from "@/lib/auth-http";
import { kycSubmitFormSchema } from "@/lib/validators/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type KycSubmitForm = z.infer<typeof kycSubmitFormSchema>;

type KycState = {
  pancard: string | null;
  aadhaar: string | null;
  aadhaarFrontUrl: string | null;
  aadhaarBackUrl: string | null;
  aadhaarScreenshotUrl: string | null;
  panDocUrl: string | null;
  panScreenshotUrl: string | null;
  kycStatus: number;
  kycStatusLabel: string;
  isKycVerified: boolean;
  isKycPending?: boolean;
  needsKycAction?: boolean;
};

type KycResponse = {
  success?: boolean;
  data?: KycState;
  error?: { message?: string };
};

function unwrapKyc(json: unknown): KycState | null {
  if (!json || typeof json !== "object") return null;
  const root = json as KycResponse;
  const d = root.success ? root.data : (json as KycState);
  if (!d || typeof d !== "object") return null;
  if ("kycStatusLabel" in d || "aadhaar" in d) return d as KycState;
  return null;
}

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

function FileRow({
  id,
  label,
  hint,
  file,
  onChange,
  existingUrl,
  disabled,
}: {
  id: string;
  label: string;
  hint?: string;
  file: File | null;
  onChange: (f: File | null) => void;
  existingUrl: string | null;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex flex-col gap-0.5">
        <span>{label}</span>
        {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
      </Label>
      <div className="flex flex-wrap items-center gap-3">
        <label
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/80 px-3 py-2 text-sm transition hover:border-[#6C63FF]/50 hover:bg-[#6C63FF]/5",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <Upload className="size-4 text-[#6C63FF]" />
          <span>{file ? file.name : "Choose image"}</span>
          <input
            id={id}
            type="file"
            accept={ACCEPT_IMAGES}
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              onChange(f);
              e.target.value = "";
            }}
          />
        </label>
        {existingUrl ? (
          <Link
            href={existingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#6C63FF] underline-offset-2 hover:underline"
          >
            <FileImage className="size-3.5" />
            View uploaded
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function KycPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kyc, setKyc] = useState<KycState | null>(null);

  const [aadhaarFront, setAadhaarFront] = useState<File | null>(null);
  const [aadhaarBack, setAadhaarBack] = useState<File | null>(null);
  const [panDoc, setPanDoc] = useState<File | null>(null);
  const [panScreenshot, setPanScreenshot] = useState<File | null>(null);
  const form = useForm<KycSubmitForm>({
    resolver: zodResolver(kycSubmitFormSchema),
    defaultValues: { pancard: "", aadhaar: "" },
  });

  const load = useCallback(async () => {
    if (!isApiConfigured()) {
      toast.error("Set NEXT_PUBLIC_API_URL in .env.local.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/profile/kyc");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(readApiError(json, "Failed to load KYC"));
      }
      const data = unwrapKyc(json);
      if (data) {
        setKyc(data);
        form.reset({
          pancard: data.pancard ?? "",
          aadhaar: data.aadhaar ?? "",
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load KYC");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    void load();
  }, [load]);

  const approved = kyc?.isKycVerified === true;
  const pending = kyc?.kycStatusLabel === "PENDING_REVIEW" || kyc?.isKycPending === true;
  const canSubmit = !approved && !pending;

  async function onSubmit(values: KycSubmitForm) {
    if (!isApiConfigured()) return;
    if (!canSubmit) {
      toast.message("KYC is locked while under review or after approval.");
      return;
    }
    if (!aadhaarFront || !aadhaarBack) {
      toast.error("Please upload Aadhaar front and back images.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("pancard", values.pancard ?? "");
      fd.set("aadhaar", values.aadhaar);
      fd.set("aadhaarFront", aadhaarFront);
      fd.set("aadhaarBack", aadhaarBack);
      if (panDoc) fd.set("panDoc", panDoc);
      if (panScreenshot) fd.set("panScreenshot", panScreenshot);

      const res = await apiFetch("/profile/kyc/submit", {
        method: "POST",
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(readApiError(json, "Submission failed"));
      }
      const data = unwrapKyc(json);
      if (data) {
        setKyc(data);
        form.reset({
          pancard: data.pancard ?? "",
          aadhaar: data.aadhaar ?? "",
        });
      }
      setAadhaarFront(null);
      setAadhaarBack(null);
      setPanDoc(null);
      setPanScreenshot(null);
      toast.success("KYC submitted for admin verification.");
      try {
        sessionStorage.removeItem("finwy_kyc_banner_dismissed");
      } catch {
        /* ignore */
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">KYC</h1>
        <p className="text-sm text-muted-foreground">
          Complete your identity verification to unlock higher limits. Admin will review and approve your documents.
        </p>
      </div>

      {kyc ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            approved && "border-emerald-200 bg-emerald-50 text-emerald-900",
            pending && "border-amber-200 bg-amber-50 text-amber-950",
            !approved && !pending && "border-slate-200 bg-slate-50 text-slate-800",
          )}
        >
          <p className="font-medium">
            Status:{" "}
            {kyc.kycStatusLabel === "NOT_SUBMITTED" && "Not submitted"}
            {kyc.kycStatusLabel === "PENDING_REVIEW" && "Pending verification (admin review)"}
            {kyc.kycStatusLabel === "APPROVED" && "Approved"}
            {kyc.kycStatusLabel === "REJECTED" && "Rejected — please resubmit"}
          </p>
          {pending ? (
            <p className="mt-1 text-amber-900/90">Your uploads are awaiting admin approval. Editing is disabled until a decision is made.</p>
          ) : null}
          {approved ? (
            <p className="mt-1 text-emerald-900/90">Your KYC is verified. Document links below are for your records.</p>
          ) : null}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>KYC verification</CardTitle>
          <CardDescription>
            आधार (Aadhaar) — number plus clear photos of the front and back of the card.
            PAN card and PAN screenshot are optional.
            JPEG / PNG / WebP, max 5 MB each.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">आधार / Aadhaar</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="aadhaar">Aadhaar number (12 digits)</Label>
                  <Input
                    id="aadhaar"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="•••• •••• ••••"
                    disabled={!canSubmit || loading}
                    {...form.register("aadhaar")}
                  />
                  {form.formState.errors.aadhaar ? (
                    <p className="text-xs text-destructive">{form.formState.errors.aadhaar.message}</p>
                  ) : null}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FileRow
                  id="af"
                  label="Aadhaar — front (card photo)"
                  hint="Clear photo of the front side"
                  file={aadhaarFront}
                  onChange={setAadhaarFront}
                  existingUrl={kyc?.aadhaarFrontUrl ?? null}
                  disabled={!canSubmit || loading}
                />
                <FileRow
                  id="ab"
                  label="Aadhaar — back (card photo)"
                  hint="Clear photo of the back side"
                  file={aadhaarBack}
                  onChange={setAadhaarBack}
                  existingUrl={kyc?.aadhaarBackUrl ?? null}
                  disabled={!canSubmit || loading}
                />
              </div>
            </section>

            <section className="space-y-4 border-t border-slate-100 pt-6">
              <h2 className="text-sm font-semibold text-slate-900">PAN (Optional)</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pan">PAN number (optional)</Label>
                  <Input
                    id="pan"
                    autoComplete="off"
                    placeholder="Enter PAN if available"
                    className="font-mono uppercase tracking-wide"
                    disabled={!canSubmit || loading}
                    {...form.register("pancard", {
                      setValueAs: (v: string) =>
                        typeof v === "string" ? v.replace(/[\s-]/g, "").toUpperCase() : "",
                    })}
                  />
                </div>
                <FileRow
                  id="pd"
                  label="PAN card (optional)"
                  hint="Upload if available"
                  file={panDoc}
                  onChange={setPanDoc}
                  existingUrl={kyc?.panDocUrl ?? null}
                  disabled={!canSubmit || loading}
                />
                <FileRow
                  id="ps"
                  label="PAN screenshot (optional)"
                  hint="Upload if available"
                  file={panScreenshot}
                  onChange={setPanScreenshot}
                  existingUrl={kyc?.panScreenshotUrl ?? null}
                  disabled={!canSubmit || loading}
                />
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
              <Button type="submit" disabled={loading || saving || !canSubmit}>
                {saving ? "Submitting…" : loading ? "Loading…" : "Submit for verification"}
              </Button>
              {kyc?.kycStatusLabel === "REJECTED" ? (
                <p className="text-xs text-muted-foreground">After rejection you can upload new documents and submit again.</p>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
