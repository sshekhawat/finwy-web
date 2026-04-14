import { ArrowDownRight, ArrowUpRight, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const cards = [
  {
    title: "Income",
    value: "$12,000",
    change: "+2.36%",
    positive: true,
    icon: TrendingUp,
  },
  {
    title: "Outcome",
    value: "$12,000",
    change: "-2.36%",
    positive: false,
    icon: TrendingDown,
  },
  {
    title: "Revenue",
    value: "$4,000",
    change: "+2.36%",
    positive: true,
    icon: DollarSign,
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-slate-500">{item.title}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{item.value}</p>
                <p
                  className={`mt-1 inline-flex items-center text-xs font-medium ${
                    item.positive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {item.positive ? <ArrowUpRight className="mr-1 size-3" /> : <ArrowDownRight className="mr-1 size-3" />}
                  {item.change}
                </p>
              </div>
              <div className="rounded-xl bg-[#6C63FF]/10 p-3 text-[#6C63FF]">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
