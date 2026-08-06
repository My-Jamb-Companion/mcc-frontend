import {NotificationSetting} from "../constants/types";
import {Toggle} from "./RadioToggle";

interface NotificationSettingRowProps {
  setting: NotificationSetting;
  onToggle: (id: string, enabled: boolean) => void;
}

export function NotificationSettingRow({
  setting,
  onToggle,
}: NotificationSettingRowProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <p className="text-sm font-bold text-gray-900">{setting.title}</p>
        <p className="mt-0.5 text-xs text-gray-400">{setting.description}</p>
      </div>
      <Toggle
        checked={setting.enabled}
        onChange={(checked: boolean) => onToggle(setting.id, checked)}
        label={setting.title}
      />
    </div>
  );
}
