import {Icon} from "@mcc/ui";
import Notifications from "./Notification";
import ThemeButton from "./ThemeButton";
import Link from "next/link";
import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useAuth} from "@mcc/features";
import {useRewardsBalance} from "@/src/features/rewards/hooks/useRewards";

export default function Header({
  setOpen,
  open,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const isBrainy = pathname.includes("brainy");
  const router = useRouter();
  const {logoutMutation} = useAuth();
  const {data: balance} = useRewardsBalance();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => router.replace("/login"),
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`w-full flex items-center justify-between py-6.5 px-8 max-sm:px-4 max-sm:py-3 dark:border-b border-b-muted/40  dark:shadow-muted/20 ${isMobile && isBrainy && "hidden!"}`}
    >
      <div className="flex items-center gap-4 max-sm:gap-2">
        <button
          onClick={() => setOpen(!open)}
          className="rounded-full border border-muted/30 p-2 sm:hidden shadow-md dark:shadow-muted/20"
        >
          <Icon icon={open ? "line-md:close" : "tabler:menu-3"} size={24} />
        </button>
        <Link href="/dashboard" className="text-xl max-sm:text-lg whitespace-nowrap cursor-pointer">
          <span className="text-primary font-bagel">MC. </span>
          Companion
        </Link>
      </div>
      <div className="flex items-center gap-5 max-sm:gap-3">
        <Link
          href="/wallet"
          aria-label={`Wallet: ${balance?.total_points ?? 0} points, ${balance?.total_gems ?? 0} gems`}
          className="flex items-center gap-2.5 max-sm:gap-1.5 rounded-full border border-muted/30 px-3 max-sm:px-2 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/10"
        >
          <span className="flex items-center gap-1"><Icon icon="solar:medal-star-bold" size={14} className="text-amber-500" />{(balance?.total_points ?? 0).toLocaleString()}</span>
          <span className="flex items-center gap-1"><Icon icon="ri:vip-diamond-fill" size={14} className="text-sky-500" />{(balance?.total_gems ?? 0).toLocaleString()}</span>
        </Link>
        <Notifications />
        <ThemeButton />
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          aria-label="Log out"
          title="Log out"
          className="rounded-full p-2 text-foreground transition-colors hover:bg-muted/20 disabled:opacity-50"
        >
          <Icon icon="tabler:logout" size={22} />
        </button>
      </div>
    </div>
  );
}
