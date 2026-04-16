import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { HomeHero } from "@/components/marketing/home/home-hero";
import { HomeAbout } from "@/components/marketing/home/home-about";
import { HomeStatsBar } from "@/components/marketing/home/home-stats-bar";
import { HomeDedicated } from "@/components/marketing/home/home-dedicated";
import { HomeServices } from "@/components/marketing/home/home-services";
import { HomeTestimonial } from "@/components/marketing/home/home-testimonial";
import { HomeBlog } from "@/components/marketing/home/home-blog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Finwy — Start or grow your business with modern payments",
  description:
    "Loan-site inspired landing: wallets, transfers, analytics, and ledger-backed money movement. Built with Next.js, PostgreSQL, and JWT auth.",
  openGraph: {
    title: "Finwy — Modern payments & wallets",
    description:
      "Professional fintech landing with services, stats, and blog—wired to a real demo app.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Finwy",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <HomeHero />
      <HomeAbout />
      <HomeStatsBar />
      <HomeDedicated />
      <HomeServices />
      <HomeTestimonial />
      <HomeBlog />

      <section className="border-t border-border bg-gradient-to-b from-slate-50 to-white py-16 dark:from-slate-950 dark:to-background">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#0c1e45] dark:text-white md:text-3xl">
              Ready to open a wallet?
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Register with OTP simulation, or sign in as the seeded demo user from the README.
            </p>
          </div>
          <Link
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-[#1e4fd6] px-8 hover:bg-[#1a45c0]",
            )}
            href="/register"
          >
            Create account
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
