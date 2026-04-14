"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About us" },
  { href: "/pricing", label: "Funding" },
  { href: "/#stats", label: "Projects" },
  { href: "/#services", label: "Our services" },
  { href: "/#blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-border dark:bg-background/95">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-serif text-2xl font-bold tracking-tight text-[#0c1e45] dark:text-white"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-md">
            <Flame className="size-5" aria-hidden />
          </span>
          Finwy
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => {
            const active =
              item.href.startsWith("/#") && pathname === "/"
                ? false
                : pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(
                  "rounded-md px-2.5 py-2 text-sm font-medium text-[#0c1e45]/80 transition-colors hover:bg-slate-100 hover:text-[#0c1e45] dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground",
                  active && "bg-slate-100 text-[#0c1e45] dark:bg-muted dark:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-[#0c1e45] dark:text-foreground"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 dark:hidden" />
            <Moon className="hidden size-4 dark:inline" />
          </Button>
          <Link
            className={cn(
              buttonVariants({ size: "default" }),
              "hidden whitespace-nowrap bg-[#1e4fd6] px-5 text-sm hover:bg-[#1a45c0] sm:inline-flex",
            )}
            href="/login"
          >
            Login / Register
          </Link>
        </div>
      </div>
    </header>
  );
}
