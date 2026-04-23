import {
  Coins,
  FileCheck2,
  Gift,
  SunMedium,
  UserPlus,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const shortcuts = [
  { title: "Reward", icon: Gift },
  { title: "Digital Gold", icon: Coins },
  { title: "Daily Earn", icon: SunMedium },
  { title: "D-Coin", icon: Wallet },
  { title: "Nodues Credit", icon: FileCheck2 },
  { title: "My Referral", icon: UserPlus },
] as const;

export function StatsCards() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Explore Finwy</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                type="button"
                className="flex flex-col items-center gap-2 rounded-xl p-2 text-center transition hover:bg-slate-50"
              >
                <span className="grid size-14 place-items-center rounded-full bg-slate-100 text-[#6C63FF] ring-1 ring-slate-200/80">
                  <Icon className="size-6" strokeWidth={1.75} />
                </span>
                <span className="text-[11px] font-medium leading-tight text-slate-700 sm:text-xs">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
