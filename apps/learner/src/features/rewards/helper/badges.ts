import type {ApiBadge} from "../services/rewards.service";

/** Earned badges first (newest first), then the rest by how close they are to being earned. */
export function sortBadges(badges: ApiBadge[]): ApiBadge[] {
  return [...badges].sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    if (a.earned) return (b.earned_at ?? "").localeCompare(a.earned_at ?? "");
    return b.progress / b.target - a.progress / a.target;
  });
}
