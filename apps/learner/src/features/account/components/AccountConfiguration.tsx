"use client";

import {ConfigurationsSidebar} from "./ConfigurationSideBar";
import {NotificationSettingRow} from "./NotificationSettings";
import {NOTIFICATION_SETTINGS} from "../constants/constants";
import type {NotificationSetting} from "../constants/types";
import {useNotificationSettings, useUpdateNotificationSettings} from "../hooks/useProfile";

export function AccountConfigurations() {
  const {data: prefs, isLoading} = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();

  // The backend's email_notifications map has arbitrary keys, deep-merged --
  // the constant setting IDs here (reminderAlert, marketingEmails, ...) are
  // used directly as those keys, defaulting to the local demo value only
  // until the real map has ever been written to for that key.
  const settings: NotificationSetting[] = NOTIFICATION_SETTINGS.map((s) => ({
    ...s,
    enabled: prefs?.email_notifications?.[s.id] ?? s.enabled,
  }));

  const handleToggle = (id: string, enabled: boolean) => {
    updateSettings.mutate({email_notifications: {[id]: enabled}});
  };

  return (
    <div className="mt-6 flex flex-col gap-8 sm:flex-row">
      <ConfigurationsSidebar />

      <div className="flex-1 space-y-6">
        {isLoading ? (
          <p className="text-sm text-muted">Loading settings…</p>
        ) : (
          settings.map((setting) => (
            <NotificationSettingRow
              key={setting.id}
              setting={setting}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}
