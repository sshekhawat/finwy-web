import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Full-width hero: navy overlay, headline, orange accent wedge, portrait. */
export function HomeHero() {
  return (
    <section className="relative min-h-[min(92vh,820px)] overflow-hidden bg-[#071229]">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          className="object-cover opacity-40"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071229] via-[#0c1e45]/95 to-[#0c1e45]/70" />
      </div>
      {/* Orange wedge */}
      <div
        className="pointer-events-none absolute -right-24 bottom-0 top-0 z-[1] hidden w-[46%] skew-x-[-12deg] bg-gradient-to-br from-orange-500 to-amber-600 opacity-95 lg:block"
        aria-hidden
      />
      <div className="relative z-[2] mx-auto flex min-h-[min(92vh,820px)] max-w-6xl flex-col justify-center gap-10 px-4 py-20 lg:flex-row lg:items-center lg:gap-16">
        <div className="max-w-xl text-white lg:max-w-[28rem]">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-orange-400">
            Finwy · Payments & credit
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-[3.25rem]">
            Start or grow your own business
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/85">
            Move money with ledger-backed wallets, instant transfers, and transparent
            fees—built for teams that need bank-grade controls without the bank-grade
            complexity.
          </p>
          <div className="mt-6 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-base font-semibold leading-relaxed text-white md:text-lg">
              अब लोन लेना हुआ आसान!
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/90 md:text-base">
              टीम-बेस्ड लोन वॉलेट, तुरंत ट्रांसफर और 100% पारदर्शी फीस के साथ।
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/90 md:text-base">
              पाएं बैंक जैसी सुविधा—बिना किसी झंझट के।
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#1e4fd6] px-8 text-base hover:bg-[#1a45c0]",
              )}
            >
              Learn more
            </Link>
            <span
              className="inline-block h-0 w-0 border-y-[10px] border-l-[14px] border-y-transparent border-l-orange-400"
              aria-hidden
            />
            <Link
              href="/pricing"
              className="text-sm font-medium text-white/90 underline-offset-4 hover:text-orange-400 hover:underline"
            >
              View funding options
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm shrink-0 lg:max-w-md">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm shadow-2xl shadow-black/40 ring-2 ring-white/20 lg:aspect-[3/4]">
            <Image
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
              alt="Business professional reviewing finances on a tablet"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 90vw, 400px"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
