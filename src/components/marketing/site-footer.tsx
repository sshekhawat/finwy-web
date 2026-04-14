import Link from "next/link";
import { Flame, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-[#050a14] text-white">
      <div className="border-b border-white/10 bg-black/40 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-2 font-serif text-2xl font-bold">
            <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-600">
              <Flame className="size-5 text-white" aria-hidden />
            </span>
            Finwy
          </Link>
          <div className="flex flex-col gap-2 text-sm text-white/80 md:flex-row md:gap-10">
            <span className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-orange-400" aria-hidden />
              91 Brigade Road, Bengaluru, Karnataka 560025
            </span>
            <a
              href="tel:+911800000000"
              className="inline-flex items-center gap-2 hover:text-orange-400"
            >
              <Phone className="size-4 shrink-0 text-orange-400" aria-hidden />
              +91 1800 000 0000
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <h3 className="font-semibold text-white">About us</h3>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            Finwy is a reference-grade fintech stack: wallets, transfers, admin analytics,
            and audit logs—so you can ship demos that feel real.
          </p>
          <div className="mt-6 flex gap-2">
            {["Twitter", "LinkedIn", "Facebook"].map((s) => (
              <Link
                key={s}
                href="https://twitter.com"
                className="rounded border border-white/20 px-3 py-1 text-xs uppercase tracking-wide hover:border-orange-400 hover:text-orange-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-white">Quick links</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {[
              { href: "/", label: "Home" },
              { href: "/pricing", label: "Pricing" },
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
              { href: "/login", label: "Dashboard login" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-orange-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white">Latest posts</h3>
          <ul className="mt-4 space-y-4 text-sm">
            <li>
              <Link href="/about" className="text-white/80 hover:text-orange-400">
                Bigger runway on the road to PMF
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-white/80 hover:text-orange-400">
                Double-entry for every wallet movement
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black py-4 text-center text-xs text-white/50">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="text-orange-400">Finwy</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
