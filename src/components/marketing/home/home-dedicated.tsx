import Image from "next/image";
import { LoanProgress } from "@/components/marketing/loan-progress";

export function HomeDedicated() {
  return (
    <section className="bg-slate-50 py-16 dark:bg-slate-950/40 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-sm shadow-xl lg:mx-0">
          <Image
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
            alt="Dedicated relationship manager"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 90vw, 400px"
          />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            Why Finwy
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#0c1e45] dark:text-white md:text-4xl">
            Dedicated to serving you.
          </h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Whether you are topping up a wallet or sending peer-to-peer, you get clear
            statuses, notifications, and a full transaction history—so finance and ops
            stay aligned.
          </p>
          <div className="mt-10 space-y-6">
            <LoanProgress label="Business payments" percent={92} />
            <LoanProgress label="Education & fees" percent={80} />
            <LoanProgress label="Housing & large transfers" percent={65} />
          </div>
        </div>
      </div>
    </section>
  );
}
