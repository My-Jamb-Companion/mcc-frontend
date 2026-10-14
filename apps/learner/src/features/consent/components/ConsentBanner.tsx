"use client";

import {useState} from "react";
import {extractApiError} from "@mcc/api";
import {Button} from "@mcc/ui";
import {isPlausibleDob, isUnder18, todayIso} from "../helper/age";
import {useAskGuardian, useConsentState, useSubmitAge} from "../hooks/useConsent";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const field =
  "w-full rounded-md border border-muted/30 bg-transparent px-3 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 ring-primary/40";

/**
 * Tells a student what is limiting their account and how to fix it: an account with no date of birth yet
 * is asked for one, and a child (under 18) is asked for a parent or guardian's email and told where the
 * approval stands. Renders nothing for adults, parent-created children and everyone already approved.
 */
export function ConsentBanner() {
  const {data: state} = useConsentState();
  const submitAge = useSubmitAge();
  const askGuardian = useAskGuardian();

  const [dob, setDob] = useState("");
  const [guardian, setGuardian] = useState("");
  const [changing, setChanging] = useState(false);

  if (!state || !state.is_student) return null;

  // 1. No date of birth on file: ask for it (and a guardian, if it turns out they're under 18).
  if (state.status === "age_unknown") {
    const minor = isUnder18(dob);
    const valid = isPlausibleDob(dob) && (!minor || EMAIL.test(guardian));
    return (
      <Strip tone="info" title="Add your date of birth">
        <p className="text-sm">
          We ask this to keep younger learners safe. If you are under 18, a parent or guardian will need to approve
          your account before you can pay for courses, use Brainy, join live classes or appear on the leaderboard.
        </p>
        <form
          className="mt-3 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) submitAge.mutate({date_of_birth: dob, guardian_email: minor ? guardian.trim() : undefined});
          }}
        >
          <label className="text-sm">
            Date of birth
            <input type="date" max={todayIso()} value={dob} onChange={(e) => setDob(e.target.value)} className={`${field} mt-1`} />
          </label>
          {minor && (
            <label className="text-sm">
              Parent or guardian&apos;s email
              <input type="email" value={guardian} onChange={(e) => setGuardian(e.target.value)} className={`${field} mt-1`} />
            </label>
          )}
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <Button type="submit" size="sm" width="fit" loading={submitAge.isPending} disabled={!valid}>
              Save
            </Button>
            {submitAge.isError && (
              <p role="alert" className="text-sm text-red-600">
                {extractApiError(submitAge.error, "We couldn't save that. Please try again.")}
              </p>
            )}
          </div>
        </form>
      </Strip>
    );
  }

  if (!state.restricted) return null;

  // 2. A child waiting on a guardian.
  const pending = state.status === "pending" && !changing;
  const emailOk = EMAIL.test(guardian);
  return (
    <Strip tone="warn" title={pending ? "Waiting for your parent or guardian" : "A parent or guardian needs to approve your account"}>
      {pending ? (
        <p className="text-sm">
          We emailed a link to <strong>{state.guardian_email_masked}</strong>. Until they approve, you can keep using free
          learning, but payments, Brainy, live classes and the leaderboard are switched off.
        </p>
      ) : (
        <p className="text-sm">
          {state.status === "declined"
            ? "Your parent or guardian didn't approve this account. You can ask someone else."
            : state.status === "expired"
              ? "The last approval link expired. Send a new one."
              : "Because you're under 18, we need a parent or guardian to approve your account."}{" "}
          Until then you can keep using free learning.
        </p>
      )}

      {(!pending || changing) && (
        <form
          className="mt-3 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (emailOk) askGuardian.mutate(guardian.trim(), {onSuccess: () => setChanging(false)});
          }}
        >
          <label className="text-sm grow max-w-sm">
            Parent or guardian&apos;s email
            <input type="email" value={guardian} onChange={(e) => setGuardian(e.target.value)} className={`${field} mt-1`} />
          </label>
          <Button type="submit" size="sm" width="fit" loading={askGuardian.isPending} disabled={!emailOk}>
            Send approval link
          </Button>
        </form>
      )}

      {pending && (
        <button type="button" onClick={() => setChanging(true)} className="mt-2 text-sm font-semibold underline">
          Use a different email or send it again
        </button>
      )}

      {askGuardian.isError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {extractApiError(askGuardian.error, "We couldn't send that. Please try again.")}
        </p>
      )}
    </Strip>
  );
}

function Strip({tone, title, children}: {tone: "info" | "warn"; title: string; children: React.ReactNode}) {
  const colours = tone === "warn" ? "bg-amber-50 border-amber-200 text-amber-950" : "bg-sky-50 border-sky-200 text-sky-950";
  return (
    <section role="status" className={`mx-4 mt-3 rounded-xl border px-4 py-3 ${colours}`}>
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-1">{children}</div>
    </section>
  );
}
