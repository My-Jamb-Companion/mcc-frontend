"use client";

import { useEffect } from "react";

const STORAGE_KEY = "mcc_acquisition_source";

export interface AcquisitionSource {
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  captured_at: string;
}

/**
 * Captures how a prospective student arrived (referrer link, ad campaign
 * UTM params) once per session, per the flow diagram's Section 1 — held
 * client-side until an account exists.
 *
 * No backend field exists yet to actually persist this against the student
 * record (POST /auth/signup takes only email/password) — this captures and
 * holds it, ready for whenever that field exists, rather than inventing one
 * unasked. See backend/docs/multi-portal-plan.md Phase 2.
 */
export const useCaptureAcquisitionSource = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return; // already captured this session

    const params = new URLSearchParams(window.location.search);
    const source: AcquisitionSource = {
      referrer: document.referrer || null,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      captured_at: new Date().toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(source));
  }, []);
};

export const getAcquisitionSource = (): AcquisitionSource | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AcquisitionSource) : null;
  } catch {
    return null;
  }
};
