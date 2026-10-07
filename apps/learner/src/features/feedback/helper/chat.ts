/**
 * "Chat with us": a WhatsApp click-to-chat link, so the conversation happens in the
 * student's own WhatsApp with the support number (no WhatsApp API involved). The
 * message is pre-filled so support knows who is writing.
 */
export function chatLink(baseUrl: string | null | undefined, who: {name?: string | null; email?: string | null}): string | null {
  if (!baseUrl) return null;
  const name = who.name?.trim();
  const email = who.email?.trim();
  const intro = name ? `Hi MCC, I'm ${name}${email ? ` (${email})` : ""}.` : "Hi MCC,";
  return `${baseUrl}?text=${encodeURIComponent(`${intro} I need some help with `)}`;
}
