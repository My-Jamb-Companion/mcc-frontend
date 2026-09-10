"use client";

import Link from "next/link";
import { useChildren } from "./useChildren";

export const ChildList = () => {
  const { data: children, isLoading, isError } = useChildren();

  if (isLoading) {
    return <p className="text-sm text-muted">Loading your children…</p>;
  }

  if (isError) {
    return <p className="text-sm text-danger">Couldn&apos;t load your children. Try again shortly.</p>;
  }

  if (!children || children.length === 0) {
    return (
      <p className="text-sm text-muted">
        No children linked to your account yet. They&apos;re added when you sign up a child
        through the combined registration form.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {children.map((child) => (
        <li key={child.child_id}>
          <Link
            href={`/children/${child.child_id}`}
            className="flex items-center justify-between rounded-lg border border-muted/20 px-4 py-3 hover:border-primary/40 transition-colors"
          >
            <div>
              <p className="font-medium">{child.full_name || child.email}</p>
              <p className="text-sm text-muted">{child.email}</p>
            </div>
            <span className="text-xs rounded-full px-2 py-0.5 bg-muted/10 text-muted capitalize">
              {child.relationship}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};
