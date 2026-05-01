"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { apiFetch, isApiConfigured, logoutSession } from "@/lib/api-client";
import { changePasswordSchema } from "@/lib/validators/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type PasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const [saving, setSaving] = useState(false);

  const form = useForm<PasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: PasswordForm) {
    if (!isApiConfigured()) {
      toast.error("Set NEXT_PUBLIC_API_URL in .env.local, then restart the dev server.");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch("/profile/change-password", {
        method: "PUT",
        body: JSON.stringify(values),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: { message?: string };
        error?: { message?: string };
      };
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to update password");
      }
      toast.success(json.data?.message ?? "Password changed successfully");
      form.reset();
      await logoutSession();
      window.location.href = "/login";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Change password</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update password</CardTitle>
          <CardDescription>Choose a strong password you have not used elsewhere.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="oldPassword">Current password</Label>
              <Input id="oldPassword" type="password" autoComplete="current-password" {...form.register("oldPassword")} />
              <p className="text-xs text-destructive">{form.formState.errors.oldPassword?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" autoComplete="new-password" {...form.register("newPassword")} />
              <p className="text-xs text-destructive">{form.formState.errors.newPassword?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" {...form.register("confirmPassword")} />
              <p className="text-xs text-destructive">{form.formState.errors.confirmPassword?.message}</p>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving} className="bg-[#6C63FF] hover:bg-[#5b54e6]">
                {saving ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
