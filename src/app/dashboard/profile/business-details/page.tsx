import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BusinessDetailsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Business Details</h1>
        <p className="text-sm text-muted-foreground">Maintain your business profile and registration data.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>Details used for compliance and payout setup.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="biz-name">Business Name</Label><Input id="biz-name" placeholder="Finwy Solutions Pvt Ltd" /></div>
          <div className="space-y-2"><Label htmlFor="gst">GST Number</Label><Input id="gst" placeholder="27ABCDE1234F1Z5" /></div>
          <div className="space-y-2"><Label htmlFor="reg">Registration Number</Label><Input id="reg" placeholder="U12345DL2026PTC0001" /></div>
          <div className="space-y-2"><Label htmlFor="industry">Industry</Label><Input id="industry" placeholder="Fintech" /></div>
        </CardContent>
      </Card>
    </div>
  );
}
