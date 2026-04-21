import { StatsCards } from "@/components/dashboard/stats-cards";
import { Subscriptions } from "@/components/dashboard/subscriptions";
import { DashboardChart } from "@/components/dashboard/chart";
import { Transactions } from "@/components/dashboard/transactions";
import { ProfileCreditCard } from "@/components/dashboard/profile-credit-card";
import { RightPanelRest } from "@/components/dashboard/right-panel";

export default function DashboardHomePage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
      <div className="order-1 xl:order-none xl:col-start-2 xl:row-start-1">
        <ProfileCreditCard />
      </div>
      <section className="order-2 space-y-4 xl:order-none xl:col-span-1 xl:col-start-1 xl:row-span-2 xl:row-start-1">
        <StatsCards />
        <Subscriptions />
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardChart />
          <Transactions />
        </div>
      </section>
      <aside className="order-3 space-y-4 xl:order-none xl:col-start-2 xl:row-start-2">
        <RightPanelRest />
      </aside>
    </div>
  );
}
