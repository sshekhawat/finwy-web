import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const members = [
  { name: "Aman Sharma", joined: "2 days ago", status: "Active" },
  { name: "Riya Verma", joined: "1 week ago", status: "Pending" },
  { name: "Kunal Jain", joined: "2 weeks ago", status: "Active" },
];

export default function MyCommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Community</h1>
        <p className="text-sm text-muted-foreground">Recent members in your community.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Community Members</CardTitle>
          <CardDescription>Demo data for user panel visualization.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((m) => (
            <div key={m.name} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">Joined {m.joined}</p>
              </div>
              <Badge variant={m.status === "Active" ? "default" : "secondary"}>{m.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
