/** Build `/register` URL with sponsor / referral query (used for Sponsor ID field). */
export function buildRegisterReferralUrl(origin: string, referralCode: string): string {
  const base = origin.replace(/\/$/, "");
  const code = referralCode.trim();
  if (!code) return `${base}/register`;
  return `${base}/register?ref=${encodeURIComponent(code)}`;
}

export function referralSignupShareText(referralCode: string, signupUrl: string): string {
  return `Join Finwy using my Sponsor ID: ${referralCode.trim()}\n\nRegister here:\n${signupUrl}`;
}
