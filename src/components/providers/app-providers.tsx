"use client";

import { ThemeProvider } from "next-themes";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";
import { Toaster } from "@/components/ui/sonner";

/** Theme + session bootstrap + toasts. API calls use `NEXT_PUBLIC_API_URL` from the browser. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthSessionProvider>
        {children}
        <Toaster richColors position="top-center" />
      </AuthSessionProvider>
    </ThemeProvider>
  );
}
