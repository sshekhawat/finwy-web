import Link from "next/link";
import { Mail, Phone } from "lucide-react";

/** Slim contact + social strip (loan-site style top bar). */
export function TopBar() {
  return (
    <div className="bg-[#071229] text-[11px] text-white/90 sm:text-xs">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <a
            href="tel:+911800000000"
            className="inline-flex items-center gap-1.5 hover:text-orange-400"
          >
            <Phone className="size-3.5 shrink-0" aria-hidden />
            <span>+91 1800 000 0000</span>
          </a>
          <a
            href="mailto:support@finwy.app"
            className="inline-flex items-center gap-1.5 hover:text-orange-400"
          >
            <Mail className="size-3.5 shrink-0" aria-hidden />
            <span>support@finwy.app</span>
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-white/50 sm:inline">Follow us</span>
          <div className="flex items-center gap-2">
            {[
              { href: "https://twitter.com", label: "Twitter" },
              { href: "https://linkedin.com", label: "LinkedIn" },
              { href: "https://facebook.com", label: "Facebook" },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="rounded border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide hover:border-orange-400 hover:text-orange-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
