import { Suspense } from "react";
import { TeamCommunityClient } from "@/components/dashboard/team-community-client";

export default function TeamCommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-500">Loading…</div>
      }
    >
      <TeamCommunityClient />
    </Suspense>
  );
}
