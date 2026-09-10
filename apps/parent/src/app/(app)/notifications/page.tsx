import { NotificationInbox } from "@/src/features/notifications/NotificationInbox";

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Notifications</h1>
      <p className="text-sm text-muted mb-6">Updates about your children&apos;s enrolments and sessions.</p>
      <NotificationInbox />
    </div>
  );
}
