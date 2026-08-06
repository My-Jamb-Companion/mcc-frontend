import {Icon} from "@mcc/ui";
import Link from "next/link";
export interface CourseCardProps {
  image: string;
  instructor?: string;
  rating?: number;
  reviewCount?: number;
  title: string;
  tags?: string[];
  price?: number;
  originalPrice?: number;
  pricePerModule?: number;
  currency?: string;
  course?: string;
  completePercent?: number;
  href?: string;
}

export default function CourseCard({
  image,
  instructor,
  rating,
  reviewCount,
  title,
  tags = [],
  price,
  originalPrice,
  pricePerModule,
  currency = "₦",
  course,
  completePercent,
  href = "#",
}: CourseCardProps) {
  const visibleTags = tags.slice(0, 2);
  const extraTags = tags.length - 2;
  const percent = completePercent ?? 0;
  const progressConfig =
    percent >= 95
      ? {icon: "ri:progress-8-line", color: "#22c55e"}
      : percent >= 50
        ? {icon: "ri:progress-6-line", color: "#3b82f6"}
        : percent >= 35
          ? {icon: "ri:progress-4-line", color: "#f97316"}
          : {icon: "ri:progress-2-line", color: "#ef4444"};

  return (
    <Link
      href={`/learnings/course/${href}`}
      className="w-full max-w-sm flex flex-col gap-2.5 cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="w-full aspect-video rounded-2xl overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Instructor + Rating / Continue course label */}
      {course ? (
        <p className="text-xs text-subtle">{course}</p>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs text-subtle">{instructor}</span>
            <Icon icon="noto:sparkles" size={14} />
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="solar:star-bold" size={14} color="#f59e0b" />
            <span className="text-sm font-semibold text-subtle">{rating}</span>
            <span className="text-xs text-subtle">({reviewCount})</span>
          </div>
        </div>
      )}

      {/* Title */}
      <p className="text-base font-semibold leading-snug">{title}</p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-subtle font-medium border border-muted/40 rounded-lg px-2 py-1"
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="text-xs text-subtle">+{extraTags}</span>
          )}
        </div>
      )}

      {/* Pricing */}
      {price && (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold">
              {currency}
              {price.toLocaleString()}
            </span>
            <span className="text-xs text-muted line-through">
              {currency}
              {originalPrice?.toLocaleString()}
            </span>
          </div>
          <span className="text-xs font-medium">
            ({currency}
            {pricePerModule} per module)
          </span>
        </div>
      )}

      {/* Completion */}
      {completePercent !== undefined && (
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Icon
            icon={progressConfig.icon}
            size={14}
            color={progressConfig.color}
          />
          <p>{completePercent}% Completed</p>
        </div>
      )}
    </Link>
  );
}
