import { useState } from "react";
import { CatalogueCourse } from "./types";
import { EnrollButton } from "./EnrollButton";
import { TierSelect } from "./TierSelect";

export const CourseCard = ({ course }: { course: CatalogueCourse }) => {
  const isFree = !course.price || course.price <= 0;
  // The catalogue's flat price is always the default tier's price, so
  // that's the sensible pre-selected choice.
  const [tierId, setTierId] = useState(
    () => course.tier_prices.find((t) => t.price === course.price)?.tier_id ?? course.tier_prices[0]?.tier_id,
  );

  return (
    <div className="rounded-xl border border-muted/20 overflow-hidden flex flex-col bg-background">
      <div className="aspect-video bg-muted/10">
        {course.cover_image_url && (
          <img
            src={course.cover_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-base line-clamp-2">{course.title}</h3>
        <p className="text-sm text-muted line-clamp-2 flex-1">{course.description}</p>
        {!isFree && course.tier_prices.length > 0 && (
          <TierSelect tiers={course.tier_prices} value={tierId ?? ""} onChange={setTierId} />
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium">
            {isFree
              ? "Free"
              : `₦${(course.tier_prices.find((t) => t.tier_id === tierId)?.price ?? course.price).toLocaleString()}`}
          </span>
          <EnrollButton
            pending={{
              id: course.course_id,
              title: course.title,
              price: course.price,
              image: course.cover_image_url ?? undefined,
              kind: "course",
              tierId,
            }}
            label={isFree ? "Enroll free" : "Enroll"}
          />
        </div>
      </div>
    </div>
  );
};
