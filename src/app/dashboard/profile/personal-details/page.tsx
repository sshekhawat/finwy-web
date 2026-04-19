"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { apiFetch, isApiConfigured, logoutSession } from "@/lib/api-client";
import { readApiError } from "@/lib/auth-http";
import {
  personalDetailsFromAuthMe,
  unwrapPersonalDetails,
  type PersonalDetailsPayload,
} from "@/lib/personal-profile";
import { changePasswordSchema } from "@/lib/validators/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type PasswordForm = z.infer<typeof changePasswordSchema>;

function dash(v: string | null | undefined): string {
  const s = v?.trim();
  return s && s.length > 0 ? s : "—";
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[minmax(0,180px)_1fr] sm:gap-4 sm:items-start sm:py-2.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export default function PersonalDetailsPage() {
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [personal, setPersonal] = useState<PersonalDetailsPayload | null>(null);
  const [infoHint, setInfoHint] = useState<string | null>(null);

  const form = useForm<PasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const loadPersonal = useCallback(async () => {
    if (!isApiConfigured()) {
      setInfoHint(
        "Set NEXT_PUBLIC_API_URL to your backend base (e.g. http://localhost:3005/api/v1) in .env.local, then restart the Next.js dev server.",
      );
      setLoadingProfile(false);
      setPersonal(null);
      return;
    }

    setLoadingProfile(true);
    setInfoHint(null);
    try {
      const res = await apiFetch("/profile/personal");
      const json = await res.json().catch(() => ({}));
      const parsed = unwrapPersonalDetails(json);

      if (res.ok && parsed) {
        setPersonal(parsed);
        return;
      }

      if (res.status === 401) {
        throw new Error(readApiError(json, "Unauthorized"));
      }

      const meRes = await apiFetch("/auth/me");
      const meJson = await meRes.json().catch(() => ({}));
      if (meRes.ok) {
        const fallback = personalDetailsFromAuthMe(meJson);
        if (fallback) {
          setPersonal(fallback);
          setInfoHint(
            res.status === 404 || res.status === 405
              ? "This API build has no GET /profile/personal — showing data from your session only. Deploy the latest backend for full address and phone."
              : "Profile response was incomplete — showing session data only. Redeploy the backend if this persists.",
          );
          return;
        }
      }

      throw new Error(readApiError(json, `Failed to load profile (${res.status})`));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load profile";
      toast.error(msg);
      setPersonal(null);
      setInfoHint(msg);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    void loadPersonal();
  }, [loadPersonal]);

  async function onSubmitPassword(values: PasswordForm) {
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
        <h1 className="text-2xl font-semibold tracking-tight">Personal Details</h1>
        <p className="text-sm text-muted-foreground">Your account information and password settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>
            Details from your registration profile (read-only).
            {infoHint && personal ? (
              <span className="mt-2 block text-amber-800">{infoHint}</span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingProfile ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : personal ? (
            <dl className="divide-y divide-slate-100">
              <InfoLine label="User ID" value={dash(personal.userId)} />
              {personal.referrerPublicUserId ? (
                <InfoLine label="Sponsor code" value={personal.referrerPublicUserId} />
              ) : null}
              <InfoLine label="Email" value={dash(personal.email)} />
              <InfoLine label="First name" value={dash(personal.firstName)} />
              <InfoLine label="Last name" value={dash(personal.lastName)} />
              <InfoLine label="Company" value={dash(personal.company)} />
              <InfoLine label="Phone" value={dash(personal.phone)} />
              <InfoLine label="Address" value={dash(personal.address)} />
              <InfoLine label="City" value={dash(personal.city)} />
              <InfoLine label="State" value={dash(personal.state)} />
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              {infoHint ??
                "Could not load profile. Confirm NEXT_PUBLIC_API_URL and that the backend exposes GET /profile/personal."}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Use your current password to set a new secure password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmitPassword)}>
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
              <Button type="submit" disabled={saving}>
                {saving ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
