"use client";

import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import {useRef, useState} from "react";
import {Icon, showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {BugFormErrors, bugFormErrors, MAX_DESCRIPTION, startingPage, Urgency, URGENCIES} from "../helper/bugForm";
import {useReportBug} from "../hooks/useFeedback";

const LETTERS = ["A", "B", "C"];
const input = "w-full rounded-xl border border-muted/30 bg-background px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

function Label({children, required}: {children: React.ReactNode; required?: boolean}) {
  return (
    <span className="mb-3 flex items-center gap-2 text-xl font-semibold md:text-2xl">
      {children}
      {required && <span aria-hidden className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/20 text-xs">*</span>}
      {required && <span className="sr-only">required</span>}
    </span>
  );
}

function FieldError({message}: {message?: string}) {
  return message ? <p role="alert" className="mt-2 text-sm text-red-500">{message}</p> : null;
}

/** The "Report a Bug" form: what happened, which page, how urgent, an optional screenshot. */
export default function ReportBug() {
  const router = useRouter();
  const params = useSearchParams();
  const report = useReportBug();
  const fileInput = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  // Starts from the page they were on when they opened the menu (editable).
  const [pageUrl, setPageUrl] = useState(() =>
    typeof window === "undefined" ? "" : startingPage(params.get("from"), window.location.origin),
  );
  const [urgency, setUrgency] = useState<Urgency | "">("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<BugFormErrors>({});
  const [done, setDone] = useState<{screenshotSaved: boolean} | null>(null);

  function pick(file: File | undefined) {
    if (!file) return;
    setScreenshot(file);
    setErrors((e) => ({...e, screenshot: bugFormErrors({description: "x".repeat(5), page_url: "x", urgency: "urgent"}, file).screenshot}));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = bugFormErrors({description, page_url: pageUrl, urgency}, screenshot);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    report.mutate(
      {description: description.trim(), page_url: pageUrl.trim(), urgency, screenshot},
      {
        onSuccess: (r) => setDone({screenshotSaved: r.screenshot_saved}),
        onError: (error) => {
          // The server lists each bad field; show them where they belong.
          const details = (error as {response?: {data?: {error?: {details?: BugFormErrors}}}}).response?.data?.error?.details;
          if (details && Object.keys(details).length > 0) setErrors(details);
          else showError(extractApiError(error, "Couldn't send your report. Please try again."));
        },
      },
    );
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-4 text-6xl">✅</div>
        <h1 className="text-3xl font-bold">Thanks, we&apos;ve got it</h1>
        <p className="mt-3 text-subtle">Our team will look into it. You won&apos;t need to do anything else.</p>
        {!done.screenshotSaved && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">Your report was sent, but we couldn&apos;t attach the screenshot.</p>
        )}
        <div className="mt-8 flex gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-full bg-primary px-6 py-3 font-semibold text-white">Back to what I was doing</button>
          <Link href="/dashboard" className="rounded-full border border-muted/30 px-6 py-3 font-semibold">Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto w-full max-w-3xl px-6 py-10 md:py-14">
      <h1 className="mb-10 text-4xl font-bold tracking-tight md:text-5xl">Report a Bug <span aria-hidden>⚠️</span></h1>

      <div className="mb-9">
        <label htmlFor="bug-description"><Label required>Describe the issue</Label></label>
        <textarea
          id="bug-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={MAX_DESCRIPTION}
          rows={5}
          className={`${input} resize-y`}
          aria-invalid={!!errors.description}
        />
        <FieldError message={errors.description} />
      </div>

      <div className="mb-9">
        <label htmlFor="bug-page"><Label required>What page were you on? (paste the link)</Label></label>
        <input id="bug-page" value={pageUrl} onChange={(e) => setPageUrl(e.target.value)} className={`${input} md:max-w-xl`} aria-invalid={!!errors.page_url} />
        <FieldError message={errors.page_url} />
      </div>

      <fieldset className="mb-9">
        <legend><Label required>How urgent is this issue?</Label></legend>
        <div className="flex flex-col items-start gap-3">
          {URGENCIES.map((u, i) => (
            <button
              key={u.value}
              type="button"
              role="radio"
              aria-checked={urgency === u.value}
              onClick={() => setUrgency(u.value)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-lg shadow-sm transition-colors ${
                urgency === u.value ? "border-primary bg-primary/5" : "border-muted/30 hover:border-primary/50"
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-white ${urgency === u.value ? "bg-primary" : "bg-neutral-500"}`}>{LETTERS[i]}</span>
              <span>
                {u.label}
                <span className="block text-xs text-subtle">{u.hint}</span>
              </span>
            </button>
          ))}
        </div>
        <FieldError message={errors.urgency} />
      </fieldset>

      <div className="mb-10">
        <Label>Snap a screenshot! (optional)</Label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]); }}
          className={`flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-muted/40"}`}
        >
          <button type="button" onClick={() => fileInput.current?.click()} className="flex items-center gap-2 text-lg font-medium text-subtle hover:text-foreground">
            <Icon icon="lucide:upload" size={20} />
            {screenshot ? screenshot.name : "Click to choose a file or drag here"}
          </button>
          <p className="text-sm text-subtle">Accepts image files (up to 5 MB)</p>
          {screenshot && (
            <button type="button" onClick={() => { setScreenshot(null); if (fileInput.current) fileInput.current.value = ""; setErrors((e) => ({...e, screenshot: undefined})); }} className="text-sm font-medium text-red-500 hover:underline">
              Remove
            </button>
          )}
          <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" aria-label="Screenshot" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        </div>
        <FieldError message={errors.screenshot} />
      </div>

      <button type="submit" disabled={report.isPending} className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3.5 text-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black">
        {report.isPending ? "Sending…" : "Submit"}
        <Icon icon="lucide:arrow-right" size={20} />
      </button>
    </form>
  );
}
