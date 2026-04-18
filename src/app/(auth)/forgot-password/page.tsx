"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import type { z } from "zod";
import { apiFetch, isApiConfigured } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthPageShell } from "@/components/auth/auth-page-shell";

type Form = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const form = useForm<Form>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: Form) {
    if (!isApiConfigured()) {
      toast.error("Set NEXT_PUBLIC_API_URL first.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success(json.message ?? "If an account exists, instructions were sent.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-foreground">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter the email you used to register. If an account exists, we’ll send reset instructions.
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
        <Button
          type="submit"
          className="h-11 w-full rounded-xl bg-[#6C63FF] text-base font-semibold text-white shadow-md shadow-[#6C63FF]/25 hover:bg-[#5b54e6]"
          disabled={loading}
        >
          {loading ? "Sending…" : "Send reset instructions"}
        </Button>
      </form>

      <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm dark:border-border">
        <Link href="/login" className="font-semibold text-[#6C63FF] hover:text-[#5b54e6] hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
