export default function LoadingCircle({className}: {className?: string}) {
  return (
    <div
      className={`border-3 border-t-transparent border-white p-3 rounded-full animate-spin w-fit ${className || ""}`}
    />
  );
}
