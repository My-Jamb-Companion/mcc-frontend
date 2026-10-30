/** A small key label ("A", "Enter") shown beside a control, only where there is likely to be a keyboard. */
export default function KeyCap({children, className = ""}: {children: string; className?: string}) {
  return (
    <kbd
      aria-hidden="true"
      className={`hidden h-5 min-w-5 items-center justify-center rounded border border-current/30 px-1 font-sans text-[10px] font-semibold leading-none opacity-70 sm:inline-flex ${className}`}
    >
      {children}
    </kbd>
  );
}
