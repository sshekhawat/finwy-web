import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BankPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bank</h1>
        <p className="text-sm text-muted-foreground">Link and verify payout bank accounts.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add Bank Account</CardTitle>
          <CardDescription>Use this section for account mapping and verification.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="holder">Account Holder</Label><Input id="holder" placeholder="Your Name" /></div>
          <div className="space-y-2"><Label htmlFor="account">Account Number</Label><Input id="account" placeholder="XXXXXXXXXXXX" /></div>
          <div className="space-y-2"><Label htmlFor="ifsc">IFSC</Label><Input id="ifsc" placeholder="HDFC0001234" /></div>
          <div className="space-y-2"><Label htmlFor="bank-name">Bank Name</Label><Input id="bank-name" placeholder="HDFC Bank" /></div>
        </CardContent>
      </Card>
    </div>
  );
}
