"use client";

import { CalendarDays, Filter, Menu, Search, Sparkles } from "lucide-react";

export function DashboardHeader({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-4" />
      </button>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search transactions, member, cards..."
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-[#6C63FF] focus:bg-white"
        />
      </div>
      <button className="hidden h-10 items-center gap-1 rounded-xl bg-[#6C63FF] px-3 text-sm font-medium text-white transition hover:bg-[#5e56ef] sm:inline-flex">
        <Sparkles className="size-4" />
        Ask AI
      </button>
      <button className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 sm:inline-flex">
        <CalendarDays className="size-4" />
      </button>
      <button className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 sm:inline-flex">
        <Filter className="size-4" />
      </button>
    </header>
  );
}
