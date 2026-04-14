import { ShoppingBag, Utensils, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const transactions = [
  { name: "Amazon", date: "Today, 11:20 AM", amount: "$360", icon: ShoppingBag },
  { name: "McDonald's", date: "Today, 09:10 AM", amount: "$12", icon: Utensils },
  { name: "Google Ads", date: "Yesterday, 04:02 PM", amount: "$12", icon: Megaphone },
];

export function Transactions() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.date}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-800">{item.amount}</p>
              </div>
              {idx !== transactions.length - 1 && <div className="h-px bg-slate-100" />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
