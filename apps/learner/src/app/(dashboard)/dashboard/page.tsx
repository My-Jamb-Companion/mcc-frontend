import { RoleLayout } from "@/src/components/RoleLayout";
import Dashboard from "@/src/features/dashboard/components/Dashboard";

export default function DashboardPage() {
  return (
    <RoleLayout allowedRoles={["student"]}>
      <Dashboard/>
    </RoleLayout>
  );
}
