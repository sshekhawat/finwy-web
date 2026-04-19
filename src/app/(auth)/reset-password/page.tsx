"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resetPasswordSchema } from "@/lib/validators/auth";
import type { z } from "zod";
import { apiFetch, isApiConfigured } from "@/lib/api-client";
import { readApiError } from "@/lib/auth-http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

type Form = z.infer<typeof resetPasswordSchema>;

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);

  const form = useForm<Form>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { resetToken: token, newPassword: "" },
  });

  useEffect(() => {
    if (token) form.setValue("resetToken", token);
  }, [token, form]);

  async function onSubmit(data: Form) {
    if (!isApiConfigured()) {
      toast.error("Set NEXT_PUBLIC_API_URL first.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          resetToken: data.resetToken,
          newPassword: data.newPassword,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(readApiError(json, "Failed to reset password"));
      const payload = json as { data?: { message?: string } };
      toast.success(payload.data?.message ?? "Password updated");
      window.location.href = "/login";
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-foreground">Set new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password you haven’t used here before. You’ll be signed out of other sessions.
        </p>
      </div>

      {!token ? (
        <p className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          This link is missing a reset token. Open the link from your email again, or request a new reset from{" "}
          <Link href="/forgot-password" className="font-semibold underline underline-offset-2">
            forgot password
          </Link>
          .
        </p>
      ) : null}

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <input type="hidden" {...form.register("resetToken")} />
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium">
            New password
          </Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className="h-11 rounded-xl border-slate-200 bg-slate-50/80 dark:border-input dark:bg-background"
            {...form.register("newPassword")}
          />
          <p className="text-xs text-muted-foreground">Use at least 6 characters.</p>
        </div>
        <Button
          type="submit"
          className="h-11 w-full rounded-xl bg-[#6C63FF] text-base font-semibold text-white shadow-md shadow-[#6C63FF]/25 hover:bg-[#5b54e6]"
          disabled={loading || !token}
        >
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm dark:border-border">
        <Link href="/login" className="font-semibold text-[#6C63FF] hover:text-[#5b54e6] hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthPageShell>
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        </AuthPageShell>
      }
    >
      <ResetForm />
    </Suspense>
  );
}
