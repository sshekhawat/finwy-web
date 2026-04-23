import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Transactions() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-slate-400">
          <Receipt className="size-8" strokeWidth={1.25} />
          <p className="text-sm">No transactions</p>
        </div>
      </CardContent>
    </Card>
  );
}
