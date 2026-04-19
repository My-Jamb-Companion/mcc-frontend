export default function CourseCard({plan}: {plan?: "free" | "paid"}) {
  return (
    <div className="flex items-center rounded-2xl p-1 bg-white dark:bg-hint  border border-muted/30 shadow-md gap-3">
      <div className="h-[67px] w-[85px] rounded-xl border border-hint"></div>
      <div className="space-y-1">
        <p className="text-xs font-medium">
          Learn to illustrate with procreate
        </p>
        <div className="flex items-center gap-4">
          {plan === "paid" && (
            <p className="line-through italic text-muted text-sm">$5,381.98</p>
          )}
          <p className="font-semibold text-sm">
            ${plan === "free" ? "$0.00" : "$2,821.48"}
          </p>
        </div>
      </div>
    </div>
  );
}
