// Where the Landing Page hands the user off to once enrolled — there is no
// cross-app SSO between the 5 apps in this monorepo (each has its own
// scoped session, see packages/api/src/session-keys.ts), so the handoff is
// a plain link to the Student Platform's own login, not a token transfer.
export const LEARNER_URL =
  process.env.NEXT_PUBLIC_LEARNER_URL || "http://localhost:3000";

// The other apps a visitor can be sent to from the landing page. Page content links to them
// as /go/<app>/<path> (see app/go), so the content itself never holds an environment-specific address.
export const PARENT_URL = process.env.NEXT_PUBLIC_PARENT_URL || "http://localhost:3003";
export const TEACHER_URL = process.env.NEXT_PUBLIC_TEACHER_URL || "http://localhost:3002";

// The admin console, the only page allowed to send live-preview content to /preview.
export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

// The API the page content is fetched from (server side, so no CORS involved).
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// This site's own public address (no trailing slash): used for canonical links, social sharing and the sitemap.
// The other apps read the same variable to link to the legal pages (see LegalLink in @mcc/ui).
export const SITE_URL = (process.env.NEXT_PUBLIC_LANDING_URL || "http://localhost:3004").replace(/\/+$/, "");

// How people reach the company. Shown on the Contact page only when set, so nothing is invented.
export const SUPPORT_EMAIL = (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "").trim();
export const SUPPORT_WHATSAPP = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "").trim();
