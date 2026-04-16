"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BadgeIndianRupee,
  Building,
  ChartNoAxesColumn,
  ChevronLeft,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
};

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

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  collapsed: boolean;
}) {
  const content = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all",
        active
          ? "bg-[#6C63FF]/15 text-[#6C63FF] shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <motion.span
        animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
        className="overflow-hidden whitespace-nowrap"
      >
        {label}
      </motion.span>
    </Link>
  );

  if (!collapsed) return content;
  return (
    <Tooltip>
      <TooltipTrigger render={content} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({ collapsed, onToggle, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <motion.aside
        animate={{ width: collapsed ? 90 : 290 }}
        transition={{ duration: 0.24, ease: "easeInOut" }}
        className="hidden shrink-0 border-r border-slate-200 bg-white p-4 lg:block"
      >
        <div className="mb-6 flex items-center justify-between">
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
            className="overflow-hidden whitespace-nowrap text-lg font-semibold text-slate-800"
          >
            Finwy Panel
          </motion.div>
          <button
            onClick={onToggle}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-100"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        <div className="space-y-1">
          <SidebarLink
            href="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            active={pathname === "/dashboard"}
            collapsed={collapsed}
          />
        </div>

        <div className="mt-5">
          <motion.p
            animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
            className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400"
          >
            Profile
          </motion.p>
          <div className="space-y-1">
            {profileLinks.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActivePath(pathname, item.href)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <motion.p
            animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
            className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400"
          >
            Community
          </motion.p>
          <div className="space-y-1">
            {communityLinks.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActivePath(pathname, item.href)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-1">
          {singleLinks.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActivePath(pathname, item.href)}
              collapsed={collapsed}
            />
          ))}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="size-4 shrink-0" />
            <motion.span
              animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
              className="overflow-hidden whitespace-nowrap"
            >
              Logout
            </motion.span>
          </button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
