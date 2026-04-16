import { DashboardAuthLayout } from "@/components/dashboard/dashboard-auth-layout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardAuthLayout>{children}</DashboardAuthLayout>;
}
