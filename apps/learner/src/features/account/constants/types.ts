export interface ProfileUser {
  fullName: string;
  /** What to show as the student's name: full name, else nickname, else email name. */
  displayName: string;
  username: string;
  parentName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  street: string;
  location: string;
  verified: boolean;
  rank: number;
  lessons: number;
  points: number;
  diamonds: number;
  coins: number;
  avatar: File | string;
}

export interface AvatarOption {
  id: string;
  imageUrl: string;
}

export type ProfileTabKey = "account" | "configurations" | "bookmarks";

export type SidebarSectionKey = "profileInfo" | "password";

export interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}
