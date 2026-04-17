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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <>
      <div className="w-full max-w-md rounded-xl border border-border/60 bg-sky-50/80 p-6 shadow-sm dark:bg-sky-950/20">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-1 px-0 pt-0">
            <CardTitle className="font-sans text-xl font-semibold tracking-tight text-foreground">
              Create account
            </CardTitle>
            {!requiresReferral && (
              <p className="font-sans text-sm text-muted-foreground">
                First account on this server — sponsor ID is optional.
              </p>
            )}
          </CardHeader>
          <CardContent className="px-0">
            <form onSubmit={regForm.handleSubmit(onRegister)} className="space-y-5 font-sans">
              <div className="space-y-1.5">
                <Label
                  htmlFor="referralId"
                  className="text-sm font-medium text-foreground"
                >
                  sponsor ID
                  {requiresReferral ? <RequiredStar /> : null}
                </Label>
                <Input
                  id="referralId"
                  autoComplete="off"
                  placeholder=""
                  aria-invalid={sponsorInvalid}
                  disabled={!requiresReferral}
                  className={cn(
                    "rounded-md border-foreground/25 bg-white dark:bg-background",
                    sponsorInvalid && "border-destructive",
                    !requiresReferral && "opacity-70",
                  )}
                  {...regForm.register("referralId")}
                />
                <p
                  className={cn(
                    "text-sm text-muted-foreground",
                    sponsorInvalid && "text-destructive",
                    referralResult?.valid && referralResult.referrer && "text-emerald-700 dark:text-emerald-400",
                  )}
                >
                  (Your sponsor: {sponsorHelperInner || "\u00a0"})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                    <RequiredStar />
                  </Label>
                  <Input
                    id="firstName"
                    autoComplete="given-name"
                    className="rounded-md border-foreground/25 bg-white dark:bg-background"
                    {...regForm.register("firstName")}
                  />
                  {regForm.formState.errors.firstName && (
                    <p className="text-xs text-destructive">{regForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    className="rounded-md border-foreground/25 bg-white dark:bg-background"
                    {...regForm.register("lastName")}
                  />
                  {regForm.formState.errors.lastName && (
                    <p className="text-xs text-destructive">{regForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Contact Number
                  <RequiredStar />
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className="rounded-md border-foreground/25 bg-white dark:bg-background"
                  {...regForm.register("phone")}
                />
                {regForm.formState.errors.phone && (
                  <p className="text-xs text-destructive">{regForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                  <RequiredStar />
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="rounded-md border-foreground/25 bg-white dark:bg-background"
                  {...regForm.register("email")}
                />
                {regForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{regForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  Login Password
                  <RequiredStar />
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="rounded-md border-foreground/25 bg-white dark:bg-background"
                  {...regForm.register("password")}
                />
                <p className="text-xs text-muted-foreground">
                  At least 12 characters with upper, lower, and a number.
                </p>
                {regForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{regForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="h-10 w-full rounded-md font-sans font-medium"
                disabled={loading || (requiresReferral && referralPending)}
              >
                {loading ? "…" : "Register"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-border/60 px-0 pt-6 pb-0">
            <Link href="/login" className="font-sans text-sm text-muted-foreground hover:text-foreground">
              Already have an account? Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
