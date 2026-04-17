"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutSession } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const setUser = useAuthStore((s) => s.setUser);

  return (
    <div className="flex min-h-screen bg-slate-100/70">
      <DashboardSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        onLogout={async () => {
          await logoutSession();
          setUser(null);
          window.location.href = "/login";
        }}
      />
      <main className="flex-1 px-4 pb-24 pt-4 lg:px-6 lg:pb-6">
        <DashboardHeader />
        <div className="mt-4">{children}</div>
      </main>

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
