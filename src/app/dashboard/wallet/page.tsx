import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Wallet</h1>
        <p className="text-sm text-muted-foreground">Manage your balance, payouts, and transfer history.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardHeader>
            <CardDescription className="text-white/80">Available Balance</CardDescription>
            <CardTitle className="text-3xl">?18,420</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Credits</CardDescription>
            <CardTitle className="text-2xl">?62,300</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Debits</CardDescription>
            <CardTitle className="text-2xl">?43,880</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Activity</CardTitle>
          <CardDescription>Recent wallet operations in demo mode.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["Cashback Credit", "+?320", "09 Apr 2026"],
            ["Wallet Transfer", "-?700", "08 Apr 2026"],
            ["Referral Reward", "+?500", "06 Apr 2026"],
          ].map(([title, amount, date]) => (
            <div key={`${title}-${date}`} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">{date}</p>
              </div>
              <p className="font-semibold">{amount}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
