import {ApiProfile} from "../services/profile.service";
import {ProfileUser} from "../constants/types";

export function fromApiProfile(
  api: ApiProfile,
  extras: {rank?: number; points?: number; diamonds?: number; coins?: number; lessons?: number} = {},
): ProfileUser {
  return {
    fullName: api.full_name || "",
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
