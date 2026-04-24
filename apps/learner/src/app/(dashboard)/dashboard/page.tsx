import { RoleLayout } from "@/src/components/RoleLayout";

export default function DashboardPage() {
  return (
    <RoleLayout allowedRoles={["student"]}>
      <div>Welcome Learner Dashboard</div>
    </RoleLayout>
  );
}
