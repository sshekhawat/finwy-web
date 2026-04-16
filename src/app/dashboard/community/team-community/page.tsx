import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const teams = [
  { team: "North Zone", members: 18, growth: "+12%" },
  { team: "East Zone", members: 11, growth: "+8%" },
  { team: "South Zone", members: 14, growth: "+15%" },
];

export default function TeamCommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team Community</h1>
        <p className="text-sm text-muted-foreground">Overview of team-level community metrics.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Team Snapshot</CardTitle>
          <CardDescription>Track team participation and growth.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {teams.map((t) => (
            <div key={t.team} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium">{t.team}</p>
                <p className="text-xs text-muted-foreground">{t.members} members</p>
              </div>
              <Badge>{t.growth}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
