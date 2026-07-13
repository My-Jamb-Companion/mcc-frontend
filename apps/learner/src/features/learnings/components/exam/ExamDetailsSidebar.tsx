import {Icon, Button} from "@mcc/ui";

type ExamDetailsSidebarProps = {
  price: number;
  isPaying?: boolean;
  isEnrollDisabled?: boolean;
  hasUnpaidSelection?: boolean;
  currency?: string;
  lessons: number;
  difficulty: "Beginner" | "Moderate" | "Advanced";
  // tags: string[];
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
  onAccess?: () => void;
  onGift?: () => void;
};

const featureItems = (
  stats: ExamDetailsSidebarProps["stats"],
  features: ExamDetailsSidebarProps["features"],
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

export default function ExamDetailsSidebar({
  price,
  currency = "$",
  lessons,
  difficulty,
  // tags,
  extraTagsCount = 0,
  stats,
  features,
  onEnroll,
  onAccess,
  onGift,
  isPaying = false,
  isEnrollDisabled = false,
  hasUnpaidSelection = false,
}: ExamDetailsSidebarProps) {
  // const visibleTags = tags.slice(0, 2);
  const items = featureItems(stats, features);

  const handlePrimaryAction = () => {
    if (hasUnpaidSelection) {
      onEnroll?.();
    } else {
      onAccess?.();
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <p className="text-4xl font-bold">
        <span className="text-2xl align-super font-semibold">{currency}</span>
        {price.toFixed(2)}
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

      {/* {tags.length > 0 && (
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
      )} */}

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 text-sm">
            <Icon icon={item.icon} size={18} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      {!isPaying && (
        <div className="flex items-center gap-3 pt-1">
          <Button
            onClick={handlePrimaryAction}
            width="fit"
            disabled={isEnrollDisabled}
            variant={isEnrollDisabled ? "disabled" : "primary"}
          >
            <p className=" font-semibold flex items-center gap-2 mx-auto w-fit px-4">
              <Icon
                icon={
                  hasUnpaidSelection
                    ? "solar:cart-large-2-bold"
                    : "solar:play-circle-bold"
                }
                size={18}
                color="white"
              />
              <span>
                {hasUnpaidSelection ? "Enroll program" : "Access Course"}
              </span>
            </p>
          </Button>

          <Button variant="outline" onClick={onGift} width="fit">
            <p className="font-semibold flex items-center gap-2 mx-auto w-fit px-4">
              <Icon icon="solar:gift-outline" size={18} />
              <span>Buy as a gift</span>
            </p>
          </Button>
        </div>
      )}
    </div>
  );
}
