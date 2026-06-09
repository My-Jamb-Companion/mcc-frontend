export default function ExamCardSkeleton() {
  return (
    <div className="relative shrink-0 w-48 rounded-2xl bg-white p-4 flex flex-col gap-3 overflow-hidden">
      {/* Icon + Name */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse shrink-0" />
        <div className="h-4 w-20 rounded-full bg-gray-100 animate-pulse" />
      </div>

      {/* Rating */}
      <div className="h-3 w-24 rounded-full bg-gray-100 animate-pulse" />

      {/* Pricing */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded-full bg-gray-100 animate-pulse" />
          <div className="h-3 w-12 rounded-full bg-gray-100 animate-pulse" />
        </div>
        <div className="h-3 w-20 rounded-full bg-gray-100 animate-pulse" />
      </div>

      {/* Button */}
      <div className="h-8 w-full rounded-xl bg-gray-100 animate-pulse" />
    </div>
  );
}
