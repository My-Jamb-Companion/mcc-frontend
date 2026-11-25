import type {ApiProfile} from "../services/profile.service";

export interface ProfileStep {
  title: string;
  done: boolean;
}

const filled = (value?: string | null) => Boolean(value && value.trim());

/**
 * The three things the "Complete profile" checklist asks for, judged from the profile the server holds, so the
 * ticks always agree with what the Account page shows (there is no separate copy of this progress to go stale).
 */
export function profileSteps(profile?: ApiProfile | null): ProfileStep[] {
  return [
    {
      title: "Personal details",
      done: filled(profile?.full_name) && filled(profile?.phone_number) && filled(profile?.gender),
    },
    {
      title: "Your location",
      done: filled(profile?.address?.country) && filled(profile?.address?.state) && filled(profile?.address?.city),
    },
    {title: "Profile photo", done: filled(profile?.profile_photo_url)},
  ];
}

/** Whether every step of the checklist is done, so there is nothing left to ask for. */
export function isProfileComplete(profile?: ApiProfile | null): boolean {
  return profileSteps(profile).every((step) => step.done);
}
