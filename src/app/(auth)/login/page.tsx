"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, verifyEmailOtpSchema } from "@/lib/validators/auth";
import type { z } from "zod";
import { apiFetch, establishBrowserSession, isApiConfigured, setStoredAccessToken } from "@/lib/api-client";
import { readApiError, callResendEmailOtp } from "@/lib/auth-http";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LoginForm = z.infer<typeof loginSchema>;

type LoginUser = {
  id: string;
  uuid?: string;
  userCode?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  name?: string | null;
};

function mapLoginUser(u: LoginUser): { id: string; email: string; name: string | null; role: string } {
  const fromParts = [u.firstName, u.lastName]
    .filter((x): x is string => Boolean(x?.trim()))
    .join(" ")
    .trim();
  const name = u.name ?? (fromParts.length > 0 ? fromParts : null);
  return { id: u.id, email: u.email, name, role: u.role };
}

function isEmailNotVerifiedMessage(msg: string): boolean {
  const m = msg.toLowerCase();
  return m.includes("verify") && m.includes("email");
}

function LoginForm() {
  const router = useRouter();
  const next = "/dashboard";
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const otpForm = useForm<z.infer<typeof verifyEmailOtpSchema>>({
    resolver: zodResolver(verifyEmailOtpSchema),
    defaultValues: { email: "", otp: "" },
  });

  async function applyAuthSuccess(data: {
    accessToken?: string;
    refreshToken?: string;
    user?: LoginUser;
  }) {
    const bearer = data.accessToken;
    if (bearer) setStoredAccessToken(bearer);
    await establishBrowserSession(data.refreshToken);
    if (data.user) setUser(mapLoginUser(data.user));
  }

  async function onSubmit(data: LoginForm) {
    if (!isApiConfigured()) {
      toast.error("Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:3005/api/v1).");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        const payload = json as {
          success?: boolean;
          data?: { user?: LoginUser; accessToken?: string; refreshToken?: string };
        };
        if (!payload.success || !payload.data?.accessToken) {
          throw new Error("Unexpected login response");
        }
        await applyAuthSuccess(payload.data);
        toast.success("Signed in");
        router.push(next);
        router.refresh();
        return;
      }

      const errMsg = readApiError(json, "Login failed");
      if (res.status === 401 && isEmailNotVerifiedMessage(errMsg)) {
        const emailNorm = data.email.trim().toLowerCase();
        setPendingEmail(emailNorm);
        otpForm.reset({ email: emailNorm, otp: "" });
        const resent = await callResendEmailOtp(emailNorm);
        if (!resent.ok) {
          toast.warning(`${errMsg} ${resent.message}`);
        } else if (resent.emailDispatched === false) {
          toast.warning(
            `${errMsg} Configure SMTP on the server to receive the code, or use “Resend code” after fixing it.`,
          );
        } else {
          toast.warning(`${errMsg} Check your inbox for a new verification code.`);
        }
        setOtpOpen(true);
        return;
      }

      throw new Error(errMsg);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp(form: z.infer<typeof verifyEmailOtpSchema>) {
    setLoading(true);
    try {
      const res = await apiFetch("/auth/verify-email-otp", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          otp: form.otp.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(readApiError(json, "Verification failed"));
      }
      const payload = json as {
        success?: boolean;
        data?: { user?: LoginUser; accessToken?: string; refreshToken?: string };
      };
      if (!payload.success || !payload.data?.accessToken) {
        throw new Error("Unexpected verify response");
      }
      await applyAuthSuccess(payload.data);
      toast.success("Email verified. You are signed in.");
      setOtpOpen(false);
      router.push(next);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (!pendingEmail) return;
    setLoading(true);
    try {
      const out = await callResendEmailOtp(pendingEmail);
      if (!out.ok) toast.error(out.message);
      else if (out.emailDispatched === false) {
        toast.warning("OTP updated but email was not sent (SMTP not configured).");
      } else toast.success(out.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not resend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AuthPageShell>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your email and password. If your email isn’t verified yet, we’ll help you enter the code we
            sent.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="h-11 rounded-xl border-slate-200 bg-slate-50/80 dark:border-input dark:bg-background"
              {...form.register("email")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="h-11 rounded-xl border-slate-200 bg-slate-50/80 dark:border-input dark:bg-background"
              {...form.register("password")}
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-xl bg-[#6C63FF] text-base font-semibold text-white shadow-md shadow-[#6C63FF]/25 hover:bg-[#5b54e6]"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 text-sm dark:border-border">
          <Link href="/forgot-password" className="font-medium text-[#6C63FF] hover:text-[#5b54e6] hover:underline">
            Forgot password?
          </Link>
          <p className="text-muted-foreground">
            New to Finwy?{" "}
            <Link href="/register" className="font-semibold text-[#6C63FF] hover:text-[#5b54e6] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </AuthPageShell>

      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify your email</DialogTitle>
            <DialogDescription>
              Your account needs email verification before sign-in. Enter the 6-digit code sent to{" "}
              <strong>{pendingEmail}</strong>, then you will be redirected to the dashboard.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
            <input type="hidden" {...otpForm.register("email")} />
            <div className="space-y-2">
              <Label htmlFor="login-otp">Email OTP</Label>
              <Input
                id="login-otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                {...otpForm.register("otp")}
              />
              {otpForm.formState.errors.otp && (
                <p className="text-xs text-destructive">{otpForm.formState.errors.otp.message}</p>
              )}
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button type="button" variant="outline" onClick={resendOtp} disabled={loading}>
                Resend code
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#6C63FF] text-white hover:bg-[#5b54e6]"
              >
                {loading ? "…" : "Verify & continue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthPageShell>
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        </AuthPageShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
