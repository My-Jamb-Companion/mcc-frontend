/**
 * The student's Overview tab: only what the platform really knows about a
 * course -- title, lesson count, total length and description. (Ratings,
 * enrolment counts and instructor bios are not shown to students.)
 */
export default function StudentOverview({
  title,
  description,
  lessonCount,
  totalDurationLabel,
}: {
  title: string;
  description?: string;
  lessonCount: number;
  totalDurationLabel: string;
}) {
  return (
    <section>
      <div className="space-y-4">
        <p className="text-2xl font-semibold">{title}</p>

        <div className="flex items-center gap-12">
          <div>
            <p className="text-sm font-semibold">{lessonCount}</p>
            <p className="text-xs">{lessonCount === 1 ? "Lesson" : "Lessons"}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">{totalDurationLabel}</p>
            <p className="text-xs">Total</p>
          </div>
        </div>

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
