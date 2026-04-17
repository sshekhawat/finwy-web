import { Suspense } from "react";
import { VerifyOtpClient } from "./verify-otp-client";

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] w-full max-w-md items-center justify-center font-sans text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <VerifyOtpClient />
    </Suspense>
  );
}
