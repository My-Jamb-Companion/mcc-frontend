import { ReactNode } from "react";

export const AuthCard = ({ children }: { children: ReactNode }) => (
  <main className="flex-1 flex items-center justify-center px-6 py-16">
    <div className="w-full max-w-sm">
      <p className="text-center text-2xl font-semibold text-primary mb-6">MCC Teacher</p>
      <div className="rounded-xl border border-muted/20 p-6">{children}</div>
    </div>
  </main>
);
