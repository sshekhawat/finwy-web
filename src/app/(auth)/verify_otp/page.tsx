import { redirect } from "next/navigation";

/** Alias for `/verify-otp` (underscore URL). Preserves `email` query when present. */
export default async function VerifyOtpAliasPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const sp = await searchParams;
  const email = sp.email;
  const q = typeof email === "string" && email.length > 0 ? `?email=${encodeURIComponent(email)}` : "";
  redirect(`/verify-otp${q}`);
}
