"use client";
import {Button, ConfirmModal, Icon, motion, AnimatePresence, showError, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {useCallback, useMemo, useRef, useState} from "react";
import {useRouter, usePathname} from "next/navigation";
import {useBrainy, type StudySession} from "../contexts/BrainyContext";
import {groupByDateBucket} from "../helper/DateBuckets";
import {
  isLegacyGroup,
  LEGACY_GROUPS,
  resolveGroupId,
  sessionsByGroup,
  splitPinned,
  type SidebarGroup,
} from "../helper/groupSessions";
import {useCreateGroup, useGroups, useRenameGroup, useUpdateSession} from "../hooks/useBrainyGroups";
import {useDeleteSession} from "../hooks/useBrainyChat";
import NameDialog from "./NameDialog";
import SessionRowMenu from "./SessionRowMenu";

// What the sidebar is currently asking the user. One at a time.
type Dialog =
  | {type: "rename-chat"; session: StudySession}
  | {type: "delete-chat"; session: StudySession}
  | {type: "rename-group"; group: SidebarGroup}
  // `moveSessionId`: created from a chat's "Move to group > New group", so the
  // chat goes into the new group in the same step.
  | {type: "new-group"; moveSessionId?: string};

export default function BrainySideNav() {
  // undefined = automatic (the group holding the open chat, else the first);
  // null = the user collapsed everything; a string = the group they opened.
  const [openGroupId, setOpenGroupId] = useState<string | null | undefined>(undefined);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [menu, setMenu] = useState<{sessionId: string; anchor: HTMLElement} | null>(null);

  const router = useRouter();
  const {
    sessions,
    setMode,
    setSubject,
    setActiveSessionId,
    removeSession,
    isMobile,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useBrainy();
  const pathname = usePathname();

  const groupsQuery = useGroups();
  const createGroup = useCreateGroup();
  const renameGroup = useRenameGroup();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();

  const showExpanded = isMobile || isSidebarOpen;

  // Real groups once loaded; the three legacy sections only if the endpoint
  // failed, so chats never disappear. While loading: nothing, rather than a
  // flash of legacy sections that then swap for the real ones.
  const groupsUnavailable = groupsQuery.isError;
  const groups: SidebarGroup[] = useMemo(
    () =>
      groupsUnavailable
        ? LEGACY_GROUPS
        : groupsQuery.groups.map((g) => ({id: g.group_id, name: g.name, kind: g.kind})),
    [groupsUnavailable, groupsQuery.groups],
  );

  const activeSessionId = useMemo(() => {
    const parts = pathname.split("/");
    const chatIndex = parts.indexOf("chat");
    if (chatIndex !== -1 && parts[chatIndex + 1]) {
      return parts[chatIndex + 1];
    }
    return undefined;
  }, [pathname]);

  const sessionsInGroup = useMemo(() => sessionsByGroup(sessions, groups), [sessions, groups]);

  const effectiveOpenGroupId = useMemo(() => {
    if (openGroupId !== undefined) return openGroupId;
    const active = sessions.find((s) => s.id === activeSessionId);
    return (active && resolveGroupId(active, groups)) ?? groups[0]?.id ?? null;
  }, [openGroupId, sessions, activeSessionId, groups]);

  const menuSession = menu ? sessions.find((s) => s.id === menu.sessionId) : undefined;
  const closeMenu = useCallback(() => setMenu(null), []);

  const handleSelectSession = (session: StudySession) => {
    setMode(session.mode);
    setActiveSessionId(session.id);
    router.push(`/brainy/chat/${session.id}`);
  };

  const patchSession = async (
    session: StudySession,
    patch: Parameters<typeof updateSession.mutateAsync>[0]["patch"],
    successMessage: string,
  ) => {
    try {
      await updateSession.mutateAsync({sessionId: session.id, patch});
      showSuccess(successMessage);
    } catch (error) {
      showError(extractApiError(error, "Couldn't update that chat. Please try again."));
    }
  };

  const moveToGroup = async (session: StudySession, groupId: string) => {
    await patchSession(session, {group_id: groupId}, "Chat moved");
    setOpenGroupId(groupId); // so the user sees where it went
  };

  const confirmDelete = async (session: StudySession) => {
    setDialog(null);
    try {
      await deleteSession.mutateAsync(session.id);
      removeSession(session.id);
      showSuccess("Chat deleted");
      if (session.id === activeSessionId) router.push("/brainy/new");
    } catch (error) {
      showError(extractApiError(error, "Couldn't delete that chat. Please try again."));
    }
  };

  const submitNewGroup = async (name: string, moveSessionId?: string) => {
    const created = await createGroup.mutateAsync(name);
    const target = moveSessionId ? sessions.find((s) => s.id === moveSessionId) : undefined;
    if (target) {
      await updateSession.mutateAsync({sessionId: target.id, patch: {group_id: created.group_id}});
    }
    setOpenGroupId(created.group_id);
    setDialog(null);
    showSuccess(target ? `Moved to "${created.name}"` : `Group "${created.name}" created`);
  };

  const submitRenameGroup = async (group: SidebarGroup, name: string) => {
    await renameGroup.mutateAsync({groupId: group.id, name});
    setDialog(null);
    showSuccess("Group renamed");
  };

  const submitRenameChat = async (session: StudySession, title: string) => {
    await updateSession.mutateAsync({sessionId: session.id, patch: {title}});
    setDialog(null);
    showSuccess("Chat renamed");
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
              <div className="flex items-center justify-between px-3">
                <p className="text-xs font-medium text-subtle">History</p>
                {!groupsUnavailable && (
                  <button
                    type="button"
                    onClick={() => setDialog({type: "new-group"})}
                    aria-label="New group"
                    title="New group"
                    className="rounded-md p-1 text-subtle transition-colors hover:bg-muted/15 hover:text-foreground"
                  >
                    <Icon icon="ph:folder-simple-plus" size={16} />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1 overflow-y-auto">
                {groups.map((group) => (
                  <GroupSection
                    key={group.id}
                    group={group}
                    sessions={sessionsInGroup.get(group.id) ?? []}
                    isOpen={effectiveOpenGroupId === group.id}
                    onToggle={() =>
                      setOpenGroupId(effectiveOpenGroupId === group.id ? null : group.id)
                    }
                    canRename={!isLegacyGroup(group.id)}
                    onRename={() => setDialog({type: "rename-group", group})}
                    activeSessionId={activeSessionId}
                    menuSessionId={menu?.sessionId}
                    onSelectSession={handleSelectSession}
                    onOpenMenu={(session, anchor) => setMenu({sessionId: session.id, anchor})}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {menu && menuSession && (
        <SessionRowMenu
          anchor={menu.anchor}
          pinned={!!menuSession.pinned}
          groups={groups}
          currentGroupId={resolveGroupId(menuSession, groups)}
          canMove={!groupsUnavailable}
          onClose={closeMenu}
          onTogglePin={() =>
            patchSession(
              menuSession,
              {pinned: !menuSession.pinned},
              menuSession.pinned ? "Chat unpinned" : "Chat pinned",
            )
          }
          onRename={() => setDialog({type: "rename-chat", session: menuSession})}
          onMove={(groupId) => moveToGroup(menuSession, groupId)}
          onNewGroup={() => setDialog({type: "new-group", moveSessionId: menuSession.id})}
          onDelete={() => setDialog({type: "delete-chat", session: menuSession})}
        />
      )}

      {dialog?.type === "rename-chat" && (
        <NameDialog
          title="Rename chat"
          label="Chat name"
          initialValue={dialog.session.title}
          submitLabel="Rename"
          maxLength={255}
          onSubmit={(title) => submitRenameChat(dialog.session, title)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.type === "new-group" && (
        <NameDialog
          title="New group"
          label="Group name"
          submitLabel="Create"
          maxLength={60}
          onSubmit={(name) => submitNewGroup(name, dialog.moveSessionId)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.type === "rename-group" && (
        <NameDialog
          title="Rename group"
          label="Group name"
          initialValue={dialog.group.name}
          submitLabel="Rename"
          maxLength={60}
          onSubmit={(name) => submitRenameGroup(dialog.group, name)}
          onClose={() => setDialog(null)}
        />
      )}
      <ConfirmModal
        open={dialog?.type === "delete-chat"}
        variant="danger"
        title="Delete this chat?"
        message={
          dialog?.type === "delete-chat"
            ? `"${dialog.session.title}" and all its messages will be permanently deleted. This can't be undone.`
            : undefined
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => dialog?.type === "delete-chat" && confirmDelete(dialog.session)}
        onCancel={() => setDialog(null)}
      />
    </>
  );
}

function GroupSection({
  group,
  sessions,
  isOpen,
  onToggle,
  canRename,
  onRename,
  activeSessionId,
  menuSessionId,
  onSelectSession,
  onOpenMenu,
}: GroupSectionProps) {
  const {pinned, rest} = splitPinned(sessions);
  const dated = groupByDateBucket(rest, (s) => s.createdAt);
  const isEmpty = sessions.length === 0;

  const renderRow = (session: StudySession) => (
    <SessionRow
      key={session.id}
      session={session}
      isActive={session.id === activeSessionId}
      isMenuOpen={session.id === menuSessionId}
      onSelect={() => onSelectSession(session)}
      onOpenMenu={(anchor) => onOpenMenu(session, anchor)}
    />
  );

  return (
    <div className="flex flex-col">
      <div className="group/header flex items-center hover:bg-muted/10">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-1.5 px-3 py-1.5 text-left cursor-pointer hover:text-foreground"
        >
          <motion.span
            animate={{rotate: isOpen ? 0 : -90}}
            transition={{duration: 0.15}}
            className="flex items-center"
          >
            <Icon icon="line-md:chevron-down" size={16} className="text-subtle" />
          </motion.span>
          <span className="truncate text-sm font-medium text-subtle" title={group.name}>
            {group.name}
          </span>
        </button>
        {canRename && (
          <button
            type="button"
            onClick={onRename}
            aria-label={`Rename group ${group.name}`}
            title="Rename group"
            className="mr-2 shrink-0 rounded-md p-1 text-subtle opacity-0 transition-opacity hover:bg-muted/20 hover:text-foreground focus-visible:opacity-100 group-hover/header:opacity-100 max-md:opacity-100"
          >
            <Icon icon="ph:pencil-simple" size={14} />
          </button>
        )}
      </div>

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
              {pinned.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="flex items-center gap-1 px-0 text-xs text-subtle/60">
                    <Icon icon="ph:push-pin" size={11} />
                    Pinned
                  </p>
                  {pinned.map(renderRow)}
                </div>
              )}
              {dated.map(({bucket, items}) => (
                <div key={bucket} className="flex flex-col gap-1">
                  <p className="px-0 text-xs text-subtle/60">{bucket}</p>
                  {items.map(renderRow)}
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

function SessionRow({session, isActive, isMenuOpen, onSelect, onOpenMenu}: SessionRowProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className={[
        "group/row flex items-center rounded-md transition-colors",
        isActive || isMenuOpen ? "bg-muted/20" : "hover:bg-muted/10",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onSelect}
        className={[
          "min-w-0 flex-1 truncate px-2 py-1.5 text-left text-sm cursor-pointer",
          isActive ? "font-medium text-foreground" : "text-subtle hover:text-foreground",
        ].join(" ")}
        title={session.title}
      >
        {session.title}
      </button>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Options for ${session.title}`}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        onClick={() => triggerRef.current && onOpenMenu(triggerRef.current)}
        // Hover-revealed on desktop; always visible on touch-sized screens,
        // where there is no hover to reveal it.
        className={[
          "mr-1 shrink-0 rounded-md p-1 text-subtle transition-opacity hover:bg-muted/25 hover:text-foreground focus-visible:opacity-100 max-md:opacity-100",
          isMenuOpen ? "opacity-100" : "opacity-0 group-hover/row:opacity-100",
        ].join(" ")}
      >
        <Icon icon="ph:dots-three" size={18} />
      </button>
    </div>
  );
}

interface GroupSectionProps {
  group: SidebarGroup;
  sessions: StudySession[];
  isOpen: boolean;
  onToggle: () => void;
  canRename: boolean;
  onRename: () => void;
  activeSessionId?: string;
  menuSessionId?: string;
  onSelectSession: (session: StudySession) => void;
  onOpenMenu: (session: StudySession, anchor: HTMLElement) => void;
}

interface SessionRowProps {
  session: StudySession;
  isActive: boolean;
  isMenuOpen: boolean;
  onSelect: () => void;
  onOpenMenu: (anchor: HTMLElement) => void;
}
