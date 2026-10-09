import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/src/config";

export type ContactChannel = { label: string; value: string; href: string };

/** A WhatsApp number as a wa.me link: digits only, no plus or spaces. */
export const whatsappHref = (number: string): string => `https://wa.me/${number.replace(/\D/g, "")}`;

/** The ways to reach the company that have actually been configured. Nothing is shown for an unset one. */
export function contactChannels(email = SUPPORT_EMAIL, whatsapp = SUPPORT_WHATSAPP): ContactChannel[] {
  const channels: ContactChannel[] = [];
  if (email) channels.push({ label: "Email", value: email, href: `mailto:${email}` });
  if (whatsapp.replace(/\D/g, "")) channels.push({ label: "WhatsApp", value: whatsapp, href: whatsappHref(whatsapp) });
  return channels;
}
