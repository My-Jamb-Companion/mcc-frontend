export default function CourseCardSkeleton() {
  return (
    <div className="w-full max-w-sm flex flex-col gap-2.5">
      {/* Thumbnail */}
      <div className="w-full aspect-video rounded-2xl bg-muted/20 animate-pulse" />

      {/* Instructor + Rating */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded-full bg-muted/20 animate-pulse" />
        <div className="h-3 w-16 rounded-full bg-muted/20 animate-pulse" />
      </div>

      {/* Title — two lines */}
      <div className="flex flex-col gap-1.5">
        <div className="h-4 w-full rounded-full bg-muted/20 animate-pulse" />
        <div className="h-4 w-3/4 rounded-full bg-muted/20 animate-pulse" />
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2">
        <div className="h-6 w-16 rounded-lg bg-muted/20 animate-pulse" />
        <div className="h-6 w-20 rounded-lg bg-muted/20 animate-pulse" />
      </div>

      {/* Pricing */}
      <div className="flex flex-col gap-1">
        <div className="h-4 w-32 rounded-full bg-muted/20 animate-pulse" />
        <div className="h-3 w-24 rounded-full bg-muted/20 animate-pulse" />
      </div>
    </div>
  );
}
