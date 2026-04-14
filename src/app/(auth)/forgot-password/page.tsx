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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          POST <code className="text-xs">/auth/forgot-password</code> on your API.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "…" : "Send reset link"}
          </Button>
        </form>
      </CardContent>
      <CardContent className="pt-0">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
      </CardContent>
    </Card>
  );
}
