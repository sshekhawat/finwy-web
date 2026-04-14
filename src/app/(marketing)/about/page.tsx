import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Finwy",
  description: "Why we built Finwy as a production-shaped fintech reference stack.",
  openGraph: { title: "About Finwy" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">About Finwy</h1>
      <p className="mt-6 text-muted-foreground leading-relaxed">
        Finwy is a reference implementation for teams who want Stripe/Razorpay-grade UX with
        clear boundaries: Prisma models for users, wallets, and transactions; ledger rows
        for every movement; JWT access tokens with rotating refresh sessions; and an admin
        surface for operations.
      </p>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        This stack is intentionally opinionated—security headers, CSRF on state-changing
        APIs, Zod at the edge of your domain, and audit logs for sensitive actions—so you can
        extend it without rewriting foundations.
      </p>
    </div>
  );
}
