"use client";

import {Icon} from "@mcc/ui";
import {ApiWalletBalance} from "../services/wallet.service";

function Card({icon, label, value, accent, children}: {
  icon: string; label: string; value: number; accent: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-2xl border border-muted/25 p-4">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}>
          <Icon icon={icon} size={18} />
        </span>
        <span className="text-xs font-medium text-subtle">{label}</span>
      </div>
      <p className="text-2xl font-bold leading-none text-foreground">{value.toLocaleString()}</p>
      {children}
    </div>
  );
}

/** The three balances. Gems show how many were bought (they can buy courses) versus earned. */
export default function BalanceCards({balance}: {balance?: ApiWalletBalance}) {
  const b = balance ?? {gems: 0, points: 0, silver: 0, purchased_gems: 0, earned_gems: 0};
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card icon="ri:vip-diamond-fill" label="Gems" value={b.gems} accent="bg-sky-50 text-sky-600">
        <p className="text-[11px] leading-snug text-subtle">
          {b.purchased_gems.toLocaleString()} bought · {b.earned_gems.toLocaleString()} earned
        </p>
      </Card>
      <Card icon="solar:medal-star-bold" label="Points" value={b.points} accent="bg-amber-50 text-amber-600">
        <p className="text-[11px] text-subtle">Earned from quizzes, lessons and goals</p>
      </Card>
      <Card icon="solar:cup-star-bold" label="Silver" value={b.silver} accent="bg-slate-100 text-slate-600">
        <p className="text-[11px] text-subtle">From streak milestones</p>
      </Card>
    </div>
  );
}
