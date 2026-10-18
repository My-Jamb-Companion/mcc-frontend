import { API_URL } from "@/src/config";

export type ConsentStatus = "pending" | "granted" | "declined" | "expired" | "revoked";

export interface ConsentRequestInfo {
  /** The child's first name only. */
  child_name: string | null;
  status: ConsentStatus;
  expires_at: string | null;
}

export class ConsentError extends Error {
  constructor(message: string, readonly code?: string) {
    super(message);
  }
}

const call = async (token: string, init?: RequestInit): Promise<ConsentRequestInfo> => {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/consent/requests/${encodeURIComponent(token)}`, {
      ...init,
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new ConsentError("We couldn't reach SmartLearnersHQ. Check your connection and try again.");
  }
  const body = (await response.json().catch(() => null)) as
    | { data?: ConsentRequestInfo; error?: { message?: string; code?: string }; message?: string }
    | null;
  if (!response.ok || !body?.data) {
    const message = body?.error?.message ?? body?.message ?? "This approval link isn't valid.";
    throw new ConsentError(message, body?.error?.code);
  }
  return body.data;
};

/** Endpoint: GET /consent/requests/<token> -- public; the token in the emailed link is the credential. */
export const getConsentRequest = (token: string) => call(token);

/** Endpoint: POST /consent/requests/<token> -- the guardian's answer, given once. */
export const answerConsentRequest = (token: string, decision: "grant" | "decline") =>
  call(token, { method: "POST", body: JSON.stringify({ decision }) });
