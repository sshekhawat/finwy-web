"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { businessSchema } from "@/lib/validators/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type BusinessForm = z.infer<typeof businessSchema>;

type BusinessResponse = {
  success?: boolean;
  data?: BusinessForm;
  error?: { message?: string };
} & Partial<BusinessForm>;

function unwrap(data: BusinessResponse): BusinessForm {
  const body = data.success ? data.data ?? {} : data;
  return {
    businessName: body.businessName ?? "",
    ownerName: body.ownerName ?? "",
    businessType: body.businessType ?? "",
    services: body.services ?? "",
    yearlySales: body.yearlySales ?? "",
    ownersIncome: body.ownersIncome ?? "",
    registrationNo: body.registrationNo ?? "",
    gstNumber: body.gstNumber ?? "",
    website: body.website ?? "",
    establishedYear: body.establishedYear ?? "",
    businessAddress: body.businessAddress ?? "",
    city: body.city ?? "",
    state: body.state ?? "",
    country: body.country ?? "",
    postalCode: body.postalCode ?? "",
  };
}

function toNumberOrNull(value?: string): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toIntOrNull(value?: string): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return Number.isInteger(n) ? n : null;
}

export default function BusinessDetailsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm<BusinessForm>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: "",
      ownerName: "",
      businessType: "",
      services: "",
      yearlySales: "",
      ownersIncome: "",
      registrationNo: "",
      gstNumber: "",
      website: "",
      establishedYear: "",
      businessAddress: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/profile/business");
        const json = (await res.json().catch(() => ({}))) as BusinessResponse;
        if (!res.ok) {
          throw new Error(json.error?.message ?? "Failed to load business profile");
        }
        if (!cancelled) {
          form.reset(unwrap(json));
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to load business profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form]);

  async function onSubmit(values: BusinessForm) {
    setSaving(true);
    try {
      const payload = {
        ...values,
        yearlySales: toNumberOrNull(values.yearlySales),
        ownersIncome: toNumberOrNull(values.ownersIncome),
        establishedYear: toIntOrNull(values.establishedYear),
      };
      const res = await apiFetch("/profile/business", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as BusinessResponse;
      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to save business profile");
      }
      form.reset(unwrap(json));
      toast.success("Business profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save business profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Business Details</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>Details used for compliance and payout setup.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="biz-name">Business Name</Label>
              <Input id="biz-name" placeholder="Finwy Solutions Pvt Ltd" {...form.register("businessName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-name">Owner Name</Label>
              <Input id="owner-name" placeholder="John Doe" {...form.register("ownerName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Business Type</Label>
              <Input id="type" placeholder="Private Limited" {...form.register("businessType")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="services">Services</Label>
              <Input id="services" placeholder="Payments, Collections" {...form.register("services")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearly-sales">Yearly Sales</Label>
              <Input id="yearly-sales" placeholder="1500000" {...form.register("yearlySales")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-income">Owner's Income</Label>
              <Input id="owner-income" placeholder="350000" {...form.register("ownersIncome")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst">GST Number</Label>
              <Input id="gst" placeholder="27ABCDE1234F1Z5" {...form.register("gstNumber")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg">Registration Number</Label>
              <Input id="reg" placeholder="U12345DL2026PTC0001" {...form.register("registrationNo")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="https://finwy.com" {...form.register("website")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Established Year</Label>
              <Input id="year" placeholder="2020" {...form.register("establishedYear")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Business Address</Label>
              <Input id="address" placeholder="Street, Area, City" {...form.register("businessAddress")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Mumbai" {...form.register("city")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="Maharashtra" {...form.register("state")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="India" {...form.register("country")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal">Postal Code</Label>
              <Input id="postal" placeholder="400001" {...form.register("postalCode")} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading || saving}>
                {saving ? "Saving..." : loading ? "Loading..." : "Save Business Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
