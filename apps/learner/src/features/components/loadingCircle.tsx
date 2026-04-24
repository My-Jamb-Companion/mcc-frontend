export default function LoadingCircle({className}: {className?: string}) {
  return (
    <div
      className={`border-6 border-t-transparent border-black dark:border-white dark:border-t-transparent p-5 rounded-full animate-spin w-fit ${className || ""}`}
    />
  );
}
