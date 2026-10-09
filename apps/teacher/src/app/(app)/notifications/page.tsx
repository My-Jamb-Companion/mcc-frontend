"use client";

import { NotificationInbox } from "@mcc/features";

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Notifications</h1>
      <p className="text-sm text-muted mb-6">New students, messages, session changes and payouts.</p>
      <NotificationInbox />
    </div>
  );
}
