import {Icon} from "@mcc/ui";

type ExamHeroProps = {
  mainImage: string;
  instructorImage: string;
  rating: number;
  totalRatings: number;
  onPlay?: () => void;
};

export default function ExamHero({
  mainImage,
  instructorImage,
  rating,
  totalRatings,
  onPlay,
}: ExamHeroProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="relative w-full rounded-2xl overflow-visible">
      {/* Main Image */}
      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-amber-800">
        <img
          src={mainImage}
          alt="Course preview"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Play Button — top right */}
      <button
        onClick={onPlay}
        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform duration-200"
      >
        <Icon icon="solar:play-bold" size={16} color="#000" />
      </button>

      {/* Rating — bottom right, inside image */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-white drop-shadow">
            {rating}
          </span>
          <div className="flex items-center gap-0.5">
            {Array.from({length: 5}).map((_, i) => (
              <Icon
                key={i}
                icon={
                  i < fullStars
                    ? "solar:star-bold"
                    : hasHalf && i === fullStars
                      ? "solar:star-half-bold"
                      : "solar:star-outline"
                }
                size={13}
                color="#f59e0b"
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-white/80 drop-shadow">
          {totalRatings} ratings
        </span>
      </div>

      {/* Instructor Thumbnail — bottom left, overflows outside image */}
      {/* <div className="absolute -bottom-6 left-4 w-20 h-20 rounded-2xl overflow-hidden border-[3px] border-white shadow-md">
        <img
          src={instructorImage}
          alt="Instructor"
          className="w-full h-full object-cover"
        />
      </div> */}
    </div>
  );
}
