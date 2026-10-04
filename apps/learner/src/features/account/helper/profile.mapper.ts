import {ApiProfile} from "../services/profile.service";
import {ProfileUser} from "../constants/types";

export function fromApiProfile(
  api: ApiProfile,
  extras: {rank?: number; points?: number; diamonds?: number; coins?: number; lessons?: number} = {},
): ProfileUser {
  return {
    fullName: api.full_name || "",
    displayName: displayName(api),
    username: api.username || "",
    parentName: api.parent_name || "",
    email: api.email,
    phoneCountryCode: "+234",
    phoneNumber: api.phone_number || "",
    gender: api.gender || "",
    country: api.address?.country || "",
    state: api.address?.state || "",
    city: api.address?.city || "",
    street: api.address?.street || "",
    location: [api.address?.city, api.address?.state, api.address?.country]
      .filter(Boolean)
      .join(", "),
    verified: api.is_active,
    rank: extras.rank ?? 0,
    lessons: extras.lessons ?? 0,
    points: extras.points ?? 0,
    diamonds: extras.diamonds ?? 0,
    coins: extras.coins ?? 0,
    avatar: api.profile_photo_url || "",
  };
}

/**
 * The name to show for a student. Students sign up with an email and pick a
 * nickname (stored as the username) during onboarding; a full name is only
 * there if they filled it in, so fall back instead of showing nothing.
 */
export function displayName(profile: {
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
}): string {
  return (
    profile.full_name?.trim() ||
    profile.username?.trim() ||
    profile.email?.split("@")[0]?.trim() ||
    "Student"
  );
}

/** Up to two capital letters for an avatar when there is no photo. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const letters = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0];
  return letters.toUpperCase();
}

/** "City, State, Country" with the blanks left out (empty when none are set). */
export function locationLine(parts: {city?: string; state?: string; country?: string}): string {
  return [parts.city, parts.state, parts.country].map((p) => p?.trim()).filter(Boolean).join(", ");
}
