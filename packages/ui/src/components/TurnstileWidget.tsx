"use client";

import {useEffect, useRef} from "react";

/**
 * Cloudflare Turnstile: the "are you a person?" check on sign-up forms. Usually invisible; it only shows a
 * small tick box when Cloudflare is unsure. The widget hands `onToken` a one-time token to send with the
 * sign-up (the server verifies it), and `null` when the token is gone (expired, or the check errored), so
 * the form can keep its button off until there is a fresh one.
 *
 * `siteKey` is the public key of the Turnstile widget; without one the component renders nothing and never
 * calls back, so a form that only requires a token when it has a key keeps working before the key exists.
 * A token works once: bump `resetSignal` after a failed submit to get a fresh one.
 */
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile did not load")));
      script.onerror = () => {
        scriptPromise = null; // let a later attempt try again
        reject(new Error("Turnstile could not be loaded"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export interface TurnstileWidgetProps {
  siteKey?: string;
  onToken: (token: string | null) => void;
  /** Must match the server's expected action; the sign-up forms use the default. */
  action?: string;
  /** Change this number to throw the current token away and get a fresh one. */
  resetSignal?: number;
}

export function TurnstileWidget({siteKey, onToken, action = "signup", resetSignal = 0}: TurnstileWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // The latest callback, without re-rendering the widget whenever the parent re-renders.
  const callback = useRef(onToken);
  callback.current = onToken;

  useEffect(() => {
    if (!siteKey || !container.current) return;
    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled || !container.current) return;
        widgetId.current = api.render(container.current, {
          sitekey: siteKey,
          action,
          callback: (token: string) => callback.current(token),
          "expired-callback": () => callback.current(null),
          "error-callback": () => callback.current(null),
        });
      })
      .catch(() => callback.current(null));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey, action]);

  useEffect(() => {
    if (resetSignal === 0 || !widgetId.current || !window.turnstile) return;
    callback.current(null);
    window.turnstile.reset(widgetId.current);
  }, [resetSignal]);

  if (!siteKey) return null;
  return <div ref={container} className="flex justify-center" data-testid="turnstile-widget" />;
}
