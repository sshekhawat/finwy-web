"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, X } from "lucide-react";
import { apiFetch, isApiConfigured } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const SESSION_KEY = "finwy_kyc_banner_dismissed";

type KycApiData = {
  isKycVerified?: boolean;
  needsKycAction?: boolean;
  isKycPending?: boolean;
  kycStatusLabel?: string;
};

function unwrapKyc(json: unknown): KycApiData | null {
  if (!json || typeof json !== "object") return null;
  const root = json as { success?: boolean; data?: KycApiData };
  if (root.success && root.data && typeof root.data === "object") return root.data;
  if ("isKycVerified" in root || "kycStatusLabel" in root) return root as KycApiData;
  return null;
}

/** True when KYC is not admin-approved (not uploaded, pending review, or rejected). */
function shouldShowBanner(data: KycApiData | null): boolean {
  if (!data) return false;
  if (data.needsKycAction === true) return true;
  if (data.needsKycAction === false) return false;
  return data.isKycVerified !== true;
}

export function KycPendingBanner() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [pendingReview, setPendingReview] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(SESSION_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!isApiConfigured() || dismissed) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await apiFetch("/profile/kyc");
        const json = await res.json().catch(() => ({}));
        if (!res.ok || cancelled) {
          if (!cancelled) {
            setShow(false);
            setLoading(false);
          }
          return;
        }
        const data = unwrapKyc(json);
        const review = data?.isKycPending === true || data?.kycStatusLabel === "PENDING_REVIEW";
        if (!cancelled) {
          setPendingReview(Boolean(review));
          setShow(shouldShowBanner(data));
        }
      } catch {
        if (!cancelled) setShow(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dismissed, pathname]);

  function dismiss() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
    setShow(false);
  }

  if (loading || !show || dismissed) return null;

  return (
    <div
      className={cn(
        "relative -mx-4 mb-4 flex max-w-none items-start gap-3 border-y border-red-300/80 bg-rose-100 px-4 py-3 pr-12 text-[13px] leading-snug text-red-950 sm:text-sm lg:-mx-6 lg:px-6",
      )}
      role="alert"
    >
      <Bell className="mt-0.5 size-5 shrink-0 text-amber-500" aria-hidden />
      <div className="min-w-0 flex-1 text-red-950">
        {pendingReview ? (
          <>
            <p className="font-semibold">KYC verification in progress</p>
            <p className="mt-1 text-red-950/95">
              Your documents are awaiting admin approval.{" "}
              <Link
                href="/dashboard/profile/kyc"
                className="font-medium text-red-950 underline underline-offset-2 hover:no-underline"
              >
                View status
              </Link>
            </p>
          </>
        ) : (
          <p className="text-red-950">
            <span className="font-bold">KYC Update Required!</span>{" "}
            <span className="text-red-950/95">
              Please update your KYC details to proceed. Some fields are still pending.{" "}
              <Link
                href="/dashboard/profile/kyc"
                className="font-semibold text-red-950 underline underline-offset-2 hover:no-underline"
              >
                Complete KYC
              </Link>
            </span>
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-red-800/60 hover:bg-red-200/60 hover:text-red-950"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
