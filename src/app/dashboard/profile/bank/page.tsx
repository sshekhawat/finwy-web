"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { bankSchema } from "@/lib/validators/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type BankForm = z.infer<typeof bankSchema>;

type BankResponse = {
  success?: boolean;
  data?: {
    bankAc?: string | null;
    bankAcName?: string | null;
    bankName?: string | null;
    bankLocation?: string | null;
    bankIfsc?: string | null;
    bankType?: string | null;
  };
  bankAc?: string | null;
  bankAcName?: string | null;
  bankName?: string | null;
  bankLocation?: string | null;
  bankIfsc?: string | null;
  bankType?: string | null;
  error?: { message?: string };
};

function unwrap(data: BankResponse): BankForm {
  const body = data.success ? data.data : data;
  return {
    bankAc: body?.bankAc ?? "",
    bankAcName: body?.bankAcName ?? "",
    bankName: body?.bankName ?? "",
    bankLocation: body?.bankLocation ?? "",
    bankIfsc: body?.bankIfsc ?? "",
    bankType: body?.bankType ?? "",
  };
}

export default function BankPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm<BankForm>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bankAc: "",
      bankAcName: "",
      bankName: "",
      bankLocation: "",
      bankIfsc: "",
      bankType: "",
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/profile/bank");
        const json = (await res.json().catch(() => ({}))) as BankResponse;
        if (!res.ok) {
          throw new Error(json.error?.message ?? "Failed to load bank details");
        }
        if (!cancelled) {
          form.reset(unwrap(json));
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to load bank details");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form]);

  async function onSubmit(values: BankForm) {
    setSaving(true);
    try {
      const res = await apiFetch("/profile/bank", {
        method: "PUT",
        body: JSON.stringify(values),
      });
      const json = (await res.json().catch(() => ({}))) as BankResponse;
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to save bank details");
      }
      form.reset(unwrap(json));
      toast.success("Bank details updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save bank details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bank</h1>
        <p className="text-sm text-muted-foreground">Link and verify payout bank accounts.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bank Account Details</CardTitle>
          <CardDescription>Maintain payout and settlement details for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="holder">Account Holder</Label>
              <Input id="holder" placeholder="Your Name" {...form.register("bankAcName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Account Number</Label>
              <Input id="account" placeholder="XXXXXXXXXXXX" {...form.register("bankAc")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifsc">IFSC</Label>
              <Input id="ifsc" placeholder="HDFC0001234" {...form.register("bankIfsc")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input id="bank-name" placeholder="HDFC Bank" {...form.register("bankName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-location">Branch / Location</Label>
              <Input id="bank-location" placeholder="Mumbai Main Branch" {...form.register("bankLocation")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-type">Account Type</Label>
              <Input id="bank-type" placeholder="Savings / Current" {...form.register("bankType")} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading || saving}>
                {saving ? "Saving..." : loading ? "Loading..." : "Save Bank Details"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
