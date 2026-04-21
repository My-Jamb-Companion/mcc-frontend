import {Icon} from "@mcc/ui";
import {CourseCardProps} from "../types/courseCardTypes";

export default function CourseCard({
  image,
  instructor,
  rating,
  reviewCount,
  title,
  tags,
  price,
  originalPrice,
  pricePerModule,
  currency = "₦",
  onClick,
}: CourseCardProps) {
  const visibleTags = tags.slice(0, 2);
  const extraTags = tags.length - 2;

  return (
    <div
      onClick={onClick}
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

      {/* Instructor + Rating */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xs text-subtle">{instructor}</span>
          <Icon icon="noto:sparkles" width="14" height="14" />
        </div>
        <div className="flex items-center gap-1">
          <Icon icon="solar:star-bold" width="14" height="14" color="#f59e0b" />
          <span className="text-sm font-semibold text-subtle">{rating}</span>
          <span className="text-xs text-subtle">({reviewCount})</span>
        </div>
      </div>

      {/* Title */}
      <p className="text-base font-semibold leading-snug">{title}</p>

      {/* Tags */}
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

      {/* Pricing */}
      {price && (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold ">
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
    </div>
  );
}
