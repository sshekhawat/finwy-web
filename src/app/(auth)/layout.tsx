import { SiteHeader } from "@/components/marketing/site-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 font-sans dark:bg-background">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(108,99,255,0.22),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(108,99,255,0.08),transparent_50%),radial-gradient(ellipse_60%_40%_at_0%_80%,rgba(108,99,255,0.06),transparent_45%)]"
        aria-hidden
      />
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-14">
        {children}
      </main>
      <footer className="border-t border-slate-200/80 bg-white/80 py-4 text-center text-xs text-muted-foreground backdrop-blur-sm dark:border-border dark:bg-background/80">
        © {new Date().getFullYear()} Finwy. Secure access to your account.
      </footer>
    </div>
  );
}
