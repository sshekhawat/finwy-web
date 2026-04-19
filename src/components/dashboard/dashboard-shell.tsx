"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BadgeIndianRupee, Building, ChartNoAxesColumn, FileCheck2, LayoutDashboard, LogOut, ShieldCheck, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutSession } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { KycPendingBanner } from "@/components/dashboard/kyc-pending-banner";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const setUser = useAuthStore((s) => s.setUser);

  const profileLinks = [
    { href: "/dashboard/profile/kyc", label: "KYC", icon: ShieldCheck },
    { href: "/dashboard/profile/bank", label: "Bank", icon: Building },
    { href: "/dashboard/profile/business-details", label: "Business Details", icon: FileCheck2 },
    { href: "/dashboard/profile/personal-details", label: "Personal Details", icon: User },
  ];
  const communityLinks = [
    { href: "/dashboard/community/my-community", label: "My Community", icon: Users },
    { href: "/dashboard/community/team-community", label: "Team Community", icon: Users },
  ];
  const singleLinks = [
    { href: "/dashboard/wallet", label: "Wallet", icon: BadgeIndianRupee },
    { href: "/dashboard/income", label: "Income", icon: ChartNoAxesColumn },
  ];

  function isActivePath(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    await logoutSession();
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen bg-slate-100/70">
      <DashboardSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        onLogout={handleLogout}
      />
      <main className="flex-1 px-4 pb-24 pt-4 lg:px-6 lg:pb-6">
        <DashboardHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <KycPendingBanner />
        <div className="mt-4">{children}</div>
      </main>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[85%] max-w-sm bg-white p-0">
          <SheetHeader className="border-b border-slate-200">
            <SheetTitle>Finwy Panel</SheetTitle>
            <SheetDescription>Navigate your dashboard sections</SheetDescription>
          </SheetHeader>
          <div className="space-y-1 p-4">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                isActivePath("/dashboard") && !pathname.startsWith("/dashboard/profile") && !pathname.startsWith("/dashboard/community")
                  ? "bg-[#6C63FF]/15 text-[#6C63FF]"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>

            <p className="mt-4 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Profile</p>
            {profileLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                    isActivePath(item.href) ? "bg-[#6C63FF]/15 text-[#6C63FF]" : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}

            <p className="mt-4 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Community</p>
            {communityLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                    isActivePath(item.href) ? "bg-[#6C63FF]/15 text-[#6C63FF]" : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}

            <p className="mt-4 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">More</p>
            {singleLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                    isActivePath(item.href) ? "bg-[#6C63FF]/15 text-[#6C63FF]" : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={async () => {
                setMobileMenuOpen(false);
                await handleLogout();
              }}
              className="mt-4 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-2 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <a
          href="/dashboard"
          className={cn(
            "flex flex-col items-center gap-1 rounded-md py-1 text-xs",
            pathname === "/dashboard" ? "text-[#6C63FF]" : "text-slate-500",
          )}
        >
          <LayoutDashboard className="size-5" />
          Dashboard
        </a>
        <a
          href="/dashboard/profile"
          className={cn(
            "flex flex-col items-center gap-1 rounded-md py-1 text-xs",
            pathname.startsWith("/dashboard/profile")
              ? "text-[#6C63FF]"
              : "text-slate-500",
          )}
        >
          <User className="size-5" />
          Profile
        </a>
      </nav>
    </div>
  );
}
