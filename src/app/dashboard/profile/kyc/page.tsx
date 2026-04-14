import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function KycPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">KYC</h1>
        <p className="text-sm text-muted-foreground">Complete your identity verification to unlock higher limits.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>Demo form for user panel UI.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="pan">PAN Number</Label><Input id="pan" placeholder="ABCDE1234F" /></div>
          <div className="space-y-2"><Label htmlFor="aadhaar">Aadhaar</Label><Input id="aadhaar" placeholder="XXXX XXXX XXXX" /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="address">Address</Label><Input id="address" placeholder="Street, City, State" /></div>
        </CardContent>
      </Card>
    </div>
  );
}
