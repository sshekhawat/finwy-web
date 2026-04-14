/** Trim + strip angle brackets for display-safe user input. */
export function sanitizeText(input: string, maxLen = 5000): string {
  return input.replace(/[<>]/g, "").trim().slice(0, maxLen);
}
