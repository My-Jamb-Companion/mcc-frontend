"use client";

import {useEffect, useState} from "react";
import {Icon} from "@mcc/ui";
import {useWalletBalance} from "../hooks/useWallet";
import BalanceCards from "./BalanceCards";
import BuyGems from "./BuyGems";
import ConvertPanel from "./ConvertPanel";
import WalletHistory from "./WalletHistory";

const TABS = [
  {key: "buy", label: "Buy gems", icon: "ri:vip-diamond-fill"},
  {key: "convert", label: "Convert", icon: "solar:transfer-horizontal-bold"},
  {key: "history", label: "History", icon: "solar:history-bold"},
] as const;

type Tab = (typeof TABS)[number]["key"];

export default function Wallet() {
  const {data: balance, isError} = useWalletBalance();
  const [tab, setTab] = useState<Tab>("buy");
  const [justPaid, setJustPaid] = useState(false);

  // Flutterwave's callback page sends a student here with ?paid=<tx_ref> once their gems are confirmed.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid")) {
      setJustPaid(true);
      setTab("history");
      window.history.replaceState(null, "", "/wallet");
    }
  }, []);

  return (
    <section className="max-md:px-4 pb-20 pt-10">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6">
        <header>
          <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
          <p className="text-sm text-subtle">Your gems, points and silver, in one place.</p>
        </header>

        {justPaid && (
          <p role="status" className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
            <Icon icon="solar:check-circle-bold" size={18} />
            Payment received — your gems are in your wallet. A receipt is in your email and below.
          </p>
        )}
        {isError && <p className="text-sm text-red-600">Your balances couldn&apos;t be loaded. Please refresh.</p>}

        <BalanceCards balance={balance} />

        <div className="flex gap-2 overflow-x-auto" role="tablist">
          {TABS.map(({key, label, icon}) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs md:text-sm font-medium transition-colors ${
                tab === key ? "border border-muted/30" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon icon={icon} size={14} />
              {label}
            </button>
          ))}
        </div>

        {tab === "buy" && <BuyGems />}
        {tab === "convert" && <ConvertPanel balance={balance} />}
        {tab === "history" && <WalletHistory />}
      </div>
    </section>
  );
}
