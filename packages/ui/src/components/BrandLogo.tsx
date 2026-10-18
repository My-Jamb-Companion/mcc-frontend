import {cn} from "../lib/cn";

interface BrandLogoProps {
  /** "horizontal" is the full SmartLearnersHQ logo (mark + wordmark + HQ tag); "mark" is the icon alone. */
  variant?: "horizontal" | "mark";
  /** Rendered height in px. The brand guide's minimum is 24px for the mark and 120px of width for the horizontal logo. */
  height?: number;
  className?: string;
  alt?: string;
}

/**
 * The SmartLearnersHQ logo, served from each app's own `/brand` folder. The full logo has a reverse version
 * (white wordmark) that is swapped in under the `.dark` class, since the standard one's black "Smart" vanishes on dark backgrounds.
 */
export function BrandLogo({variant = "horizontal", height = 28, className, alt = "SmartLearnersHQ"}: BrandLogoProps) {
  if (variant === "mark") {
    return <img src="/brand/mark.png" alt={alt} height={height} style={{height, width: "auto"}} className={className} />;
  }
  return (
    <>
      <img src="/brand/logo-horizontal.png" alt={alt} style={{height, width: "auto"}} className={cn("dark:hidden", className)} />
      <img src="/brand/logo-horizontal-reverse-transparent.png" alt={alt} style={{height, width: "auto"}} className={cn("hidden dark:block", className)} />
    </>
  );
}
