"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Icon} from "@mcc/ui";
import {SupportLink} from "@mcc/features";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/src/features/notifications/hooks/useNotifications";
import {ApiNotification} from "@/src/features/notifications/services/notifications.service";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** A message from the MCC team opens the conversation, where it can be answered. */
const OPENS_MESSAGES = new Set(["admin_message"]);

function NotificationRow({
  notification,
  onRead,
  onOpen,
}: {
  notification: ApiNotification;
  onRead: (id: string) => void;
  onOpen: (path: string) => void;
}) {
  return (
    <button
      onClick={() => {
        if (!notification.read) onRead(notification.id);
        if (OPENS_MESSAGES.has(notification.type)) onOpen("/support");
      }}
      className={`w-full px-4 py-3 text-left transition-colors hover:bg-muted/10 ${
        notification.read ? "" : "bg-primary/5"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{notification.title}</p>
        {!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
      </div>
      {notification.body && (
        <p className="mt-0.5 text-sm text-muted line-clamp-2">{notification.body}</p>
      )}
      <p className="mt-1 text-xs text-muted/70">{formatWhen(notification.created_at)}</p>
    </button>
  );
}

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {items, unreadCount, isLoading} = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative rounded-full p-2 pt-1.5 border border-muted/40 shadow-md dark:shadow-muted/20"
      >
        <Icon icon="line-md:bell-filled" size={24} />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[90vw] rounded-2xl border border-muted/20 bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-muted/10 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <p className="px-4 py-6 text-center text-sm text-muted">Loading…</p>
              ) : items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted">No notifications yet.</p>
              ) : (
                items.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onRead={(id) => markRead.mutate(id)}
                    onOpen={(path) => {
                      setOpen(false);
                      router.push(path);
                    }}
                  />
                ))
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/support");
              }}
              className="w-full border-t border-muted/10 px-4 py-3 text-left text-sm font-medium text-primary hover:bg-muted/10"
            >
              <SupportLink label="Messages from MCC" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
