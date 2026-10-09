"use client";

import {useSupportUnread} from "./useSupport";

/** The nav label for the team conversation, with the number of unread messages beside it when there are any. */
export const SupportLink = ({label = "MCC team"}: {label?: string}) => {
  const {data: unread = 0} = useSupportUnread();
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
