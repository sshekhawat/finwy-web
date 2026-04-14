import Image from "next/image";
import { DonutStat } from "@/components/marketing/donut-stat";

export function HomeAbout() {
  return (
    <section id="about" className="scroll-mt-24 bg-white py-16 dark:bg-background md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80"
              alt="Team collaboration in a modern office"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="absolute -bottom-6 -right-2 max-w-[200px] rounded-sm bg-[#1e4fd6] px-5 py-4 text-center text-white shadow-lg md:-right-6">
            <p className="text-3xl font-bold leading-none">25+</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide">
              Years of combined experience
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            About Finwy
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#0c1e45] dark:text-white md:text-4xl">
            We have been working efficiently with money movement.
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            From double-entry ledgers to role-based admin tools, Finwy gives you a single
            stack to onboard users, fund wallets, and reconcile every rupee—without losing
            sleep over drift or duplicate charges.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-10 sm:justify-start md:gap-14">
            <DonutStat
              percent={75}
              label="Professional tooling"
              sub="Security & compliance patterns"
            />
            <DonutStat
              percent={84}
              label="Successful deliveries"
              sub="Idempotent, auditable flows"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
