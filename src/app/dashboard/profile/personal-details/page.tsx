import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PersonalDetailsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Personal Details</h1>
        <p className="text-sm text-muted-foreground">Keep your personal contact profile up to date.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Used for alerts and account communication.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="full-name">Full Name</Label><Input id="full-name" placeholder="Surender Singh" /></div>
          <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" placeholder="+91 98XXXXXXXX" /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="email">Email</Label><Input id="email" placeholder="you@example.com" /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="city">City</Label><Input id="city" placeholder="New Delhi" /></div>
        </CardContent>
      </Card>
    </div>
  );
}
