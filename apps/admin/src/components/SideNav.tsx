"use client";

import {AnimatePresence, Icon, motion} from "@mcc/ui";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import {canOpen} from "@/src/features/admin-access/helper/access";
import {useMyAccess} from "@/src/features/admin-access/hooks/useAdminAccess";
import {useUnreadMessages} from "@/src/features/Messaging/hooks/useConversations";

interface NavChild {
  key: string;
  label: string;
  href: string;
}

interface NavEntry {
  key: string;
  icon: string;
  label: string;
  /** Leaf item: clicking the icon navigates straight there. */
  href?: string;
  /** Parent item: clicking the icon opens a flyout of these instead of
   * navigating anywhere itself. */
  children?: NavChild[];
  /** Open the flyout upward (anchored to the icon's bottom). For entries at
   * the foot of the rail, where a flyout that grows downward runs off-screen. */
  flyoutUp?: boolean;
}

// Every dashboard section as one flat, ordered rail -- the old split
// between a handful of top-level route icons and a second, wide, collapsible
// panel of text-only links (shown only on /dashboard/* routes) is gone.
// Every entry now has its own icon; a leaf's name shows as a hover tooltip,
// a parent's children show in a click-to-open flyout.
const NAV_ENTRIES: NavEntry[] = [
  {
    key: "dashboard",
    icon: "material-symbols:dashboard-outline-rounded",
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    key: "performance",
    icon: "ri:bar-chart-2-line",
    label: "Performance Overview",
    href: "/dashboard/performance",
  },
  {
    key: "live-sessions",
    icon: "material-symbols:video-chat-outline",
    label: "Live sessions",
    href: "/dashboard/live-sessions",
  },
  {
    key: "ai-studio",
    icon: "ri:robot-2-line",
    label: "AI studio analysis",
    href: "/dashboard/ai-studio",
  },
  {
    key: "teachers",
    icon: "ri:user-star-line",
    label: "Teachers",
    href: "/dashboard/teachers",
  },
  {
    key: "cra",
    icon: "ri:customer-service-2-line",
    label: "CRAs",
    href: "/dashboard/cra",
  },
  {
    key: "programs",
    icon: "ri:book-shelf-line",
    label: "Programs",
    children: [
      {key: "exam-program", label: "Exam program", href: "/dashboard/exam-program"},
      {key: "courses", label: "Courses", href: "/dashboard/courses"},
      {key: "exam-catalog", label: "Exams & subjects", href: "/dashboard/exam-program/catalog"},
      {key: "categories", label: "Categories", href: "/dashboard/categories"},
      {key: "question-bank", label: "Question Bank", href: "/dashboard/question-bank"},
      {key: "landing", label: "Landing page", href: "/dashboard/landing"},
      {key: "legal", label: "Legal pages", href: "/dashboard/legal"},
    ],
  },
  {
    key: "students",
    icon: "ri:graduation-cap-line",
    label: "Students",
    children: [
      {
        key: "active-students",
        label: "Active Students",
        href: "/dashboard/students/active-students",
      },
      {
        key: "prospective-students",
        label: "Prospective Students",
        href: "/dashboard/students/prospective-students",
      },
    ],
  },
  {
    key: "finance",
    icon: "ri:money-dollar-box-line",
    label: "Finance",
    href: "/finance",
  },
  {
    key: "messaging",
    icon: "ri:message-2-line",
    label: "Messaging",
    href: "/messaging",
  },
  {
    key: "gamification",
    icon: "ri:trophy-line",
    label: "Gamification",
    href: "/dashboard/gamification",
  },
  {
    key: "moderation",
    icon: "ri:flag-2-line",
    label: "Moderation",
    href: "/moderation",
  },
  {
    key: "users",
    icon: "ri:group-line",
    label: "Users",
    href: "/users",
  },
];

// Only routes that exist: Next prefetches every link in view, so a link to a
// missing page 404s on every page load, in the console and the network log.
const BOTTOM_ENTRY: NavEntry = {
  key: "account",
  icon: "solar:settings-broken",
  label: "Account",
  flyoutUp: true,
  children: [
    {key: "settings", label: "Settings", href: "/settings"},
    {key: "profile", label: "User Profile", href: "/profile"},
  ],
};

function isEntryActive(pathname: string | null, entry: NavEntry): boolean {
  if (entry.href) {
    return pathname === entry.href || (pathname?.startsWith(entry.href) ?? false);
  }
  return entry.children?.some((child) => pathname === child.href) ?? false;
}

/** The number of messages from students and teachers nobody has opened yet, on the Messaging icon. */
function MessagesBadge() {
  const {data: unread = 0} = useUnreadMessages();
  if (unread <= 0) return null;
  return (
    <span
      aria-label={`${unread} unread messages`}
      className="pointer-events-none absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold leading-4 text-white"
    >
      {unread > 99 ? "99+" : unread}
    </span>
  );
}

