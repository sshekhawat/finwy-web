"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validators/auth";
import type { z } from "zod";
import { apiFetch, isApiConfigured, setStoredAccessToken } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
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

type Form = z.infer<typeof loginSchema>;

const DEMO_USER = {
  id: "demo-user",
  email: "demo@finwy.local",
  name: "Demo User",
  role: "USER",
};

function LoginForm() {
  const router = useRouter();
  const next = "/dashboard";
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  const form = useForm<Form>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: Form) {
    if (!isApiConfigured()) {
      setUser(DEMO_USER);
      setStoredAccessToken("demo-token");
      toast.success("Demo login successful");
      router.push(next);
      router.refresh();
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        user?: {
          id: string;
          email: string;
          name: string | null;
          role: string;
        };
        accessToken?: string;
        token?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Login failed");
      const bearer = json.accessToken ?? json.token;
      if (bearer) setStoredAccessToken(bearer);
      if (json.user) setUser(json.user);
      toast.success("Signed in");
      router.push(next);
      router.refresh();
    } catch (e) {
      // Frontend-only fallback: still allow navigating dashboard for static/demo use.
      setUser(DEMO_USER);
      setStoredAccessToken("demo-token");
      toast.warning(
        e instanceof Error ? `${e.message}. Opening demo dashboard.` : "Opening demo dashboard.",
      );
      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Calls your API: <code className="text-xs">POST /auth/login</code>. Expect{" "}
          <code className="text-xs">accessToken</code> (or <code className="text-xs">token</code>) +{" "}
          <code className="text-xs">user</code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...form.register("password")}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground">
        <Link href="/forgot-password" className="hover:text-foreground">
          Forgot password?
        </Link>
        <span>
          No account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
