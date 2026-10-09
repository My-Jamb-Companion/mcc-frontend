"use client";

import { useUnreadNotificationCount } from "./useNotifications";

/** The nav label for the inbox, with the unread count beside it when there is one. */
export const NotificationLink = ({ label = "Notifications" }: { label?: string }) => {
  const unread = useUnreadNotificationCount();
  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      {unread > 0 && (
        <span
          aria-label={`${unread} unread`}
          className="min-w-5 rounded-full bg-primary px-1.5 text-center text-[11px] font-semibold leading-5 text-white"
        >
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </span>
  );
};
