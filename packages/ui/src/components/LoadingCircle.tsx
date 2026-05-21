type LoadingCircleProps = {
  className?: string;
  size?: number;
  borderWidth?: number;
  color?: string;
};

export function LoadingCircle({
  className = "",
  size = 20,
  borderWidth = 3,
  color = "border-white",
}: LoadingCircleProps) {
  return (
    <div
      className={`
        animate-spin
        rounded-full
        border-solid
        border-t-transparent
        ${color}
        ${className}
      `}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: `${borderWidth}px`,
      }}
    />
  );
}
