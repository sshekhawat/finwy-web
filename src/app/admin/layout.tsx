import { DashboardAuthLayout } from "@/components/dashboard/dashboard-auth-layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardAuthLayout requireAdmin>{children}</DashboardAuthLayout>;
}
