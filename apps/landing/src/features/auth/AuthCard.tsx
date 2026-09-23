import Link from "next/link";
import { ReactNode } from "react";

export const AuthCard = ({ children }: { children: ReactNode }) => (
  <main className="flex-1 flex items-center justify-center px-6 py-16">
    <div className="w-full max-w-sm">
      <Link href="/" className="text-sm text-muted hover:text-primary inline-block mb-6">
        ← Back to catalogue
      </Link>
      <div className="rounded-xl border border-muted/20 p-6">{children}</div>
    </div>
  </main>
);
