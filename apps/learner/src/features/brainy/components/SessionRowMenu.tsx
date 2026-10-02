"use client";

import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {Icon} from "@mcc/ui";
import type {SidebarGroup} from "../helper/groupSessions";

interface SessionRowMenuProps {
  /** The ⋯ button the menu hangs off. */
  anchor: HTMLElement;
  pinned: boolean;
  groups: SidebarGroup[];
  currentGroupId?: string;
  /** False when only the legacy fallback groups are available: moving needs real ones. */
  canMove: boolean;
  onTogglePin: () => void;
  onRename: () => void;
  onMove: (groupId: string) => void;
  onNewGroup: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const itemClass =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted/15 focus-visible:bg-muted/15 focus-visible:outline-none";

/**
 * The per-chat menu. Rendered in a portal with fixed positioning because the
 * sidebar is overflow-hidden (it animates its width) and would clip an
 * ordinary absolutely-positioned popover.
 */
export default function SessionRowMenu({
  anchor,
  pinned,
  groups,
  currentGroupId,
  canMove,
  onTogglePin,
  onRename,
  onMove,
  onNewGroup,
  onDelete,
  onClose,
}: SessionRowMenuProps) {
  const [view, setView] = useState<"menu" | "move">("menu");
  const menuRef = useRef<HTMLDivElement>(null);

  // Position straight on the DOM node, not via state: the menu has to be
  // measured after it renders, and a setState here would re-render for nothing.
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const margin = 8;
    const a = anchor.getBoundingClientRect();
    const m = menu.getBoundingClientRect();

    const left = Math.min(Math.max(a.right - m.width, margin), window.innerWidth - m.width - margin);
    let top = a.bottom + 4;
    if (top + m.height > window.innerHeight - margin) {
      top = Math.max(margin, a.top - m.height - 4);
    }
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.visibility = "visible";
  }, [anchor, view]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || anchor.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        anchor.focus();
      }
    };
    // Scrolling the list moves the anchor out from under a fixed menu.
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onClose);
    window.addEventListener("scroll", onClose, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [anchor, onClose]);

  // Land keyboard users on the first action each time the panel changes.
  useEffect(() => {
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus({preventScroll: true});
  }, [view]);

  const run = (action: () => void) => () => {
    onClose();
    action();
  };

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Chat options"
      style={{position: "fixed", top: 0, left: 0, visibility: "hidden"}}
      className="z-[60] w-56 rounded-xl border border-muted/25 bg-background p-1.5 shadow-xl"
    >
      {view === "menu" ? (
        <>
          <button type="button" role="menuitem" className={itemClass} onClick={run(onTogglePin)}>
            <Icon icon={pinned ? "ph:push-pin-slash" : "ph:push-pin"} size={16} />
            {pinned ? "Unpin" : "Pin"}
          </button>
          <button type="button" role="menuitem" className={itemClass} onClick={run(onRename)}>
            <Icon icon="ph:pencil-simple" size={16} />
            Rename
          </button>
          {canMove && (
            <button type="button" role="menuitem" className={itemClass} onClick={() => setView("move")}>
              <Icon icon="ph:folder-simple" size={16} />
              <span className="flex-1">Move to group</span>
              <Icon icon="ph:caret-right" size={14} className="text-subtle" />
            </button>
          )}
          <div className="my-1 h-px bg-muted/20" />
          <button
            type="button"
            role="menuitem"
            className={`${itemClass} text-red-500 hover:bg-red-500/10 focus-visible:bg-red-500/10`}
            onClick={run(onDelete)}
          >
            <Icon icon="ph:trash" size={16} />
            Delete
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            role="menuitem"
            className={`${itemClass} font-medium`}
            onClick={() => setView("menu")}
          >
            <Icon icon="ph:caret-left" size={14} />
            Move to group
          </button>
          <div className="my-1 h-px bg-muted/20" />
          <div className="max-h-56 overflow-y-auto">
            {groups.map((group) => {
              const isCurrent = group.id === currentGroupId;
              return (
                <button
                  key={group.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isCurrent}
                  disabled={isCurrent}
                  className={`${itemClass} disabled:cursor-default disabled:opacity-60`}
                  onClick={run(() => onMove(group.id))}
                >
                  <span className="flex-1 truncate">{group.name}</span>
                  {isCurrent && <Icon icon="ph:check" size={14} />}
                </button>
              );
            })}
          </div>
          <div className="my-1 h-px bg-muted/20" />
          <button type="button" role="menuitem" className={itemClass} onClick={run(onNewGroup)}>
            <Icon icon="ph:plus" size={16} />
            New group…
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
