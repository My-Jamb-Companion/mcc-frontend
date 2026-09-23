/**
 * Cookie/localStorage key names, scoped per app.
 *
 * Every app in this monorepo used to share the exact same literal names
 * (`mcc_auth`, `mcc_refresh_token`, `mcc_user`) with no `domain` attribute on
 * the cookies. Cookies are scoped by host + path, not by port, so two apps
 * on the same host (e.g. localhost:3000 and localhost:3001 in dev) silently
 * read and clobbered each other's session. Each app now sets
 * NEXT_PUBLIC_APP_ID (in its own next.config.ts) to get its own set of keys.
 */
const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "default";

export const AUTH_COOKIE = `mcc_${APP_ID}_auth`;
export const REFRESH_COOKIE = `mcc_${APP_ID}_refresh_token`;
export const USER_KEY = `mcc_${APP_ID}_user`;
