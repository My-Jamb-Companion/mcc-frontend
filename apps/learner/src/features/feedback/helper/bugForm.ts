export const URGENCIES = [
  {value: "urgent", label: "Urgent", hint: "Something important is broken and I'm stuck"},
  {value: "important", label: "Important", hint: "It's getting in my way"},
  {value: "annoying", label: "Just annoying", hint: "A small thing that bugs me"},
] as const;

export type Urgency = (typeof URGENCIES)[number]["value"];

export const MIN_DESCRIPTION = 5;
export const MAX_DESCRIPTION = 4000;
export const MAX_SCREENSHOT_MB = 5;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export interface BugFormValues {
  description: string;
  page_url: string;
  urgency: Urgency | "";
}

export type BugFormErrors = Partial<Record<keyof BugFormValues | "screenshot", string>>;

/** What is wrong with the form, by field; empty when it can be sent. Mirrors the server's rules. */
export function bugFormErrors(values: BugFormValues, screenshot?: Pick<File, "type" | "size" | "name"> | null): BugFormErrors {
  const errors: BugFormErrors = {};
  const description = values.description.trim();
  if (description.length < MIN_DESCRIPTION) errors.description = "Tell us what went wrong";
  else if (description.length > MAX_DESCRIPTION) errors.description = `Keep it under ${MAX_DESCRIPTION} characters`;
  if (!values.page_url.trim()) errors.page_url = "Paste the link of the page you were on";
  if (!values.urgency) errors.urgency = "Choose how urgent this is";
  if (screenshot) {
    if (!IMAGE_TYPES.includes(screenshot.type)) errors.screenshot = "Use a PNG, JPG, WebP or GIF image";
    else if (screenshot.size > MAX_SCREENSHOT_MB * 1024 * 1024) errors.screenshot = `Use an image of ${MAX_SCREENSHOT_MB} MB or less`;
  }
  return errors;
}

/** The page a report starts from: the `from` link the menu passed, if it is a link on this site or a path. */
export function startingPage(from: string | null | undefined, siteOrigin: string): string {
  if (!from) return "";
  if (from.startsWith("/")) return `${siteOrigin}${from}`;
  try {
    const url = new URL(from);
    return url.origin === siteOrigin ? url.toString() : "";
  } catch {
    return "";
  }
}
