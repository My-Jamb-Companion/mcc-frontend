export default function ProgressBar({
  step,
  totalSteps,
  className,
}: {
  step: number;
  totalSteps: number;
  className?: string;
}) {
  const progress =
    totalSteps > 0 ? Math.min(100, Math.max(0, (step / totalSteps) * 100)) : 0;

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className || ""}`}>
      <div
        className="h-2 rounded-full transition-all duration-300"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(91deg, #6B26FF -13.46%, #B40D9B 100%)",
        }}
      />
    </div>
  );
}
