export default function CourseCard() {
  return (
    <div className="flex items-center rounded-2xl p-1 bg-white dark:bg-hint  border border-muted/30 shadow-md gap-3">
      <div className="h-[67px] w-[85px] rounded-xl border border-hint"></div>
      <div className="space-y-1">
        <p className="text-xs font-medium">
          Learn to illustrate with procreate
        </p>
        <p className="font-semibold text-sm">
          <sup>$</sup>
          0.00
        </p>
      </div>
    </div>
  );
}
