import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const profileCards = [
  { href: "/dashboard/profile/kyc", title: "KYC", desc: "Upload and verify your KYC details." },
  { href: "/dashboard/profile/bank", title: "Bank", desc: "Add and manage bank accounts." },
  { href: "/dashboard/profile/business-details", title: "Business Details", desc: "Company and GST information." },
  { href: "/dashboard/profile/personal-details", title: "Personal Details", desc: "Contact and identity details." },
];

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your KYC, bank, business, and personal details.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {profileCards.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full border border-slate-200 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-blue-700 dark:text-blue-400">Open section</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
