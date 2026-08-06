import {Icon} from "@mcc/ui";

export function ConfigurationsSidebar() {
  return (
    <div className="w-full max-w-xs">
      <div className="flex items-start gap-3 px-1">
        <Icon
          icon="mdi:bell-outline"
          size={18}
          className="mt-0.5 text-gray-900"
        />
        <div>
          <p className="text-sm font-bold text-gray-900">
            Notifications &amp; Alerts
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            Manage notifications you see while using the app.
          </p>
        </div>
      </div>
    </div>
  );
}
