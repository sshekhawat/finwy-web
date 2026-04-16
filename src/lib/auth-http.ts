import { apiFetch } from "@/lib/api-client";

export function readApiError(json: unknown, fallback: string): string {
  if (json && typeof json === "object" && "error" in json) {
    const err = (json as { error?: { message?: string } }).error;
    if (typeof err?.message === "string" && err.message.length > 0) return err.message;
  }
  return fallback;
}

/** `POST /auth/resend-email-otp` */
export async function callResendEmailOtp(email: string): Promise<{
  ok: boolean;
  message: string;
  emailDispatched?: boolean;
}> {
  const res = await apiFetch("/auth/resend-email-otp", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, message: readApiError(json, "Could not send OTP email") };
  }
  const data = json as { data?: { message?: string; emailDispatched?: boolean } };
  return {
    ok: true,
    message: data.data?.message ?? "If the account exists and is pending verification, an OTP has been sent.",
    emailDispatched: data.data?.emailDispatched,
  };
}
