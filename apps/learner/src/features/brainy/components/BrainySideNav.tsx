"use client";
import {Button, Icon, motion, AnimatePresence} from "@mcc/ui";
import {useMemo, useState} from "react";
import {useRouter, usePathname} from "next/navigation";
import {useBrainy} from "../contexts/BrainyContext";
import {groupByDateBucket} from "../helper/DateBuckets";

type CategoryKey = "research" | "assignment" | "exam";

const CATEGORY_CONFIG: {key: CategoryKey; label: string}[] = [
  {key: "research", label: "Research History"},
  {key: "assignment", label: "Assignment History"},
  {key: "exam", label: "Exam study History"},
];

export default function BrainySideNav() {
  const [openCategory, setOpenCategory] = useState<CategoryKey | null>(
    "research",
  );

  const router = useRouter();
  const {
    sessions,
    setMode,
    setSubject,
    setActiveSessionId,
    isMobile,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useBrainy();
  const pathname = usePathname();

  const showExpanded = isMobile || isSidebarOpen;

  const activeSessionId = useMemo(() => {
    const parts = pathname.split("/");
    const chatIndex = parts.indexOf("chat");
    if (chatIndex !== -1 && parts[chatIndex + 1]) {
      return parts[chatIndex + 1];
    }
    return undefined;
  }, [pathname]);

  const sessionsByCategory = useMemo(() => {
    const grouped: Record<CategoryKey, BrainySession[]> = {
      research: [],
      assignment: [],
      exam: [],
    };
    for (const session of sessions) {
      const category: CategoryKey =
        session.mode === "research"
          ? "research"
          : session.mode === "assignment"
            ? "assignment"
            : "exam";

      const brainySession: BrainySession = {
        id: session.id,
        title: session.title,
        category,
        createdAt: session.createdAt,
      };
      grouped[category].push(brainySession);
    }
    return grouped;
  }, [sessions]);

  const handleSelectSession = (session: BrainySession) => {
    setMode(session.category);
    setActiveSessionId(session.id);
    router.push(`/brainy/chat/${session.id}`);
  };

  return (
    <>
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
            onClick={() => setIsSidebarOpen(false)}
            className="hidden max-sm:block fixed inset-0 bg-black/40 z-10 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.nav
        initial={false}
        animate={
          isMobile
            ? {x: isSidebarOpen ? 0 : "100%"}
            : {width: isSidebarOpen ? 230 : 64}
        }
        transition={{duration: 0.25, ease: "easeInOut"}}
        className={`flex flex-col gap-4 bg-muted/10 border-r border-muted/30 overflow-hidden backdrop-blur-2xl
        max-sm:fixed max-sm:top-0 max-sm:right-0 max-sm:h-screen max-sm:w-full max-sm:z-20 max-sm:border-l max-sm:border-r-0
        ${isMobile ? "z-20 bg-white" : "z-10"}`}
      >
        <div className="flex items-center justify-between w-full py-4 px-3">
          <AnimatePresence mode="popLayout">
            {showExpanded && (
              <motion.p
                initial={{opacity: 0, x: -10}}
                animate={{opacity: 1, x: 0}}
                exit={{opacity: 0, x: -10}}
                transition={{duration: 0.15}}
                className="text-2xl font-semibold whitespace-nowrap max-sm:hidden"
              >
                Brainy<span className="text-primary">.AI</span>
              </motion.p>
            )}
          </AnimatePresence>
          {!isMobile && (
            <button
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
              }}
              className={`${showExpanded ? "" : "mx-auto"}`}
            >
              <Icon
                icon="hugeicons:sidebar-left-01"
                size={20}
                className="text-muted/40 hover:text-muted dark:hover:text-white"
              />
            </button>
          )}

          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="ml-auto p-2 rounded-full border border-muted/30 shadow-md dark:shadow-muted/20 cursor-pointer"
            >
              <Icon icon="material-symbols:close-rounded" size={22} />
            </button>
          )}
        </div>

        <div className={`flex flex-col gap-2 ${showExpanded ? "px-3" : ""}`}>
          <Button
            variant="ghost"
            onClick={() => {
              setMode("research");
              setSubject("general");
              router.push("/brainy/new");
            }}
            className={`flex rounded-none! ${showExpanded ? "justify-start!" : "mx-auto! justify-center! "}`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Icon icon="line-md:plus" size={18} className="shrink-0" />
              <AnimatePresence mode="popLayout">
                {showExpanded && (
                  <motion.p
                    initial={{opacity: 0, x: -5}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: -5}}
                    transition={{duration: 0.15}}
                    className="text-sm font-medium text-subtle whitespace-nowrap"
                  >
                    New Study Session
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </Button>

          <Button
            variant="ghost"
            className={`flex rounded-none! ${showExpanded ? "justify-start!" : "mx-auto! justify-center!"}`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Icon
                icon="solar:folder-open-outline"
                size={18}
                className="shrink-0"
              />
              <AnimatePresence mode="popLayout">
                {showExpanded && (
                  <motion.p
                    initial={{opacity: 0, x: -5}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: -5}}
                    transition={{duration: 0.15}}
                    className="text-sm font-medium text-subtle whitespace-nowrap"
                  >
                    Library
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </Button>
        </div>

        <AnimatePresence>
          {showExpanded && (
            <motion.div
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: 10}}
              transition={{duration: 0.2}}
              className="flex flex-col gap-2.5 overflow-hidden"
            >
              <p className="text-xs font-medium px-3 text-subtle">History</p>

              <div className="flex flex-col gap-1 overflow-y-auto">
                {CATEGORY_CONFIG.map(({key, label}) => (
                  <CategorySection
                    key={key}
                    label={label}
                    sessions={sessionsByCategory[key]}
                    isOpen={openCategory === key}
                    onToggle={() =>
                      setOpenCategory((current) =>
                        current === key ? null : key,
                      )
                    }
                    activeSessionId={activeSessionId}
                    onSelectSession={handleSelectSession}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

function CategorySection({
  label,
  sessions,
  isOpen,
  onToggle,
  activeSessionId,
  onSelectSession,
}: CategorySectionProps) {
  const grouped = groupByDateBucket(sessions, (s) => s.createdAt);
  const isEmpty = sessions.length === 0;

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 text-left cursor-pointer hover:text-foreground hover:bg-muted/10"
      >
        <motion.span
          animate={{rotate: isOpen ? 0 : -90}}
          transition={{duration: 0.15}}
          className="flex items-center"
        >
          <Icon icon="line-md:chevron-down" size={16} className="text-subtle" />
        </motion.span>
        <span className="text-sm font-medium text-subtle">{label}</span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && !isEmpty && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: "auto", opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.2, ease: "easeInOut"}}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 px-3 pb-2 pt-1">
              {grouped.map(({bucket, items}) => (
                <div key={bucket} className="flex flex-col gap-1">
                  <p className="px-0 text-xs text-subtle/60">{bucket}</p>
                  {items.map((session) => {
                    const isActive = session.id === activeSessionId;
                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => onSelectSession?.(session)}
                        className={[
                          "truncate rounded-md px-2 py-1.5 text-left text-sm transition-colors cursor-pointer",
                          isActive
                            ? "bg-muted/20 font-medium text-foreground"
                            : "text-subtle hover:bg-muted/10 hover:text-foreground",
                        ].join(" ")}
                        title={session.title}
                      >
                        {session.title}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {isOpen && isEmpty && (
          <div className="flex items-center justify-center p-2">
            <p className="text-xs">No sessions found</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface BrainySession {
  id: string;
  title: string;
  category: "research" | "assignment" | "exam";
  createdAt: Date | string | number;
}

interface CategorySectionProps {
  label: string;
  sessions: BrainySession[];
  isOpen: boolean;
  onToggle: () => void;
  activeSessionId?: string;
  onSelectSession?: (session: BrainySession) => void;
}
