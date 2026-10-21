"use client";
import {useState} from "react";
import {Icon, showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {useMockAttempts, useMockPapers, useStartMockExam} from "@/src/features/exams/hooks/useExams";
import type {ApiMockPaper, ApiMockResult, ApiMockSession} from "@/src/features/exams/services/exam.service";
import {getMockSession} from "@/src/features/exams/services/exam.service";
import {durationLabel, timeUsedLabel} from "@/src/features/learnings/helper/mockExam";
import {KEY_GUIDE} from "@/src/features/learnings/helper/mockKeys";

interface MockExamsPanelProps {
  programId: string;
  /** An attempt began (or was resumed). */
  onStart: (session: ApiMockSession) => void;
  /** A past attempt's result was opened for review. */
  onReview: (result: ApiMockResult) => void;
}

/** The program's mock exams: what each is, the student's history on it, and how to start, resume or review. */
export default function MockExamsPanel({programId, onStart, onReview}: MockExamsPanelProps) {
  const {data: papers, isLoading} = useMockPapers(programId);
  const [intro, setIntro] = useState<ApiMockPaper | null>(null);

  if (isLoading || !papers || papers.length === 0) return null;

  return (
    <section aria-label="Mock exams" className="mx-4 mb-6 rounded-2xl border border-muted/20 p-5">
      <h2 className="flex items-center gap-2 text-base font-bold">
        <Icon icon="solar:clipboard-check-bold-duotone" size={20} className="text-primary" />
        Mock exams
      </h2>
      <p className="mt-1 text-xs text-subtle">
        Full-length, timed papers under exam conditions. No feedback until you finish, and they count for more than practice in your predicted score.
      </p>

      <ul className="mt-4 flex flex-col gap-3">
        {papers.map((paper) => (
          <PaperRow key={paper.paper_id} paper={paper} onBegin={() => setIntro(paper)} onStart={onStart} onReview={onReview} />
        ))}
      </ul>

      {intro && <MockIntro paper={intro} onClose={() => setIntro(null)} onStart={(s) => { setIntro(null); onStart(s); }} />}
    </section>
  );
}

function PaperRow({paper, onBegin, onStart, onReview}: {
  paper: ApiMockPaper;
  onBegin: () => void;
  onStart: (session: ApiMockSession) => void;
  onReview: (result: ApiMockResult) => void;
}) {
  const start = useStartMockExam();
  const [showAttempts, setShowAttempts] = useState(false);

  const resume = () =>
    start.mutate(paper.paper_id, {
      onSuccess: onStart,
      onError: (error) => showError(extractApiError(error, "Couldn't open this mock exam. Please try again.")),
    });

  return (
    <li className="rounded-2xl border border-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{paper.title}</p>
          <p className="mt-0.5 text-xs text-subtle">
            {paper.question_count} questions · {durationLabel(paper.duration_minutes)}
            {paper.passing_score !== null && ` · pass mark ${paper.passing_score}%`}
          </p>
          {paper.attempts > 0 && (
            <p className="mt-1 text-xs text-subtle">
              {paper.attempts} attempt{paper.attempts === 1 ? "" : "s"} · best {Math.round(paper.best_percent ?? 0)}% · last {Math.round(paper.last_percent ?? 0)}%
            </p>
          )}
        </div>

        {paper.locked ? (
          <span className="flex items-center gap-1.5 rounded-full bg-muted/10 px-3 py-1.5 text-xs font-semibold text-subtle">
            <Icon icon="ph:lock-simple" size={14} />
            Paid registration only
          </span>
        ) : paper.in_progress ? (
          <button type="button" onClick={resume} disabled={start.isPending}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {start.isPending ? "Opening…" : "Resume"}
          </button>
        ) : (
          <button type="button" onClick={onBegin}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
            {paper.attempts ? "Take again" : "Start"}
          </button>
        )}
      </div>

      {paper.in_progress && (
        <p className="mt-2 text-xs font-semibold text-amber-700">
          In progress: {Math.max(1, Math.round(paper.in_progress.remaining_seconds / 60))} min left. The clock keeps running.
        </p>
      )}
      {paper.locked && (
        <p className="mt-2 text-xs text-subtle">Mock exams come with a paid registration for this program.</p>
      )}

      {paper.attempts > 0 && (
        <button type="button" onClick={() => setShowAttempts((v) => !v)} aria-expanded={showAttempts}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
          {showAttempts ? "Hide past attempts" : "Past attempts"}
          <Icon icon={showAttempts ? "ph:caret-up" : "ph:caret-down"} size={12} />
        </button>
      )}
      {showAttempts && <Attempts paperId={paper.paper_id} onReview={onReview} />}
    </li>
  );
}

function Attempts({paperId, onReview}: {paperId: string; onReview: (result: ApiMockResult) => void}) {
  const {data: attempts, isLoading} = useMockAttempts(paperId);
  const [opening, setOpening] = useState<string | null>(null);

  const open = async (sessionId: string) => {
    setOpening(sessionId);
    try {
      const data = await getMockSession(sessionId);
      if ("results" in data) onReview(data);
    } catch (error) {
      showError(extractApiError(error, "Couldn't open that attempt."));
    } finally {
      setOpening(null);
    }
  };

  if (isLoading) return <p className="mt-2 text-xs text-subtle">Loading…</p>;
  return (
    <ul className="mt-2 divide-y divide-muted/15 rounded-xl border border-muted/20">
      {(attempts ?? []).map((a) => (
        <li key={a.session_id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
          <span>
            {new Date(a.finished_at).toLocaleDateString(undefined, {day: "numeric", month: "short", year: "numeric"})}
            <span className="text-subtle"> · {timeUsedLabel(a.seconds_used)}</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="font-semibold">
              {Math.round(a.percent)}%
              {a.passed !== null && <span className={a.passed ? " text-success" : " text-danger"}> {a.passed ? "passed" : "not passed"}</span>}
            </span>
            <button type="button" onClick={() => open(a.session_id)} disabled={opening === a.session_id}
              className="font-semibold text-primary disabled:opacity-50">
              Review
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The rules, shown before the clock starts: nothing begins until the student says so. */
function MockIntro({paper, onClose, onStart}: {paper: ApiMockPaper; onClose: () => void; onStart: (session: ApiMockSession) => void}) {
  const start = useStartMockExam();
  const begin = () =>
    start.mutate(paper.paper_id, {
      onSuccess: onStart,
      onError: (error) => showError(extractApiError(error, "Couldn't start this mock exam. Please try again.")),
    });

  return (
    <div role="dialog" aria-modal="true" aria-label={`Start ${paper.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-background shadow-xl">
        <div className="bg-primary-gradient px-6 py-6 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Mock exam</p>
          <h3 className="mt-1 text-xl font-bold">{paper.title}</h3>
          <p className="mt-2 text-sm opacity-90">
            {paper.question_count} questions · {durationLabel(paper.duration_minutes)}
            {paper.passing_score !== null && ` · pass mark ${paper.passing_score}%`}
          </p>
        </div>
        <div className="px-6 py-5">
          {paper.description && <p className="mb-3 text-sm text-subtle">{paper.description}</p>}
          <ul className="flex flex-col gap-2 text-sm">
            {[
              "The clock starts the moment you begin and does not stop, even if you close this page.",
              "Move around freely with the question palette, and flag questions to come back to.",
              "Your answers are saved as you go. You won't see whether they are right until you submit.",
              "A question left blank counts as wrong. Nothing is taken off for a wrong answer.",
              "When time runs out, your exam is submitted for you.",
            ].map((rule) => (
              <li key={rule} className="flex gap-2">
                <Icon icon="ph:check-circle" size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-muted/10 p-3">
            <p className="mb-2 text-sm font-semibold">You can do it all from the keyboard</p>
            <ul className="flex flex-col gap-1.5 text-xs">
              {KEY_GUIDE.map((g) => (
                <li key={g.text} className="flex items-center gap-2">
                  <span className="flex shrink-0 gap-1">
                    {g.keys.map((k) => (
                      <kbd key={k} className="flex h-6 w-6 items-center justify-center rounded border border-muted/40 bg-background font-semibold">{k}</kbd>
                    ))}
                  </span>
                  <span>{g.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-muted/20 bg-muted/5 px-6 py-4">
          <button type="button" onClick={onClose} disabled={start.isPending} className="rounded-full px-5 py-2 text-sm font-semibold text-subtle hover:bg-muted/10">
            Not now
          </button>
          <button type="button" onClick={begin} disabled={start.isPending} className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {start.isPending ? "Starting…" : "Begin exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
