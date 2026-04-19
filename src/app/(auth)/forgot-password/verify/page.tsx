import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { VerifyForgotPasswordClient } from "./verify-forgot-password-client";

export default function ForgotPasswordVerifyPage() {
  return (
    <AuthPageShell>
      <Suspense
        fallback={<p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>}
      >
        <VerifyForgotPasswordClient />
      </Suspense>
    </AuthPageShell>
  );
}
