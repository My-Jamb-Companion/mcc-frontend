import { ChildList } from "@/src/features/children/ChildList";

export default function ChildrenPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">My children</h1>
      <p className="text-sm text-muted mb-6">Select a child to see their progress.</p>
      <ChildList />
    </div>
  );
}
