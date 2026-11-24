/**
 * Where "Open email app" should take someone who has just been sent a verification email.
 *
 * A web page cannot open an installed mail app's inbox directly. For the big webmail providers the address of the
 * inbox is known (on a phone it opens in the provider's app when that is installed). For any other address (a work
 * or school domain) the best that can be done is a `mailto:` link, which opens the phone's default mail app.
 */
export interface MailTarget {
  href: string;
  /** Webmail opens in a new tab so the sign-up page stays put; mailto: hands over to the mail app. */
  external: boolean;
}

const WEBMAIL: Record<string, string> = {
  "gmail.com": "https://mail.google.com/mail/u/0/#inbox",
  "googlemail.com": "https://mail.google.com/mail/u/0/#inbox",
  "outlook.com": "https://outlook.live.com/mail/0/inbox",
  "hotmail.com": "https://outlook.live.com/mail/0/inbox",
  "live.com": "https://outlook.live.com/mail/0/inbox",
  "msn.com": "https://outlook.live.com/mail/0/inbox",
  "yahoo.com": "https://mail.yahoo.com/",
  "ymail.com": "https://mail.yahoo.com/",
  "rocketmail.com": "https://mail.yahoo.com/",
  "icloud.com": "https://www.icloud.com/mail",
  "me.com": "https://www.icloud.com/mail",
  "mac.com": "https://www.icloud.com/mail",
  "proton.me": "https://mail.proton.me/",
  "protonmail.com": "https://mail.proton.me/",
  "zoho.com": "https://mail.zoho.com/",
};

export function mailTarget(email: string): MailTarget {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  const inbox = WEBMAIL[domain];
  return inbox ? {href: inbox, external: true} : {href: "mailto:", external: false};
}
