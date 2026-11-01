import {cn} from "../lib/cn";

interface BrainyMarkProps {
  /**
   * Which Brainy colour to draw:
   * - "auto" follows the theme: deep violet on light, the lighter violet on dark (the brand sheet's rule).
   * - "light" / "dark" force one of them, for a surface that does not follow the theme (the dark side menu).
   * - "white" is a white bubble for sitting on a violet button or banner.
   */
  tone?: "auto" | "light" | "dark" | "white";
  /** Rendered size in px (width and height). The brand guide's minimum is 24px for the avatar. */
  size?: number;
  /** Draw it inside a round badge: the version for busy photos, chat and notifications. */
  badge?: boolean;
  className?: string;
  /** Spoken label; leave empty when a visible "Brainy" label sits beside it. */
  alt?: string;
}

const VIOLET = "#4F0FB0";
const VIOLET_ON_DARK = "#6B26FF";

/**
 * Brainy AI's face: a speech bubble whose tail is the SmartLearnersHQ tick (Brainy AI brand sheet, "Hello"
 * expression). One flat colour, never recoloured beyond the tones above, so it is drawn inline to follow the theme.
 */
export function BrainyMark({tone = "auto", size = 24, badge = false, className, alt = ""}: BrainyMarkProps) {
  const body = tone === "white" ? "#FFFFFF" : tone === "dark" ? VIOLET_ON_DARK : VIOLET;
  const face = tone === "white" ? VIOLET : "#FFFFFF";
  const themed = tone === "auto";
  // In a badge the circle is the violet and the bubble inside it is white.
  const bubble = badge ? "#FFFFFF" : body;
  const features = badge ? VIOLET : face;

  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn("shrink-0", className)}
    >
      {badge && <circle cx="48" cy="48" r="48" fill={body} className={themed ? "dark:fill-[#6B26FF]" : undefined} />}
      <g transform={badge ? "translate(16.32,16.32) scale(0.66)" : undefined}>
        <g transform="translate(0,-5)">
          <rect x="8" y="12" width="80" height="62" rx="28" fill={bubble} className={themed && !badge ? "dark:fill-[#6B26FF]" : undefined} />
          <path
            d="M8 76L17 88L43 66"
            stroke={bubble}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className={themed && !badge ? "dark:stroke-[#6B26FF]" : undefined}
          />
          <g transform="translate(0,-10)">
            <ellipse cx="34" cy="50" rx="5.5" ry="8.5" fill={features} />
            <ellipse cx="62" cy="50" rx="5.5" ry="8.5" fill={features} />
            <path d="M36 64Q48 75 60 64" stroke={features} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </g>
      </g>
    </svg>
  );
}
