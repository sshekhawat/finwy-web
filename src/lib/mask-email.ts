/** Partially mask an email for display (e.g. OTP confirmation screens). */
export function maskEmailForDisplay(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "****";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (!domain) return "****";
  if (local.length <= 2) return `*@${domain}`;
  const start = local.slice(0, 2);
  const end = local.length > 3 ? local.slice(-1) : "";
  const midLen = Math.max(4, local.length - start.length - end.length);
  const mid = "*".repeat(Math.min(8, midLen));
  return `${start}${mid}${end}@${domain}`;
}
