"use client";

import { useEffect, useMemo, useState } from "react";
import { Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { buildRegisterReferralUrl, referralSignupShareText } from "@/lib/referral-links";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.123 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

async function copyText(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Could not copy — try again or copy manually.");
  }
}

type ReferralShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReferralShareDialog({ open, onOpenChange }: ReferralShareDialogProps) {
  const publicUserId = useAuthStore((s) => s.user?.publicUserId?.trim() ?? "");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (open && typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, [open]);

  const signupUrl = useMemo(() => {
    if (!publicUserId || !origin) return "";
    return buildRegisterReferralUrl(origin, publicUserId);
  }, [origin, publicUserId]);

  const shareText = useMemo(
    () => (publicUserId && signupUrl ? referralSignupShareText(publicUserId, signupUrl) : ""),
    [publicUserId, signupUrl],
  );

  const waHref = useMemo(() => {
    if (!shareText) return "";
    return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  }, [shareText]);

  const onCopyCode = () => copyText("Sponsor ID", publicUserId);
  const onCopyUrl = () => copyText("Signup link", signupUrl);

  if (!publicUserId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-[min(100%-1.5rem,22rem)] gap-0 overflow-hidden border-0 bg-transparent p-0 shadow-xl ring-0 sm:max-w-md"
      >
        <DialogTitle className="sr-only">Your referral code and share options</DialogTitle>
        <div className="relative overflow-hidden rounded-2xl bg-[#0d9488] px-5 pb-6 pt-5 text-white shadow-inner">
          <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-white/10" aria-hidden />
          <div className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-black/10" aria-hidden />

          <h2 className="relative text-lg font-bold tracking-tight">Your Referral Code</h2>
          <p className="relative mt-1 text-xs text-white/85">Friends enter this as Sponsor ID when they register.</p>

          <div className="relative mt-4 flex overflow-hidden rounded-xl shadow-md">
            <div className="min-w-0 flex-1 bg-white px-3 py-3 font-mono text-sm font-semibold tracking-wide text-slate-900">
              {publicUserId}
            </div>
            <button
              type="button"
              onClick={onCopyCode}
              className="shrink-0 bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#172554]"
            >
              Copy
            </button>
          </div>

          <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/95 px-3 py-3 text-slate-900 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Share2 className="size-4" strokeWidth={2.25} aria-hidden />
              </span>
              <span className="text-sm font-bold text-slate-800">Share refer code</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={waHref || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "grid size-11 place-items-center rounded-full bg-[#25D366] text-white shadow-sm transition hover:brightness-110",
                  !waHref && "pointer-events-none opacity-50",
                )}
                aria-label="Share on WhatsApp"
              >
                <WhatsAppIcon className="size-6" />
              </a>
              <button
                type="button"
                onClick={onCopyUrl}
                disabled={!signupUrl}
                className="grid size-11 place-items-center rounded-full bg-[#2563eb] text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:opacity-50"
                aria-label="Copy signup link"
              >
                <Link2 className="size-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
