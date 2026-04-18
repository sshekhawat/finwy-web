"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuthSession } from "@/components/providers/auth-session-provider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  const { ready, isAuthenticated } = useAuthSession();

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
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-[#0c1e45] lg:hidden dark:text-foreground"
                  aria-label="Open navigation menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] max-w-xs bg-white p-0 dark:bg-background">
              <SheetHeader className="border-b border-slate-200 dark:border-border">
                <SheetTitle>Finwy</SheetTitle>
                <SheetDescription>Mobile navigation</SheetDescription>
              </SheetHeader>
              <div className="space-y-1 p-4">
                {nav.map((item) => {
                  const active =
                    item.href.startsWith("/#") && pathname === "/"
                      ? false
                      : pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={`m-${item.href}-${item.label}`}
                      href={item.href}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm font-medium",
                        active
                          ? "bg-slate-100 text-[#0c1e45] dark:bg-muted dark:text-foreground"
                          : "text-[#0c1e45]/80 hover:bg-slate-100 dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
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
          {ready &&
            (isAuthenticated ? (
              <>
                <Link
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                    "whitespace-nowrap border-slate-300 px-3 text-xs sm:hidden",
                  )}
                  href="/dashboard"
                >
                  Dashboard
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ size: "default" }),
                    "hidden whitespace-nowrap bg-[#6C63FF] px-5 text-sm hover:bg-[#5b54e6] sm:inline-flex",
                  )}
                  href="/dashboard"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "px-2 text-xs sm:hidden")}
                  href="/login"
                >
                  Login
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                    "border-slate-300 px-2 text-xs sm:hidden",
                  )}
                  href="/register"
                >
                  Register
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ size: "default" }),
                    "hidden whitespace-nowrap bg-[#6C63FF] px-5 text-sm hover:bg-[#5b54e6] sm:inline-flex",
                  )}
                  href="/login"
                >
                  Login / Register
                </Link>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
