import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { href: "/dashboard/community/my-community", title: "My Community", desc: "Your referrals, engagement, and member activity." },
  { href: "/dashboard/community/team-community", title: "Team Community", desc: "Team growth, performance, and leaderboard." },
];

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Community</h1>
        <p className="text-sm text-muted-foreground">Manage and grow your community network.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((item) => (
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
