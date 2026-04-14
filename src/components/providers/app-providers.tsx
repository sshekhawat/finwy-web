"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

/** Theme + toasts. API calls use `NEXT_PUBLIC_API_URL` from the browser. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
