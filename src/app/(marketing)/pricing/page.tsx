import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing — Finwy",
  description: "Simple, transparent pricing for teams that need reliable money movement.",
  openGraph: { title: "Finwy Pricing" },
};

const tiers = [
  {
    name: "Starter",
    price: "₹0",
    desc: "Prototype wallets, OTP auth, and dashboard flows.",
    features: ["User dashboard", "Add & send money", "Transaction history"],
  },
  {
    name: "Growth",
    price: "₹2,999",
    desc: "For teams that need higher limits and SLA-friendly patterns.",
    features: ["Everything in Starter", "Priority support (simulated)", "Admin analytics"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Talk to us",
    desc: "Custom compliance, SSO, and dedicated environments.",
    features: ["Custom contracts", "VPC & private networking", "24/7 support"],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Pricing that scales with your volume
        </h1>
        <p className="mt-3 text-muted-foreground">
          Numbers shown are illustrative—wire your own billing provider when you go live.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <Card
            key={t.name}
            className={t.highlight ? "border-primary shadow-md" : ""}
          >
            <CardHeader>
              <CardTitle>{t.name}</CardTitle>
              <CardDescription>{t.desc}</CardDescription>
              <p className="pt-4 text-3xl font-semibold">{t.price}</p>
              <p className="text-xs text-muted-foreground">per month, excl. taxes</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {t.features.map((f) => (
                  <li key={f}>— {f}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link
                className={buttonVariants({
                  variant: t.highlight ? "default" : "outline",
                  className: "w-full",
                })}
                href="/register"
              >
                Choose {t.name}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
