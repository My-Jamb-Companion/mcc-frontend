import {RoleLayout} from "@/src/components/RoleLayout";
import Explore from "@/src/features/explore/components/Explore";

export const metadata = {
  title: "Explore",
};

export default function ExplorePage() {
  return (
    <RoleLayout allowedRoles={["student"]}>
      <Explore />
    </RoleLayout>
  );
}
