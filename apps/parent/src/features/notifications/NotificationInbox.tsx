"use client";

import { Button } from "@mcc/ui";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "./useNotifications";

const formatWhen = (iso: string) => new Date(iso).toLocaleString();

export const NotificationInbox = () => {
  const { data, isLoading, isError } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (isLoading) {
    return <p className="text-sm text-muted">Loading notifications…</p>;
  }

  if (isError) {
    return <p className="text-sm text-danger">Couldn&apos;t load notifications.</p>;
  }

  if (!data || data.items.length === 0) {
    return <p className="text-sm text-muted">You&apos;re all caught up — no notifications yet.</p>;
  }

  return (
    <div className="space-y-4">
      {data.unread_count > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            width="fit"
            loading={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all as read ({data.unread_count})
          </Button>
        </div>
      )}

      <ul className="space-y-2">
        {data.items.map((item) => (
          <li
            key={item.id}
            className={`rounded-lg border px-4 py-3 ${
              item.read ? "border-muted/20" : "border-primary/40 bg-primary/5"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{item.title}</p>
                {item.body && <p className="text-sm text-muted mt-0.5">{item.body}</p>}
                <p className="text-xs text-muted mt-1">{formatWhen(item.created_at)}</p>
              </div>
              {!item.read && (
                <Button
                  variant="ghost"
                  size="xs"
                  width="fit"
                  loading={markRead.isPending && markRead.variables === item.id}
                  onClick={() => markRead.mutate(item.id)}
                >
                  Mark read
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