function NavIcon({
  entry,
  isOpen,
  onToggle,
  pathname,
}: {
  entry: NavEntry;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string | null;
}) {
  const active = isEntryActive(pathname, entry);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Where an upward flyout sits, in viewport coordinates, worked out when it is opened.
  const [upwardAt, setUpwardAt] = useState<{left: number; bottom: number} | null>(null);

  function handleClick() {
    if (entry.flyoutUp && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Grow upward from the icon, but never below the bottom of the window: in a short
      // window the icon itself can sit past the edge, and the menu must still be visible.
      setUpwardAt({left: rect.right + 8, bottom: Math.max(8, window.innerHeight - rect.bottom)});
    }
    onToggle();
  }

  if (entry.children) {
    return (
      <div className="group relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleClick}
          aria-label={entry.label}
          aria-expanded={isOpen}
          className={`flex justify-center rounded-lg p-2.5 transition-all duration-300 ease-out cursor-pointer w-fit ${
            isOpen || active ? "bg-white shadow-sm" : ""
          }`}
        >
          <Icon icon={entry.icon} />
        </button>

        {!isOpen && (
          <span className="pointer-events-none absolute left-full top-1/2 z-40 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
            {entry.label}
          </span>
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{opacity: 0, y: entry.flyoutUp ? -6 : 6}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: entry.flyoutUp ? -6 : 6}}
              transition={{duration: 0.15}}
              style={entry.flyoutUp && upwardAt ? {left: upwardAt.left, bottom: upwardAt.bottom} : undefined}
              className={`${entry.flyoutUp ? "fixed" : "absolute top-0 left-full ml-2"} z-50 w-48 overflow-hidden rounded-xl border border-muted/20 bg-white py-1 shadow-lg`}
            >
              <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {entry.label}
              </p>
              {entry.children.map((child) => {
                const isChildActive = pathname === child.href;
                return (
                  <Link
                    key={child.key}
                    href={child.href}
                    onClick={onToggle}
                    className={`block px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                      isChildActive
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={entry.href!}
        className={`flex justify-center rounded-lg p-2.5 transition-all duration-300 ease-out cursor-pointer w-fit ${
          active ? "bg-white shadow-sm" : ""
        }`}
      >
        <Icon icon={entry.icon} />
      </Link>
      {entry.key === "messaging" && <MessagesBadge />}
      <span className="pointer-events-none absolute left-full top-1/2 z-40 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {entry.label}
      </span>
    </div>
  );
}

export default function SideNav() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const {data: access} = useMyAccess();
  // Only what this admin can open. Unknown access (still loading, or the server can't say) shows everything.
  const visibleEntries = NAV_ENTRIES.map((entry) =>
    entry.children ? {...entry, children: entry.children.filter((c) => canOpen(access, c.href))} : entry,
  ).filter((entry) => (entry.children ? entry.children.length > 0 : canOpen(access, entry.href)));
  // The gear always has the profile; Settings only for admins who can open it.
  const bottomEntry = {...BOTTOM_ENTRY, children: BOTTOM_ENTRY.children!.filter((c) => canOpen(access, c.href))};
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!openKey) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpenKey(null);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenKey(null);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openKey]);

  // Route changes (a child link was followed, or the browser back/forward
  // button fired) should close whatever's open. Adjusted during render
  // rather than in an effect -- React's own recommended pattern for
  // resetting state when a value changes ("Adjusting state when a prop
  // changes", not a ref -- reading a ref's .current during render is its
  // own lint error) -- so this doesn't cost an extra render.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (openKey !== null) setOpenKey(null);
  }

  return (
    <aside className="flex max-sm:hidden w-[60px] h-full shrink-0">
      <div
        ref={containerRef}
        className="w-full flex flex-col items-center border-r border-muted/20 px-2 pb-5"
      >
        <div className="w-full flex flex-col items-center justify-center mb-2 py-4.5">
          <h2 className="text-lg font-bagel text-primary">MCC</h2>
        </div>

        <div className="flex flex-col justify-between gap-4 h-full w-full items-center">
          {/* No overflow/scroll here on purpose -- a tooltip or flyout
              positioned outside this column (left-full) needs the x-axis to
              stay visible, and CSS overflow-y-auto would clip that too
              (setting one axis clips both). All 13 entries comfortably fit
              without scrolling at any real viewport height. */}
          <div className="flex flex-col items-center gap-3 py-1">
            {visibleEntries.map((entry) => (
              <NavIcon
                key={entry.key}
                entry={entry}
                isOpen={openKey === entry.key}
                onToggle={() =>
                  setOpenKey((prev) => (prev === entry.key ? null : entry.key))
                }
                pathname={pathname}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 shrink-0">
            <NavIcon
              entry={bottomEntry}
              isOpen={openKey === bottomEntry.key}
              onToggle={() =>
                setOpenKey((prev) => (prev === bottomEntry.key ? null : bottomEntry.key))
              }
              pathname={pathname}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
