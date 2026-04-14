import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const rows = [
  { source: "Referral Bonus", amount: "?1,250", date: "10 Apr 2026", status: "Settled" },
  { source: "Cashback", amount: "?320", date: "08 Apr 2026", status: "Settled" },
  { source: "Team Reward", amount: "?900", date: "05 Apr 2026", status: "Pending" },
];

export default function IncomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Income</h1>
        <p className="text-sm text-muted-foreground">Track rewards, referral income, and payouts.</p>
      </div>
      <Card className="border-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
        <CardHeader>
          <CardDescription className="text-white/80">This Month</CardDescription>
          <CardTitle className="text-3xl font-bold">?2,470</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
          <CardDescription>Recent earnings in your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((r) => (
            <div key={`${r.source}-${r.date}`} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium">{r.source}</p>
                <p className="text-xs text-muted-foreground">{r.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{r.amount}</p>
                <Badge variant={r.status === "Settled" ? "default" : "secondary"}>{r.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
