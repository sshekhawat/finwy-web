import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthPageShellProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Shared card shell for sign-in, register, OTP, and password flows.
 * Keeps auth pages visually aligned with Finwy marketing (purple accent).
 */
export function AuthPageShell({ children, className }: AuthPageShellProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.12),0_0_0_1px_rgba(108,99,255,0.08)] backdrop-blur-md dark:border-border/80 dark:bg-card/95 dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(108,99,255,0.12)]",
        className,
      )}
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#6C63FF] via-[#8b84ff] to-[#6C63FF]" aria-hidden />
      <div className="px-6 py-7 sm:px-8 sm:py-8">{children}</div>
    </div>
  );
}
