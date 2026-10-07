"use client";

import Link from "next/link";
import {useEffect, useRef, useState} from "react";
import {extractApiError} from "@mcc/api";
import {Button, showError} from "@mcc/ui";
import {Answers, buildPayload, stepOfQuestion, stepProblems} from "../helper/survey";
import {useSubmitSurvey, useSurvey} from "../hooks/useFeedback";
import {QuestionField, QuestionShell} from "./SurveyQuestions";

const draftKey = (surveyKey: string) => `mcc:survey-draft:${surveyKey}`;

function readDraft(surveyKey: string): {answers: Answers; step: number} | null {
  try {
    const raw = window.localStorage.getItem(draftKey(surveyKey));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Centered({title, children}: {title: string; children?: React.ReactNode}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children}
    </div>
  );
}

/** The progress survey: four steps, answers kept as a draft on this device until they're sent. */
export default function ProgressSurvey() {
  const survey = useSurvey();
  const submit = useSubmitSurvey();
  const top = useRef<HTMLDivElement>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [problems, setProblems] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [restored, setRestored] = useState<string | null>(null);

  const definition = survey.data?.definition;

  // Pick up a draft once the questions are known.
  useEffect(() => {
    if (!definition || restored === definition.key) return;
    const draft = readDraft(definition.key);
    if (draft) {
      setAnswers(draft.answers);
      setStep(Math.min(draft.step, definition.steps.length - 1));
    }
    setRestored(definition.key);
  }, [definition, restored]);

  // Keep it as the student goes.
  useEffect(() => {
    if (!definition || restored !== definition.key || sent) return;
    try {
      window.localStorage.setItem(draftKey(definition.key), JSON.stringify({answers, step}));
    } catch {
      /* private mode: the draft just isn't kept */
    }
  }, [answers, step, definition, restored, sent]);

  useEffect(() => {
    top.current?.scrollIntoView({block: "start"});
  }, [step]);

  if (survey.isLoading || !definition) {
    return survey.isError ? <Centered title="Couldn't load the survey"><p className="mt-2 text-sm text-subtle">Please try again in a moment.</p></Centered> : <p className="py-20 text-center text-sm text-muted">Loading…</p>;
  }

  if (sent || survey.data?.submitted) {
    return (
      <Centered title={sent ? "Thank you! 🎉" : "You've already answered"}>
        <p className="mt-2 text-sm text-subtle">{sent ? "Your answers help us make MCC better for every student." : "Thanks again, your answers are with us."}</p>
        <Link href="/dashboard" className="mt-6">
          <Button type="button">Back to dashboard</Button>
        </Link>
      </Centered>
    );
  }

  const current = definition.steps[step];
  const last = step === definition.steps.length - 1;

  function next() {
    const found = stepProblems(current, answers);
    setProblems(found);
    if (Object.keys(found).length > 0) {
      const first = current.questions.find((q) => found[q.key]);
      if (first) document.getElementById(`q-${first.key}`)?.scrollIntoView({behavior: "smooth", block: "center"});
      return;
    }
    if (!last) return setStep(step + 1);

    submit.mutate(buildPayload(definition!, answers), {
      onSuccess: () => {
        try {
          window.localStorage.removeItem(draftKey(definition!.key));
        } catch {
          /* nothing to clear */
        }
        setSent(true);
      },
      onError: (error) => {
        const details = (error as {response?: {data?: {error?: {details?: Record<string, string>}}}}).response?.data?.error?.details;
        if (details && Object.keys(details).length > 0) {
          // The server found something the form didn't: go to the first step it belongs to.
          setProblems(details);
          setStep(Math.min(...Object.keys(details).map((k) => stepOfQuestion(definition!, k))));
          showError("Some answers need another look.");
        } else {
          showError(extractApiError(error, "Couldn't send your answers. Please try again."));
        }
      },
    });
  }

  return (
    <div ref={top} className="mx-auto w-full max-w-3xl px-4 pb-28 pt-7">
      <div className="mb-6 flex gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={definition.steps.length} aria-valuenow={step + 1} aria-label="Survey progress">
        {definition.steps.map((s, i) => <span key={s.id} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-foreground" : "bg-muted/25"}`} />)}
      </div>
      <p className="text-xs text-subtle">Step {step + 1} of {definition.steps.length} · {current.title}</p>
      <h1 className="mt-1 text-2xl font-semibold">{definition.title}</h1>
      <p className="mb-8 mt-1.5 text-sm text-subtle">{definition.intro}</p>

      {current.questions.map((q) => (
        <QuestionShell key={q.key} q={q} error={problems[q.key]}>
          <QuestionField q={q} value={answers[q.key]} onChange={(v) => { setAnswers((a) => ({...a, [q.key]: v})); setProblems((p) => { const {[q.key]: _gone, ...rest} = p; return rest; }); }} />
        </QuestionShell>
      ))}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-muted/20 bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Button type="button" variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
          <Button type="button" onClick={next} loading={submit.isPending}>
            {submit.isPending ? "Sending…" : last ? "Submit" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
