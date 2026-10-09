import Link from "next/link";
import { ChildList } from "@/src/features/children/ChildList";

export default function ChildrenPage() {
  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold mb-1">My children</h1>
          <p className="text-sm text-muted">Select a child to see their progress.</p>
        </div>
        <Link
          href="/children/new"
          className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Add another child
        </Link>
      </div>
      <ChildList />
    </div>
  );
}
