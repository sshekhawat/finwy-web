import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
          <CardTitle className="text-3xl font-bold">₹0</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
          <CardDescription>No income records available right now.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-muted-foreground">
            No data found
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
