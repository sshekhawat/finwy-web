"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, verifyOtpSchema } from "@/lib/validators/auth";
import type { z } from "zod";
import { apiFetch, isApiConfigured } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RegForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [step, setStep] = useState<"register" | "otp">("register");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const regForm = useForm<RegForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  const otpForm = useForm<z.infer<typeof verifyOtpSchema>>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email: "", code: "" },
  });

  async function onRegister(data: RegForm) {
    if (!isApiConfigured()) {
      toast.error("Set NEXT_PUBLIC_API_URL in .env.local.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Registration failed");
      setEmail(data.email.trim().toLowerCase());
      otpForm.setValue("email", data.email.trim().toLowerCase());
      toast.success(json.message ?? "Check your email (simulated)");
      setStep("otp");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function onOtp(data: z.infer<typeof verifyOtpSchema>) {
    setLoading(true);
    try {
      const res = await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "OTP failed");
      toast.success(json.message ?? "Verified");
      window.location.href = "/login";
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          {step === "register"
            ? "We will simulate OTP delivery via server logs in development."
            : "Enter the 6-digit code."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "register" ? (
          <form onSubmit={regForm.handleSubmit(onRegister)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...regForm.register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...regForm.register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...regForm.register("password")} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "…" : "Continue"}
            </Button>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(onOtp)} className="space-y-4">
            <input type="hidden" {...otpForm.register("email")} />
            <div className="space-y-2">
              <Label htmlFor="otp-email">Email</Label>
              <Input id="otp-email" readOnly value={email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">OTP</Label>
              <Input id="code" inputMode="numeric" {...otpForm.register("code")} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "…" : "Verify"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <Link href="/login" className="hover:text-foreground">
          Already have an account? Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
