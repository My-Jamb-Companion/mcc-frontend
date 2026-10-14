"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  answerConsentRequest,
  ConsentError,
  getConsentRequest,
  type ConsentRequestInfo,
} from "./consent.service";

type Load =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; info: ConsentRequestInfo };

const card: React.CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  padding: "32px clamp(20px,5vw,36px)",
  borderRadius: 20,
  background: "#fff",
  border: "1px solid #E5E5E5",
  boxShadow: "0 1px 2px rgba(0,0,0,.04)",
};

const button = (primary: boolean, disabled: boolean): React.CSSProperties => ({
  padding: "12px 22px",
  borderRadius: 999,
  fontSize: 16,
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.6 : 1,
  border: primary ? "none" : "1px solid #D4D4D4",
  background: primary ? "#6717DE" : "#fff",
  color: primary ? "#fff" : "#171717",
});

const RESULT_TEXT: Record<string, string> = {
  granted: "Thank you. You approved this account, and they can now use the whole of My Course Companion.",
  declined: "Thank you. You did not approve this account, so it stays limited to free learning.",
  expired: "This link has expired. Ask your child to send you a new one from their account.",
  revoked: "This approval is no longer valid.",
};

/** What a parent or guardian sees when they open the link in the approval email. No account is needed. */
export function ConsentRequest() {
  const token = useSearchParams().get("token");
  const [load, setLoad] = useState<Load>(token ? { phase: "loading" } : { phase: "error", message: "This approval link isn't complete." });
  const [sending, setSending] = useState<"grant" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getConsentRequest(token)
      .then((info) => !cancelled && setLoad({ phase: "ready", info }))
      .catch((e: unknown) => !cancelled && setLoad({ phase: "error", message: e instanceof Error ? e.message : "Something went wrong." }));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const answer = async (decision: "grant" | "decline") => {
    if (!token) return;
    setSending(decision);
    setError(null);
    try {
      const info = await answerConsentRequest(token, decision);
      setLoad({ phase: "ready", info });
    } catch (e) {
      setError(e instanceof ConsentError ? e.message : "We couldn't save your answer. Please try again.");
    } finally {
      setSending(null);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#FAFAFA", padding: "clamp(24px,6vw,72px) 16px" }}>
      <div style={card}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: ".04em", color: "#6717DE" }}>MY COURSE COMPANION</p>

        {load.phase === "loading" && <p style={{ marginTop: 20, color: "#525252" }}>Loading…</p>}

        {load.phase === "error" && (
          <>
            <h1 style={{ margin: "12px 0 8px", fontSize: 26 }}>We couldn&apos;t open this link</h1>
            <p role="alert" style={{ margin: 0, color: "#525252", lineHeight: 1.55 }}>{load.message}</p>
          </>
        )}

        {load.phase === "ready" && load.info.status === "pending" && (
          <>
            <h1 style={{ margin: "12px 0 8px", fontSize: 26, lineHeight: 1.2 }}>
              {load.info.child_name ?? "A student"} needs your approval
            </h1>
            <p style={{ margin: "0 0 16px", color: "#404040", lineHeight: 1.6 }}>
              {load.info.child_name ?? "A student"} signed up to My Course Companion, an online platform for exam preparation, and named you as
              their parent or guardian. Because they are under 18, we need your approval before they can use all of it.
            </p>
            <p style={{ margin: "0 0 8px", fontWeight: 600 }}>If you approve, they can:</p>
            <ul style={{ margin: "0 0 16px", paddingLeft: 20, color: "#404040", lineHeight: 1.7 }}>
              <li>make payments and buy courses and exam programs,</li>
              <li>use Brainy, the AI study companion,</li>
              <li>join live classes with teachers,</li>
              <li>appear on the learners&apos; leaderboard.</li>
            </ul>
            <p style={{ margin: "0 0 24px", color: "#404040", lineHeight: 1.6 }}>
              If you don&apos;t approve, or you don&apos;t know this person, they can still use free learning only. Read our{" "}
              <a href="/privacy" style={{ color: "#4F0FB0" }}>Privacy Policy</a> and <a href="/terms" style={{ color: "#4F0FB0" }}>Terms of Use</a> first
              if you wish.
            </p>

            {error && <p role="alert" style={{ margin: "0 0 12px", color: "#B42318", fontSize: 15 }}>{error}</p>}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <button type="button" disabled={sending !== null} onClick={() => answer("grant")} style={button(true, sending !== null)}>
                {sending === "grant" ? "Saving…" : "I approve"}
              </button>
              <button type="button" disabled={sending !== null} onClick={() => answer("decline")} style={button(false, sending !== null)}>
                {sending === "decline" ? "Saving…" : "I don't approve"}
              </button>
            </div>
          </>
        )}

        {load.phase === "ready" && load.info.status !== "pending" && (
          <>
            <h1 style={{ margin: "12px 0 8px", fontSize: 26 }}>
              {load.info.status === "granted" || load.info.status === "declined" ? "Your answer is saved" : "This link can't be used"}
            </h1>
            <p style={{ margin: 0, color: "#404040", lineHeight: 1.6 }}>{RESULT_TEXT[load.info.status]}</p>
          </>
        )}
      </div>
    </main>
  );
}
