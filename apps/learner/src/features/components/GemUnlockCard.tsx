"use client";

import Link from "next/link";
import {Button, Icon} from "@mcc/ui";
import {gemsApply, type LiveFormat} from "@/src/features/courses/helper/liveFormats";
import {courseGemCost} from "@/src/features/wallet/helper/wallet";
import {useGemPacks, useWalletBalance} from "@/src/features/wallet/hooks/useWallet";

interface GemUnlockCardProps {
  /** What the way of learning picked costs in Naira (the default tier's price). */
  price: number;
  format: LiveFormat | null;
  /** What is being bought, for the sentence: "course" or "program". */
  noun: "course" | "program";
  pending: boolean;
  onUnlock: () => void;
}

/**
 * "Or pay with gems" on a paid course or exam program. It is always offered for something that costs money, so a
 * buyer can see the choice exists: gems buy the self-paced option only, and only gems bought with money count,
 * and the card says which of those is in the way when it is.
 */
export function GemUnlockCard({price, format, noun, pending, onUnlock}: GemUnlockCardProps) {
  const {data: balance} = useWalletBalance();
  const {data: packs} = useGemPacks();
  if (!(price > 0) || !packs) return null;

  const cost = courseGemCost(price, packs.naira_per_gem);
  const owned = balance?.purchased_gems ?? 0;
  const applies = gemsApply(format);
  const canUnlock = applies && cost > 0 && owned >= cost;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-muted/30 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Icon icon="ri:vip-diamond-fill" size={16} className="text-sky-500" />
        Or unlock it with {cost.toLocaleString()} gems
      </p>
      {!applies ? (
        <p className="text-xs text-subtle">Gems unlock the self-paced option. Choose Self-paced above to use your gems.</p>
      ) : (
        <p className="text-xs text-subtle">
          Only gems you bought can unlock a {noun}. You have {owned.toLocaleString()} bought gem{owned === 1 ? "" : "s"}.
        </p>
      )}
      {applies &&
        (canUnlock ? (
          <Button onClick={onUnlock} disabled={pending} width="fit" variant="outline">
            <span className="px-4">{pending ? "Unlocking…" : `Unlock for ${cost.toLocaleString()} gems`}</span>
          </Button>
        ) : (
          <Link href="/wallet" className="text-sm font-semibold text-violet-600 underline underline-offset-2 w-fit">
            {owned > 0 ? `Buy ${(cost - owned).toLocaleString()} more gems` : "Buy gems"}
          </Link>
        ))}
    </div>
  );
}
