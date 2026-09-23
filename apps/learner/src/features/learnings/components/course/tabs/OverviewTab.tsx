import {Icon} from "@mcc/ui";

/**
 * Trimmed to what the backend actually knows about a course: title,
 * description, and lesson count/duration (computed client-side from the
 * real content rows). The old demo version also showed a rating, review
 * count, enrolled-student count, instructor bio/social and a certificate
 * download -- none of that has a real data source yet (no ratings system,
 * no learner-facing instructor info, and certificates
 * (GET /courses/certificates) record that one was earned but carry no
 * downloadable file), so those sections are gone rather than faked.
 */
export default function OverviewTab({
  title,
  description,
  totalLessons,
  totalDurationLabel,
  certificateEarnedAt,
}: {
  title: string;
  description?: string | null;
  totalLessons: number;
  totalDurationLabel: string;
  certificateEarnedAt?: string | null;
}) {
  return (
    <section>
      <div className="space-y-4">
        <p className="text-2xl font-semibold">{title}</p>

        <div className="flex items-center gap-12">
          <div>
            <p className="text-sm flex items-center gap-1 font-semibold">{totalLessons}</p>
            <p className="text-xs">{totalLessons === 1 ? "Lesson" : "Lessons"}</p>
          </div>

          <div>
            <p className="text-sm flex items-center gap-1 font-semibold">{totalDurationLabel}</p>
            <p className="text-xs">Total</p>
          </div>
        </div>

        {certificateEarnedAt && (
          <div className="flex items-center gap-2 border-b border-muted/40 pb-5">
            <Icon icon="solar:medal-ribbon-bold" size={18} className="text-primary" />
            <p className="text-sm">
              Certificate earned{" "}
              <span className="text-muted">
                {new Date(certificateEarnedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>
        )}

        {description && (
          <div className="pb-5">
            <p className="font-medium pb-3">Description</p>
            <p className="text-muted text-xs">{description}</p>
          </div>
        )}
      </div>
    </section>
  );
}
