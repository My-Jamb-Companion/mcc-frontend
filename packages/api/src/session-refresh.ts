import { apiClient } from "./api-client";
import { tokenManager } from "./token-manager";
import { AUTH_COOKIE, REFRESH_COOKIE } from "./session-keys";

/**
 * The one way this tab exchanges a refresh token for new tokens.
 *
 * Everything that needs a fresh access token -- the response interceptor
 * retrying a 401, and useAuth restoring the session on page load -- goes
 * through here. Calls made while a refresh is in flight share that refresh
 * instead of starting their own. Previously each caller refreshed on its own:
 * a page load sent four refreshes at once (useAuth is mounted twice and React
 * Strict Mode runs mount effects twice), all presenting the same refresh token,
 * and any the server rejected could end the session.
 *
 * Coordination is per tab. Two tabs refreshing together is handled on the
 * server, which accepts a just-rotated token for a short grace window.
 */

let inFlight: Promise<string> | null = null;

export const readRefreshTokenCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${REFRESH_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const writeRefreshTokenCookie = (token: string): void => {
  if (typeof document === "undefined") return;
  document.cookie = `${REFRESH_COOKIE}=${encodeURIComponent(token)}; path=/; SameSite=Strict; max-age=${30 * 24 * 60 * 60}`;
};

/** Error thrown when the server has definitively refused the refresh token. */
export class SessionExpiredError extends Error {
  constructor(public readonly status?: number) {
    super("Session expired");
    this.name = "SessionExpiredError";
  }
}

/**
 * Whether a failed refresh means the session is over, as opposed to a
 * transient failure (network down, server error) that shouldn't log anyone out.
 * 400 means no refresh token reached the server at all.
 */
export const isSessionExpired = (error: unknown): boolean =>
  error instanceof SessionExpiredError;

const doRefresh = async (): Promise<string> => {
  // Read at call time, not captured earlier: a refresh that completed a moment
  // ago may already have rotated it.
  const refreshToken = readRefreshTokenCookie();
  try {
    // The server prefers its own httpOnly refresh_token cookie when the browser
    // sends it; the body is the fallback for when that third-party cookie is
    // blocked, which is why the rotated token below must be kept.
    const res = await apiClient.post("/auth/token/refresh", refreshToken ? { refresh_token: refreshToken } : {});
    const { access_token, refresh_token: rotated } = res.data.data;
    tokenManager.set(access_token);
    if (rotated) writeRefreshTokenCookie(rotated);
    return access_token as string;
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 400 || status === 401 || status === 403) {
      throw new SessionExpiredError(status);
    }
    throw error;
  }
};

/**
 * Refresh the access token, sharing a refresh already in progress.
 * Resolves with the new access token. Rejects with SessionExpiredError when the
 * server refuses the refresh token, or the underlying error when it's transient.
 */
export const refreshSession = (): Promise<string> => {
  if (!inFlight) {
    inFlight = doRefresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
};

/**
 * Resolves once a signed-in tab has an access token to send, refreshing first
 * if the page has only just loaded and the token isn't back yet.
 *
 * For public endpoints whose answer depends on who's asking -- the course and
 * exam catalogues show each student their city tier's price. Sent without a
 * token, they answer for a visitor, and that answer would be cached and shown
 * even though checkout then charges the student's own price. Never rejects: a
 * failed refresh just means the request goes out as a visitor's.
 */
export const whenSessionReady = async (): Promise<void> => {
  if (tokenManager.get()) return;
  if (typeof document === "undefined" || !document.cookie.includes(`${AUTH_COOKIE}=1`)) return;
  await refreshSession().catch(() => undefined);
};
