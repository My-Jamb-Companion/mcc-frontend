import {useState} from "react";
import {ConfigurationsSidebar} from "./ConfigurationSideBar";
import {NotificationSettingRow} from "./NotificationSettings";
import {NOTIFICATION_SETTINGS} from "../constants/constants";
import type {NotificationSetting} from "../constants/types";

export function AccountConfigurations() {
  // Swap for real settings query/mutation once wired to the API.
  const [settings, setSettings] = useState<NotificationSetting[]>(
    NOTIFICATION_SETTINGS,
  );

  const handleToggle = (id: string, enabled: boolean) => {
    setSettings((prev) => prev.map((s) => (s.id === id ? {...s, enabled} : s)));
  };

  return (
    <div className="mt-6 flex flex-col gap-8 sm:flex-row">
      <ConfigurationsSidebar />

      <div className="flex-1 space-y-6">
        {settings.map((setting) => (
          <NotificationSettingRow
            key={setting.id}
            setting={setting}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
