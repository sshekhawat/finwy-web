"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { apiFetch, logoutSession } from "@/lib/api-client";
import { changePasswordSchema } from "@/lib/validators/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type PasswordForm = z.infer<typeof changePasswordSchema>;

type ApiResponse = {
  success?: boolean;
  data?: { message?: string };
  error?: { message?: string };
};

export default function PersonalDetailsPage() {
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
    setSaving(true);
    try {
      const res = await apiFetch("/profile/change-password", {
        method: "PUT",
        body: JSON.stringify(values),
      });
      const json = (await res.json().catch(() => ({}))) as ApiResponse;
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to update password");
      }
      toast.success(json.data?.message ?? "Password changed successfully");
      form.reset();
      // refresh token set is revoked server-side, clear local session to force a fresh login.
      await logoutSession();
      window.location.href = "/login";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Personal Details</h1>
        <p className="text-sm text-muted-foreground">Update your account credentials securely.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Use your current password to set a new secure password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="oldPassword">Old Password</Label>
              <Input id="oldPassword" type="password" {...form.register("oldPassword")} />
              <p className="text-xs text-destructive">{form.formState.errors.oldPassword?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" {...form.register("newPassword")} />
              <p className="text-xs text-destructive">{form.formState.errors.newPassword?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Re-Enter Password</Label>
              <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
              <p className="text-xs text-destructive">{form.formState.errors.confirmPassword?.message}</p>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
