import {RoleLayout} from "@/src/components/RoleLayout";
import Explore from "@/src/features/dashboard/components/Explore";

export default function DashboardPage() {
  return (
    <RoleLayout allowedRoles={["learner"]}>
      <Explore />
    </RoleLayout>
  );
}
