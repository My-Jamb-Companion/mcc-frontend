import { RoleLayout } from "@/components/RoleLayout";

export default function DashboardPage() {
  return (
    <RoleLayout allowedRoles={["admin"]}>
      <div>Welcome Admin Dashboard</div>
    </RoleLayout>
  );
}