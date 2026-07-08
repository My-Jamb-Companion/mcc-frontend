import {Icon} from "@mcc/ui";
import Notifications from "./Notification";
import ThemeButton from "./ThemeButton";
import Link from "next/link";

export default function Header({
  setOpen,
  open,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <div className="w-full flex items-center justify-between py-6.5 px-8 max-sm:px-4 max-sm:py-3 dark:border-b border-b-muted/40  dark:shadow-muted/20">
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
      </div>
    </div>
  );
}
