import {Icon} from "@mcc/ui";

type CourseDetailsSidebarProps = {
  price: number;
  currency?: string;
  lessons: number;
  difficulty: "Beginner" | "Moderate" | "Advanced";
  tags: string[];
  extraTagsCount?: number;
  stats: {
    students: number;
    hoursOfVideo: number;
    practiceTests: number;
    additionalResources: number;
    downloadableResources: number;
  };
  features: {
    assignments: boolean;
    mobileAndTVAccess: boolean;
    fullLifetimeAccess: boolean;
    certificateOnCompletion: boolean;
  };
  onEnroll?: () => void;
  onGift?: () => void;
};

const featureItems = (
  stats: CourseDetailsSidebarProps["stats"],
  features: CourseDetailsSidebarProps["features"],
) => [
  {icon: "solar:user-circle-outline", label: `${stats.students} Students`},
  {
    icon: "solar:play-circle-outline",
    label: `${stats.hoursOfVideo} hour on-demand video`,
  },
  {
    icon: "solar:question-circle-outline",
    label: `${stats.practiceTests} Practice test`,
  },
  ...(features.assignments
    ? [{icon: "solar:document-outline", label: "Assignments"}]
    : []),
  {
    icon: "solar:paperclip-outline",
    label: `${stats.additionalResources} additional resources`,
  },
  {
    icon: "solar:download-square-outline",
    label: `${stats.downloadableResources} downloadable resources`,
  },
  ...(features.mobileAndTVAccess
    ? [{icon: "solar:smartphone-outline", label: "Access on mobile and TV"}]
    : []),
  ...(features.fullLifetimeAccess
    ? [{icon: "solar:infinity-outline", label: "Full lifetime access"}]
    : []),
  ...(features.certificateOnCompletion
    ? [
        {
          icon: "solar:medal-ribbon-outline",
          label: "Certification upon completion",
        },
      ]
    : []),
];

export default function CourseDetailsSidebar({
  price,
  currency = "$",
  lessons,
  difficulty,
  tags,
  extraTagsCount = 0,
  stats,
  features,
  onEnroll,
  onGift,
}: CourseDetailsSidebarProps) {
  const visibleTags = tags.slice(0, 2);
  const items = featureItems(stats, features);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Price */}
      <p className="text-4xl font-bold">
        <span className="text-2xl align-super font-semibold">{currency}</span>
        {price.toFixed(2)}
      </p>

      {/* Lessons + Difficulty */}
      <div className="flex items-center border border-muted/30 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 flex-1 px-5 py-4">
          <Icon icon="solar:monitor-smartphone-outline" size={22} />
          <div className="flex flex-col">
            <span className="text-xs text-subtle uppercase tracking-wide font-medium">
              Lessons
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

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium border border-muted/40 rounded-lg px-3 py-1"
            >
              {tag}
            </span>
          ))}
          {extraTagsCount > 0 && (
            <span className="text-xs text-subtle">+{extraTagsCount}</span>
          )}
        </div>
      )}

      {/* Feature list */}
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 text-sm">
            <Icon icon={item.icon} size={18} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      {/* CTAs */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onEnroll}
          className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-full py-3 transition-colors"
        >
          <Icon icon="solar:cart-large-2-bold" size={18} color="white" />
          Enroll course
        </button>

        <button
          onClick={onGift}
          className="flex items-center justify-center gap-2 border border-muted/40 hover:bg-muted/10 text-sm font-semibold rounded-full px-5 py-3 transition-colors"
        >
          <Icon icon="solar:gift-outline" size={18} />
          Buy as a gift
        </button>
      </div>
    </div>
  );
}
