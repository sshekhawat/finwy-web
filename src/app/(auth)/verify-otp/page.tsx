import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { VerifyOtpClient } from "./verify-otp-client";

export default function VerifyOtpPage() {
  return (
    <AuthPageShell>
      <Suspense
        fallback={<p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>}
      >
        <VerifyOtpClient />
      </Suspense>
    </AuthPageShell>
  );
}
