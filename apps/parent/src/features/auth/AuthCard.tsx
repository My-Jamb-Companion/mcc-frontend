import { BrandLogo } from "@mcc/ui";
import { ReactNode } from "react";

export const AuthCard = ({ children }: { children: ReactNode }) => (
  <main className="flex-1 flex items-center justify-center px-6 py-16">
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center gap-1">
        <BrandLogo height={40} />
        <p className="text-sm font-semibold text-muted">Parent portal</p>
      </div>
      <div className="rounded-xl border border-muted/20 p-6">{children}</div>
    </div>
  </main>
);
