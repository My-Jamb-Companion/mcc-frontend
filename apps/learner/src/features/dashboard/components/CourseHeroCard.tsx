import {Icon} from "@mcc/ui";

interface CourseHeroCardProps {
  image: string;
  title: string;
  description: string;
  isPremium?: boolean;
  rating: number;
  ratingCount: string;
  learners: string;
  price: number;
  originalPrice: number;
  currency?: string;
  onClick?: () => void;
}

export default function CourseHeroCard({
  image,
  title,
  description,
  isPremium = false,
  rating,
  ratingCount,
  learners,
  price,
  originalPrice,
  currency = "₦",
  onClick,
}: CourseHeroCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex gap-6 cursor-pointer group w-full max-md:flex-col"
    >
      <div className="w-full max-h-70 max-w-95 max-md:max-w-full max-md:max-h-40 rounded-2xl overflow-hidden shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="flex flex-col justify-center gap-6 flex-1 min-w-0  w-full max-w-145">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-[#1a2332]">{title}</h3>
          <p className="text-sm text-gray-500 leading-snug line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex items-stretch gap-3">
          <div className="flex items-center gap-4 border border-gray-200 rounded-xl flex-1">
            {isPremium && (
              <div className="flex flex-col items-center justify-center gap-1 bg-primary text-white rounded-tl-xl rounded-bl-xl px-6 py-3.5 shrink-0">
                <Icon
                  icon="bitcoin-icons:verify-outline"
                  width="23"
                  height="23"
                />
                <span className="text-xs font-semibold">Premium</span>
              </div>
            )}

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-subtle">
                  {rating}
                </span>
                <div className="flex items-center">
                  {Array.from({length: 5}).map((_, i) => (
                    <Icon
                      key={i}
                      icon="solar:star-bold"
                      width="12"
                      height="12"
                      color={i < Math.round(rating) ? "#f59e0b" : "#e5e7eb"}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-subtle">{ratingCount} ratings</span>
            </div>

            <div className="w-px h-full bg-gray-200 shrink-0" />

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <Icon
                  icon="solar:users-group-rounded-outline"
                  width="14"
                  height="14"
                  color="#7C3AED"
                />
                <span className="text-sm font-semibold">{learners}</span>
              </div>
              <span className="text-xs text-subtle">Learners</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#1a2332]">
            {currency}
            {price.toLocaleString()}
          </span>
          <span className="text-sm text-gray-400 line-through">
            {currency}
            {originalPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
