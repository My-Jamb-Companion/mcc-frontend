import type {ApiBanner, BannerPayload} from "../services/banner.service";

export const MAX_CAPTION = 200;
export const MAX_BUTTON = 40;

/** What the form holds: the same fields as the API, with the background choice made explicit. */
export interface BannerForm {
  caption: string;
  background: "colour" | "image";
  imageUrl: string;
  bgColor: string;
  textColor: string;
  buttonLabel: string;
  linkUrl: string;
  isActive: boolean;
}

export const emptyBannerForm = (): BannerForm => ({
  caption: "",
  background: "colour",
  imageUrl: "",
  bgColor: "#6B26FF",
  textColor: "#FFFFFF",
  buttonLabel: "",
  linkUrl: "",
  isActive: true,
});

export const formFromBanner = (b: ApiBanner): BannerForm => ({
  caption: b.caption,
  background: b.image_url ? "image" : "colour",
  imageUrl: b.image_url ?? "",
  bgColor: b.bg_color,
  textColor: b.text_color,
  buttonLabel: b.button_label,
  linkUrl: b.link_url,
  isActive: b.is_active,
});

const HEX = /^#[0-9a-fA-F]{6}$/;
const SAFE_LINK = /^(https?:\/\/|\/(?!\/))/i;

export type BannerErrors = Partial<Record<"caption" | "image" | "bgColor" | "textColor" | "buttonLabel" | "linkUrl", string>>;

export const validateBanner = (f: BannerForm): BannerErrors => {
  const e: BannerErrors = {};
  const caption = f.caption.trim();
  if (!caption) e.caption = "Write the line the slide shows";
  else if (caption.length > MAX_CAPTION) e.caption = `Keep it under ${MAX_CAPTION} characters`;
  if (f.background === "image" && !f.imageUrl) e.image = "Upload an image, or switch to a colour";
  if (!HEX.test(f.bgColor)) e.bgColor = "Choose a colour";
  if (!HEX.test(f.textColor)) e.textColor = "Choose a colour";
  const label = f.buttonLabel.trim();
  const link = f.linkUrl.trim();
  if (label.length > MAX_BUTTON) e.buttonLabel = `Keep it under ${MAX_BUTTON} characters`;
  if (link && !SAFE_LINK.test(link)) e.linkUrl = "Start with https:// for another site, or / for a page in the app";
  else if (label && !link) e.linkUrl = "Add where the button goes, or clear the button's words";
  else if (link && !label) e.buttonLabel = "Add the button's words, or clear the link";
  return e;
};

export const bannerPayload = (f: BannerForm): BannerPayload => ({
  caption: f.caption.trim(),
  image_url: f.background === "image" ? f.imageUrl : "",
  bg_color: f.bgColor.toUpperCase(),
  text_color: f.textColor.toUpperCase(),
  button_label: f.buttonLabel.trim(),
  link_url: f.linkUrl.trim(),
  is_active: f.isActive,
});

/** Where a slide goes after moving it one place: the whole order, to send as the new one. Unchanged at an end. */
export const moved = (ids: string[], id: string, by: -1 | 1): string[] => {
  const i = ids.indexOf(id);
  const j = i + by;
  if (i < 0 || j < 0 || j >= ids.length) return ids;
  const next = [...ids];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};
