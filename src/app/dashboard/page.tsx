import { StatsCards } from "@/components/dashboard/stats-cards";
import { Subscriptions } from "@/components/dashboard/subscriptions";
import { DashboardChart } from "@/components/dashboard/chart";
import { Transactions } from "@/components/dashboard/transactions";
import { RightPanel } from "@/components/dashboard/right-panel";

export default function DashboardHomePage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-4">
        <StatsCards />
        <Subscriptions />
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardChart />
          <Transactions />
        </div>
      </section>
      <aside className="space-y-4">
        <RightPanel />
      </aside>
    </div>
  );
}
