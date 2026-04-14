"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { contactSchema } from "@/lib/validators/contact";
import type { z } from "zod";
import { apiFetch, isApiConfigured } from "@/lib/api-client";
import { sanitizeText } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Form = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const form = useForm<Form>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  async function onSubmit(data: Form) {
    if (!isApiConfigured()) {
      toast.error("Set NEXT_PUBLIC_API_URL to your backend base URL.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          name: sanitizeText(data.name, 120),
          message: sanitizeText(data.message, 5000),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      toast.success(json.message ?? "Sent");
      form.reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>
            Messages are stored in PostgreSQL for your support workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={5} {...form.register("message")} />
              {form.formState.errors.message && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.message.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send message"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
