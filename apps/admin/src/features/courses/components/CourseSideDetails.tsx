import {Icon} from "@mcc/ui";
import {AdditionalCourseTypes, CoursesFormValues} from "../types/types";

type CourseDetailsSidebarProps = CoursesFormValues &
  Partial<AdditionalCourseTypes>;

const featureItems = (
  stats: CourseDetailsSidebarProps["stats"],
  features: CourseDetailsSidebarProps["features"],
) => [
  {
    icon: "solar:user-circle-outline",
    label: `${stats?.enrolledStudents} Students`,
  },
  {
    icon: "solar:play-circle-outline",
    label: `${stats?.totalHours} hour on-demand video`,
  },
  {
    icon: "solar:question-circle-outline",
    label: `${stats?.practiceTests} Practice test`,
  },
  ...(features?.assignments
    ? [{icon: "solar:document-outline", label: "Assignments"}]
    : []),
  {
    icon: "solar:paperclip-outline",
    label: `${stats?.additionalResources} additional resources`,
  },
  {
    icon: "solar:download-square-outline",
    label: `${stats?.downloadableResources} downloadable resources`,
  },
  ...(features?.mobileAndTVAccess
    ? [{icon: "solar:smartphone-outline", label: "Access on mobile and TV"}]
    : []),
  ...(features?.fullLifetimeAccess
    ? [{icon: "solar:infinity-outline", label: "Full lifetime access"}]
    : []),
  ...(features?.certificateOnCompletion
    ? [
        {
          icon: "solar:medal-ribbon-outline",
          label: "Certification upon completion",
        },
      ]
    : []),
];

export default function CourseSideDetail({
  price = 0,
  currency = "$",
  lessons = 0,
  difficulty = "beginner",
  stats,
  features,
}: Partial<AdditionalCourseTypes> & {
  price: number;
  lessons: number;
  difficulty: string;
}) {
  const items = featureItems(stats, features);

  return (
    <div className="flex flex-col gap-5 w-full">
      <p className="text-4xl font-bold">
        <span className="text-2xl align-super font-semibold">{currency}</span>
        {Number(price || 0).toFixed(2)}
      </p>

      <div className="flex items-center border border-muted/30 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 flex-1 px-5 py-4">
          <Icon icon="solar:monitor-smartphone-outline" size={22} />
          <div className="flex flex-col">
            <span className="text-xs text-subtle uppercase tracking-wide font-medium">
              Units
            </span>
            <span className="text-base font-bold">{lessons}</span>
          </div>
        </div>

        <div className="w-px h-10 bg-muted/20" />

        <div className="flex items-center gap-3 flex-1 px-5 py-4">
          <Icon icon="solar:chart-2-outline" size={22} color="#3b82f6" />
          <div className="flex flex-col">
            <span className="text-xs text-subtle uppercase tracking-wide font-medium">
              Difficulty
            </span>
            <span className="text-base font-bold">{difficulty}</span>
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 text-sm">
            <Icon icon={item.icon} size={18} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
