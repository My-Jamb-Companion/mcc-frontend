interface BrainyLogoProps {
  /** Rendered height in px. The brand guide's minimum for the horizontal logo is 120px wide. */
  height?: number;
  className?: string;
}

/**
 * The Brainy AI horizontal logo (face and wordmark). The reverse version, lighter violet with a white
 * wordmark, is swapped in under the `.dark` class (Brainy AI brand sheet).
 */
export function BrainyLogo({height = 32, className = ""}: BrainyLogoProps) {
  return (
    <>
      <img src="/brand/brainy-logo-horizontal.svg" alt="Brainy AI" style={{height, width: "auto"}} className={`dark:hidden ${className}`} />
      <img src="/brand/brainy-logo-horizontal-reverse.svg" alt="Brainy AI" style={{height, width: "auto"}} className={`hidden dark:block ${className}`} />
    </>
  );
}
