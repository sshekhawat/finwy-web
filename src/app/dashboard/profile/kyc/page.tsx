"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { kycSchema } from "@/lib/validators/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type KycForm = z.infer<typeof kycSchema>;

type KycResponse = {
  success?: boolean;
  data?: { pancard?: string | null; aadhaar?: string | null };
  pancard?: string | null;
  aadhaar?: string | null;
  error?: { message?: string };
};

function unwrap(data: KycResponse): { pancard: string; aadhaar: string } {
  const body = data.success ? data.data : data;
  return {
    pancard: body?.pancard ?? "",
    aadhaar: body?.aadhaar ?? "",
  };
}

export default function KycPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm<KycForm>({
    resolver: zodResolver(kycSchema),
    defaultValues: { pancard: "", aadhaar: "" },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/profile/kyc");
        const json = (await res.json().catch(() => ({}))) as KycResponse;
        if (!res.ok) {
          throw new Error(json.error?.message ?? "Failed to load KYC");
        }
        if (!cancelled) {
          form.reset(unwrap(json));
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to load KYC");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form]);

  async function onSubmit(values: KycForm) {
    setSaving(true);
    try {
      const res = await apiFetch("/profile/kyc", {
        method: "PUT",
        body: JSON.stringify(values),
      });
      const json = (await res.json().catch(() => ({}))) as KycResponse;
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to save KYC");
      }
      form.reset(unwrap(json));
      toast.success("KYC details updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save KYC");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">KYC</h1>
        <p className="text-sm text-muted-foreground">Complete your identity verification to unlock higher limits.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>Your PAN and Aadhaar details are stored securely.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="pan">PAN Number</Label>
              <Input id="pan" placeholder="ABCDE1234F" {...form.register("pancard")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar</Label>
              <Input id="aadhaar" placeholder="XXXXXXXXXXXX" {...form.register("aadhaar")} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading || saving}>
                {saving ? "Saving..." : loading ? "Loading..." : "Save KYC"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
