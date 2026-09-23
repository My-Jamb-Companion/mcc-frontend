import {Icon} from "@mcc/ui";
import Notifications from "./Notification";
import ThemeButton from "./ThemeButton";
import Link from "next/link";
import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useAuth} from "@mcc/features";

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
      <div className="flex items-center gap-4">
        <button
          onClick={() => setOpen(!open)}
          className="rounded-full border border-muted/30 p-2 sm:hidden shadow-md dark:shadow-muted/20"
        >
          <Icon icon={open ? "line-md:close" : "tabler:menu-3"} size={24} />
        </button>
        <Link href="/dashboard" className="text-xl cursor-pointer">
          <span className="text-primary font-bagel">MC. </span>
          Companion
        </Link>
      </div>
      <div className="flex items-center gap-5">
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
