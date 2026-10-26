"use client";

import {Icon} from "@mcc/ui";

interface FullScreenButtonProps {
  focus: boolean;
  onEnter: () => void;
  onLeave: () => void;
  /** Where it sits: the caller positions it (absolute, top-left of the lesson). */
  className?: string;
}

/** The Full screen icon, which becomes the Exit full screen icon in the same place while full screen is on. */
export default function FullScreenButton({focus, onEnter, onLeave, className = ""}: FullScreenButtonProps) {
  return (
    <button
      type="button"
      onClick={focus ? onLeave : onEnter}
      aria-label={focus ? "Exit full screen" : "Full screen"}
      className={`z-10 flex size-8 items-center justify-center rounded-full bg-background/90 text-subtle shadow-sm hover:text-foreground ${className}`}
    >
      <Icon icon={focus ? "lucide:minimize-2" : "lucide:maximize-2"} size={16} />
    </button>
  );
}
