"use client";

import { useMemo } from "react";
import { cardHolderDisplayName, cardLastFourFromUserId } from "@/lib/auth-user";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";

export function Subscriptions() {
  const user = useAuthStore((s) => s.user);
  const cardHolderName = useMemo(() => (user ? cardHolderDisplayName(user) : "USER"), [user]);
  const cardLastFour = useMemo(() => cardLastFourFromUserId(user?.publicUserId), [user?.publicUserId]);

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] text-white shadow-lg">
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Credit Card</p>
        <p className="mt-6 font-mono text-2xl font-semibold tracking-[0.2em]">
          **** **** **** {cardLastFour}
        </p>
        <div className="mt-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60">Card Holder</p>
            <p className="font-mono text-base font-semibold">{cardHolderName}</p>
          </div>
          <div className="relative h-8 w-14">
            <span className="absolute right-0 top-0 size-8 rounded-full bg-white/85" />
            <span className="absolute left-0 top-0 size-8 rounded-full bg-white/55" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
