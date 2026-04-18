"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { verifyEmailOtpSchema } from "@/lib/validators/auth";
import { apiFetch, establishBrowserSession, isApiConfigured, setStoredAccessToken } from "@/lib/api-client";
import { readApiError, callResendEmailOtp } from "@/lib/auth-http";
import { maskEmailForDisplay } from "@/lib/mask-email";
import { useAuthStore } from "@/stores/auth-store";
import { OtpUnderlineInput } from "@/components/auth/otp-underline-input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VerifyOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);

  const emailRaw = searchParams.get("email")?.trim() ?? "";
  const email = emailRaw.toLowerCase();
  const emailValid = useMemo(() => z.string().email().safeParse(email).success, [email]);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const masked = emailValid ? maskEmailForDisplay(email) : "";

  const submit = useCallback(async () => {
    if (!isApiConfigured()) {
      toast.error("Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:3005/api/v1).");
      return;
    }
    if (!emailValid) {
      toast.error("Invalid or missing email. Go back to registration.");
      return;
    }
    const parsed = verifyEmailOtpSchema.safeParse({ email, otp });
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors.otp?.[0] ?? "Enter the 6-digit code";
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/auth/verify-email-otp", {
        method: "POST",
        body: JSON.stringify({
          email: parsed.data.email,
          otp: parsed.data.otp,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(readApiError(json, "Verification failed"));
      }
      const payload = json as {
        success?: boolean;
        data?: {
          accessToken?: string;
          refreshToken?: string;
          user?: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
          };
        };
      };
      if (payload.data?.accessToken) setStoredAccessToken(payload.data.accessToken);
      await establishBrowserSession(payload.data?.refreshToken);
      if (payload.data?.user) {
        const u = payload.data.user;
        const name = `${u.firstName} ${u.lastName}`.trim();
        setUser({
          id: u.id,
          email: u.email,
          name: name.length > 0 ? name : null,
          role: u.role,
        });
      }
      toast.success("Email verified. You are signed in.");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [email, emailValid, otp, router, setUser]);

  async function resend() {
    if (!emailValid) return;
    setLoading(true);
    try {
      const out = await callResendEmailOtp(email);
      if (!out.ok) {
        toast.error(out.message);
        return;
      }
      if (out.emailDispatched === false) {
        toast.warning("OTP was updated, but email was not sent (configure SMTP on the API server).");
      } else {
        toast.success(out.message);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not resend");
    } finally {
      setLoading(false);
    }
  }

  if (!emailValid) {
    return (
      <div className="space-y-5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-foreground">
          Verify your account
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This page needs a valid email in the link. Return to registration and complete the flow, or open the link from
          your inbox again.
        </p>
        <Link
          href="/register"
          className={cn(
            buttonVariants({ size: "lg" }),
            "inline-flex h-11 w-full items-center justify-center rounded-xl border-0 bg-[#6C63FF] text-base font-semibold text-white shadow-md shadow-[#6C63FF]/25 hover:bg-[#5b54e6] sm:w-auto sm:px-8",
          )}
        >
          Back to registration
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-balance text-xl font-semibold tracking-tight text-slate-900 dark:text-foreground sm:text-2xl">
          Enter your verification code
        </h1>
        <p className="text-pretty text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground/90">{masked}</span>. Enter it below to activate your account.
        </p>
      </div>

      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <OtpUnderlineInput value={otp} onChange={setOtp} disabled={loading} autoFocus />

        <Button
          type="submit"
          disabled={loading || otp.replace(/\D/g, "").length !== 6}
          className="h-11 w-full rounded-xl bg-[#6C63FF] text-base font-semibold text-white shadow-md shadow-[#6C63FF]/25 hover:bg-[#5b54e6]"
        >
          {loading ? "Verifying…" : "Verify & continue"}
        </Button>
      </form>

      <div className="space-y-4 border-t border-slate-100 pt-6 text-center text-sm dark:border-border">
        <button
          type="button"
          disabled={loading}
          onClick={() => void resend()}
          className="font-semibold text-[#6C63FF] underline-offset-4 hover:underline disabled:opacity-50"
        >
          Resend code
        </button>
        <p className="text-muted-foreground">
          <Link href="/register" className="font-medium text-foreground/90 hover:text-[#6C63FF] hover:underline">
            Wrong email? Register again
          </Link>
        </p>
      </div>
    </div>
  );
}
