import Image from "next/image";
import Link from "next/link";
import { Car, GraduationCap, Home, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const services = [
  {
    icon: Car,
    title: "Instant transfers",
    desc: "Send money to any verified user by email with idempotent APIs and ledger entries.",
    img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80",
    href: "/dashboard/wallet",
  },
  {
    icon: GraduationCap,
    title: "Education & fees",
    desc: "Collect tuition and fees with clear audit trails and admin oversight when you scale.",
    img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    href: "/pricing",
  },
  {
    icon: Home,
    title: "Wallet & balance",
    desc: "Add funds from treasury simulation, track balance in real time, and export history.",
    img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    href: "/register",
  },
];

const partners = ["Summit Bank", "Northwind", "Contoso", "Fabrikam"];

export function HomeServices() {
  return (
    <section id="services" className="scroll-mt-24 bg-white py-16 dark:bg-background md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#0c1e45] dark:text-white md:text-4xl">
              Professional services
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Everything you need to prototype a modern fintech experience—front to back.
            </p>
          </div>
          <Link
            href="/pricing"
            className={cn(buttonVariants(), "shrink-0 bg-[#1e4fd6] hover:bg-[#1a45c0]")}
          >
            View all services
          </Link>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <article
                key={s.title}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="border-b border-border bg-muted/30 p-6">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-[#1e4fd6]/10 text-[#1e4fd6]">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  <Link
                    href={s.href}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600"
                  >
                    Learn more
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="relative aspect-[16/10]">
                  <Image
                    src={s.img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 border-t border-border pt-12 opacity-60 grayscale">
          {partners.map((p) => (
            <span
              key={p}
              className="font-serif text-lg font-semibold tracking-wide text-[#0c1e45] dark:text-white"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
