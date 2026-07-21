import type {AvatarOption, NotificationSetting, ProfileUser} from "./types";

export const CURRENT_USER: ProfileUser = {
  fullName: "Bright Mac",
  username: "brightmac",
  parentName: "Makin Mac",
  email: "mail@gmail.com",
  phoneCountryCode: "+234",
  phoneNumber: "812 345 6789",
  gender: "Male",
  country: "Nigeria",
  state: "Lagos state",
  city: "Ikeja",
  street: "",
  location: "Ikeja, Lagos, NG",
  verified: true,
  rank: 1,
  lessons: 64,
  points: 8299,
  diamonds: 290,
  coins: 290,
  avatar: "",
};

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
