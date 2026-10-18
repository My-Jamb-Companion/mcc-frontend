import {Icon} from "@mcc/ui";

export function ConfigurationsSidebar() {
  return (
    <div className="w-full max-w-xs">
      <div className="flex items-start gap-3 px-1">
        <Icon
          icon="mdi:bell-outline"
          size={18}
          className="mt-0.5 text-foreground"
        />
        <div>
          <p className="text-sm font-bold text-foreground">
            Notifications &amp; Alerts
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Manage notifications you see while using the app.
          </p>
        </div>
      </div>
    </div>
  );
}
