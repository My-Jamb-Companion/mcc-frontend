import {Icon} from "@mcc/ui";
import {starParts} from "@/src/features/learnings/helper/assessmentFlow";

/** A five-star row in whole and half stars. */
export default function StarRating({stars}: {stars: number}) {
  const {full, half, empty} = starParts(stars);
  return (
    <span role="img" aria-label={`${stars} out of 5 stars`} className="flex items-center gap-0.5 text-amber-500">
      {Array.from({length: full}, (_, i) => <Icon key={`f${i}`} icon="solar:star-bold" size={14} />)}
      {half && <Icon icon="solar:star-bold-duotone" size={14} />}
      {Array.from({length: empty}, (_, i) => <Icon key={`e${i}`} icon="solar:star-linear" size={14} className="text-muted/40" />)}
    </span>
  );
}
