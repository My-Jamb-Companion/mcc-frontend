"use client";

import {AnimatePresence, Button, Icon, motion} from "@mcc/ui";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";

export default function SideNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["programs"]));

  const pathname = usePathname();

  // Check if current path belongs to the dashboard route hierarchy
  const isDashboardRoute = pathname?.startsWith("/dashboard") ?? false;

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <motion.aside
      layout
      transition={{
        layout: {
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      className="flex max-sm:hidden w-full max-w-[280px] h-full"
    >
      <div className="w-[60px] flex flex-col items-center border-r border-muted/20 px-2 pb-5">
        <div className="w-full flex flex-col items-center justify-center mb-4 py-4.5">
          <h2 className="text-lg font-bagel text-primary">MCC</h2>
        </div>

        <div className="flex flex-col justify-between gap-4 h-full">
          <div className="flex flex-col items-center gap-4">
            {navs.routenav.map((item, idx) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href);

              return (
                <Link
                  href={item.href}
                  key={idx}
                  className={`flex justify-center rounded-lg p-2.5 transition-all duration-300 ease-out cursor-pointer w-fit ${
                    isActive ? "bg-white shadow-sm" : ""
                  }`}
                >
                  <Icon icon={item.icon} />
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-4">
            {navs.bottomNav.map((item, idx) => (
              <Link
                href={item.href}
                key={idx}
                className={`flex justify-center rounded-lg p-2.5 transition-all duration-300 ease-out cursor-pointer w-fit`}
              >
                {item.label === "profile" ? (
                  <div className="relative rounded-full h-8 w-8 border border-muted/30">
                    <Image src="" fill alt="profile-pic" />
                  </div>
                ) : (
                  <Icon icon={item.icon} />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {isDashboardRoute && (
        <motion.div
          animate={{
            width: open ? 220 : 52,
          }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="overflow-hidden border-r border-muted/20"
        >
          <div className="flex items-center justify-between px-3 py-4.5 border-b border-muted/30">
            <AnimatePresence mode="wait">
              {open && (
                <motion.h3
                  key="title"
                  initial={{opacity: 0, x: -10}}
                  animate={{opacity: 1, x: 0}}
                  exit={{opacity: 0, x: -10}}
                  transition={{duration: 0.2}}
                  className="text-sm font-semibold whitespace-nowrap"
                >
                  Dashboard
                </motion.h3>
              )}
            </AnimatePresence>
            <Button
              variant={"secondary"}
              radius="sm"
              width="fit"
              className="bg-white p-1! border-2! border-muted/30!"
              onClick={() => setOpen((prev) => !prev)}
            >
              <Icon
                icon="weui:back-filled"
                size={21}
                className={`${!open ? "rotate-180" : ""} transition-all duration-300 ease-out`}
              />
            </Button>
          </div>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{opacity: 0, x: -20}}
                animate={{opacity: 1, x: 0}}
                exit={{opacity: 0, x: -20}}
                transition={{duration: 0.15}}
                className="flex justify-center py-6 px-4"
              >
                <nav className="w-full py-2">
                  <ul className="flex flex-col">
                    {navs.navAccordions.map((item) => {
                      const hasActiveChild = item.children?.some(
                        (child) => pathname === child.href,
                      );

                      const isExpanded =
                        expanded.has(item.key) || hasActiveChild;
                      const isItemActive = pathname === item.href;

                      return (
                        <motion.li
                          layout
                          key={item.key}
                          transition={{layout: {duration: 0.25}}}
                        >
                          <div className="flex items-center justify-between px-2 py-3 rounded-md">
                            {item.expandable ? (
                              <button
                                type="button"
                                onClick={() => toggle(item.key)}
                                className="flex-1 text-left text-sm font-medium text-gray-800 py-2"
                              >
                                {item.label}
                              </button>
                            ) : (
                              <Link
                                href={item.href!}
                                className={`flex-1 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                                  isItemActive
                                    ? "bg-black text-white"
                                    : "text-gray-800 hover:bg-gray-100"
                                }`}
                              >
                                {item.label}
                              </Link>
                            )}

                            {item.expandable && (
                              <button
                                type="button"
                                onClick={() => toggle(item.key)}
                                className="p-1 -m-1"
                                aria-label={isExpanded ? "Collapse" : "Expand"}
                              >
                                <motion.div
                                  animate={{rotate: isExpanded ? 180 : 0}}
                                  transition={{duration: 0.2}}
                                >
                                  <Icon
                                    icon="mingcute:down-line"
                                    size={16}
                                    className="text-gray-500"
                                  />
                                </motion.div>
                              </button>
                            )}
                          </div>

                          <AnimatePresence initial={false}>
                            {item.expandable && item.children && isExpanded && (
                              <motion.ul
                                initial={{height: 0, opacity: 0}}
                                animate={{height: "auto", opacity: 1}}
                                exit={{height: 0, opacity: 0}}
                                transition={{duration: 0.25}}
                                className="overflow-hidden flex flex-col gap-1 pb-2 w-[90%] ml-auto"
                              >
                                {item.children.map((child) => {
                                  const isChildActive = pathname === child.href;

                                  return (
                                    <motion.li
                                      key={child.key}
                                      initial={{opacity: 0, x: -8}}
                                      animate={{opacity: 1, x: 0}}
                                      transition={{duration: 0.2}}
                                    >
                                      <Link
                                        href={child.href}
                                        className={`block w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                                          isChildActive
                                            ? "bg-black text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                      >
                                        {child.label}
                                      </Link>
                                    </motion.li>
                                  );
                                })}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </motion.li>
                      );
                    })}
                  </ul>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.aside>
  );
}

const navs = {
  routenav: [
    {
      icon: "material-symbols:dashboard-outline-rounded",
      label: "dashboard",
      href: "/dashboard",
    },
    {
      icon: "ri:money-dollar-box-line",
      label: "finance",
      href: "/finance",
    },
    {icon: "ri:message-2-line", label: "user", href: "/messaging"},
  ],
  bottomNav: [
    {icon: "stash:question-light", label: "help", href: "/admin/help"},
    {icon: "solar:settings-broken", label: "settings", href: "/admin/settings"},
    {icon: "solar:settings-broken", label: "profile", href: "/admin/profile"},
  ],
  navAccordions: [
    {
      label: "Performance Overview",
      key: "performance",
      href: "/dashboard/performance",
    },
    {
      label: "Live sessions",
      key: "live-sessions",
      href: "/dashboard/live-sessions",
    },
    {
      label: "AI studio analysis",
      key: "ai-studio",
      href: "/dashboard/ai-studio",
    },
    {label: "Teachers", key: "teachers", href: "/dashboard/teachers"},
    {
      label: "Programs",
      key: "programs",
      expandable: true,
      children: [
        {
          label: "Exam program",
          key: "exam-program",
          href: "/dashboard/exam-program",
        },
        {label: "Courses", key: "courses", href: "/dashboard/courses"},
      ],
    },
    {label: "Students", key: "students", expandable: true, children: []},
    {label: "More", key: "more", expandable: true, children: []},
  ],
};
