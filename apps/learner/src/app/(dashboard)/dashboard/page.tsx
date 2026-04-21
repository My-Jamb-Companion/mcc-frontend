import { RoleLayout } from "@/src/components/RoleLayout";

export default function DashboardPage() {
  return (
    <RoleLayout allowedRoles={["learner"]}>
      <div>Welcome Learner Dashboard</div>
    </RoleLayout>
  );
}
