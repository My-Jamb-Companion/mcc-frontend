import type {AvatarOption, NotificationSetting} from "./types";

// Placeholder avatar picker options — swap imageUrl for real asset URLs.
export const AVATAR_OPTIONS: AvatarOption[] = [
  {id: "a1", imageUrl: ""},
  {id: "a2", imageUrl: ""},
  {id: "a3", imageUrl: ""},
  {id: "a4", imageUrl: ""},
  {id: "a5", imageUrl: ""},
  {id: "a6", imageUrl: ""},
  {id: "a7", imageUrl: ""},
];

export const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "reminderAlert",
    title: "Reminder Alert",
    description: "Remind me to take my practice test",
    enabled: true,
  },
  {
    id: "rewardAlerts",
    title: "Goals and rewards",
    description: "Tell me when I reach a goal or win a prize",
    enabled: true,
  },
  {
    id: "leaderboardAlerts",
    title: "Leaderboard alerts",
    description: "Alert me when I drop in rank",
    enabled: false,
  },
  {
    id: "newCourseUpdates",
    title: "New course updates",
    description: "Show new courses and study materials",
    enabled: false,
  },
  {
    id: "marketingEmails",
    title: "Marketing Emails",
    description: "Receive updates about new features",
    enabled: true,
  },
];
