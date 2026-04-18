"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema } from "@/lib/validators/auth";
import type { z } from "zod";
import { apiFetch, isApiConfigured } from "@/lib/api-client";
import { readApiError, callResendEmailOtp } from "@/lib/auth-http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { cn } from "@/lib/utils";

type RegForm = z.infer<typeof registerSchema>;

type ReferralData = {
  valid: boolean;
  requiresReferral?: boolean;
  message?: string;
  referrer?: {
    uuid: string;
    userCode: string;
    firstName: string;
    lastName: string;
  };
};

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function RequiredStar() {
  return (
    <span className="text-destructive" aria-hidden>
      {" "}
      *
    </span>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  /** Default true so the form never sits in a blocked “loading” state if the preflight request fails. */
  const [requiresReferral, setRequiresReferral] = useState(true);
  const [referralPending, setReferralPending] = useState(false);
  const [referralResult, setReferralResult] = useState<ReferralData | null>(null);

  const regForm = useForm<RegForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      referralId: "",
      childSide: "L",
    },
  });

  const referralId = regForm.watch("referralId");
  const debouncedReferral = useDebounced(referralId?.trim() ?? "", 450);

  useEffect(() => {
    if (!isApiConfigured()) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch("/auth/validate-referral", {
          method: "POST",
          body: JSON.stringify({}),
        });
        const json = (await res.json()) as { success?: boolean; data?: ReferralData };
        if (cancelled || !json.success || !json.data) return;
        setRequiresReferral(!!json.data.requiresReferral);
      } catch {
        /* keep default requiresReferral === true */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!requiresReferral) {
      regForm.setValue("referralId", "");
      setReferralResult(null);
    }
  }, [requiresReferral, regForm]);

  useEffect(() => {
    if (!isApiConfigured()) return;
    const id = debouncedReferral;
    if (id.length < 8) {
      setReferralResult(null);
      setReferralPending(false);
      return;
    }
    let cancelled = false;
    setReferralPending(true);
    void (async () => {
      try {
        const res = await apiFetch("/auth/validate-referral", {
          method: "POST",
          body: JSON.stringify({ referralId: id }),
        });
        const json = (await res.json()) as { success?: boolean; data?: ReferralData };
        if (cancelled) return;
        if (json.success && json.data) setReferralResult(json.data);
        else setReferralResult({ valid: false, message: "Invalid Referrer Name" });
      } catch {
        if (!cancelled) setReferralResult({ valid: false, message: "Invalid Referrer Name" });
      } finally {
        if (!cancelled) setReferralPending(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedReferral]);

  const onRegister = useCallback(
    async (data: RegForm) => {
      if (!isApiConfigured()) {
        toast.error("Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:3005/api/v1).");
        return;
      }
      if (requiresReferral) {
        const trimmed = data.referralId?.trim() ?? "";
        if (!trimmed) {
          toast.error("Sponsor ID is required.");
          return;
        }
        if (!referralResult?.valid) {
          toast.error("Enter a valid sponsor ID.");
          return;
        }
      }

      setLoading(true);
      try {
        const body: Record<string, unknown> = {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phone: data.phone.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
          childSide: data.childSide,
        };
        const ref = data.referralId?.trim();
        if (ref) body.referralId = ref;

        const res = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(readApiError(json, "Registration failed"));
        }
        const emailNorm = data.email.trim().toLowerCase();

        const resent = await callResendEmailOtp(emailNorm);
        if (!resent.ok) {
          toast.warning(
            `Account created. ${resent.message} Use “Resend code” after fixing the issue, or enter the code from the registration email if you received one.`,
          );
        } else if (resent.emailDispatched === false) {
          toast.warning(
            "Account created. Email was not sent (SMTP not configured on the server). Set SMTP_USER/SMTP_PASS, then tap “Resend code”.",
          );
        } else {
          toast.success(resent.message);
        }
        router.push(`/verify-otp?email=${encodeURIComponent(emailNorm)}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Registration failed");
      } finally {
        setLoading(false);
      }
    },
    [requiresReferral, referralResult?.valid, router],
  );

  const sponsorInvalid = Boolean(
    requiresReferral &&
      debouncedReferral.length >= 8 &&
      !referralPending &&
      referralResult !== null &&
      !referralResult.valid,
  );

  const sponsorHelperInner = (() => {
    if (debouncedReferral.length < 8) return "";
    if (referralPending) return "…";
    if (referralResult?.valid && referralResult.referrer) {
      return `${referralResult.referrer.firstName} ${referralResult.referrer.lastName}`.trim();
    }
    if (referralResult && !referralResult.valid) {
      return referralResult.message?.trim() || "Invalid Referrer Name";
    }
    return "";
  })();

  return (
    <AuthPageShell>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-foreground">
          Create account
        </h1>
        <p className="text-sm text-muted-foreground">
          {requiresReferral
            ? "Join Finwy with your sponsor’s ID. We’ll email you a code to verify your address."
            : "You’re creating the first account on this server — no sponsor ID needed."}
        </p>
      </div>

      <form onSubmit={regForm.handleSubmit(onRegister)} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="referralId" className="text-sm font-medium text-slate-800 dark:text-foreground">
            Sponsor ID
            {requiresReferral ? <RequiredStar /> : null}
          </Label>
          <Input
            id="referralId"
            autoComplete="off"
            placeholder={requiresReferral ? "e.g. FWY0001" : "Not required"}
            aria-invalid={sponsorInvalid}
            disabled={!requiresReferral}
            className={cn(
              "h-11 rounded-xl border-slate-200 bg-slate-50/80 transition-colors focus-visible:border-[#6C63FF] focus-visible:ring-[#6C63FF]/20 dark:border-input dark:bg-background",
              sponsorInvalid && "border-destructive",
              !requiresReferral && "opacity-70",
            )}
            {...regForm.register("referralId")}
          />
          <p
            className={cn(
              "text-xs text-muted-foreground",
              sponsorInvalid && "text-destructive",
              referralResult?.valid && referralResult.referrer && "font-medium text-emerald-700 dark:text-emerald-400",
            )}
          >
            {requiresReferral ? (
              <>
                Your sponsor:{" "}
                <span className="text-foreground/90">{sponsorHelperInner || "—"}</span>
              </>
            ) : (
              "Sponsor ID is disabled for the first registration."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First name
              <RequiredStar />
            </Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              className="h-11 rounded-xl border-slate-200 bg-slate-50/80 dark:border-input dark:bg-background"
              {...regForm.register("firstName")}
            />
            {regForm.formState.errors.firstName && (
              <p className="text-xs text-destructive">{regForm.formState.errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last name
            </Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              className="h-11 rounded-xl border-slate-200 bg-slate-50/80 dark:border-input dark:bg-background"
              {...regForm.register("lastName")}
            />
            {regForm.formState.errors.lastName && (
              <p className="text-xs text-destructive">{regForm.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Contact number
            <RequiredStar />
          </Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 …"
            className="h-11 rounded-xl border-slate-200 bg-slate-50/80 dark:border-input dark:bg-background"
            {...regForm.register("phone")}
          />
          {regForm.formState.errors.phone && (
            <p className="text-xs text-destructive">{regForm.formState.errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address
            <RequiredStar />
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11 rounded-xl border-slate-200 bg-slate-50/80 dark:border-input dark:bg-background"
            {...regForm.register("email")}
          />
          {regForm.formState.errors.email && (
            <p className="text-xs text-destructive">{regForm.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
            <RequiredStar />
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className="h-11 rounded-xl border-slate-200 bg-slate-50/80 dark:border-input dark:bg-background"
            {...regForm.register("password")}
          />
          <p className="text-xs text-muted-foreground">Use at least 6 characters.</p>
          {regForm.formState.errors.password && (
            <p className="text-xs text-destructive">{regForm.formState.errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-xl bg-[#6C63FF] text-base font-semibold text-white shadow-md shadow-[#6C63FF]/25 hover:bg-[#5b54e6]"
          disabled={loading || (requiresReferral && referralPending)}
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-muted-foreground dark:border-border">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#6C63FF] hover:text-[#5b54e6] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
