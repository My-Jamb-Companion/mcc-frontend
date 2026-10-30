"use client";
import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Button, ConfirmModal, Icon, showError, showSuccess} from "@mcc/ui";
import QuestionListEditor from "@/src/features/question-editor/QuestionListEditor";
import {useDeleteMockPaper, useMockPaper, useMockPapers, useMockPool, useSaveMockPaper} from "../hooks/useMockPapers";
import {getApiErrorMessage} from "../services/exam.service";
import type {ApiMockPaper, ApiMockPool} from "../services/mocks.service";
import {
  blueprintTotal,
  canUseBlueprint,
  emptyMockForm,
  formFromDetail,
  mockPayload,
  MockForm,
  plannedQuestionCount,
  usesOwnQuestions,
  validateMockForm,
} from "../helper/mockForm";

const inputClass = "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400";

/** A program's Mock Exams: the full-length, timed papers its students sit. */
export default function MockExams() {
  const params = useSearchParams();
  const router = useRouter();
  const programId = params.get("id");
  const {data: papers, isLoading, isError} = useMockPapers(programId);
  const {data: pool} = useMockPool(programId);
  const remove = useDeleteMockPaper(programId ?? "");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [deleting, setDeleting] = useState<ApiMockPaper | null>(null);

  useEffect(() => {
    if (!programId) router.push("/dashboard/exam-program");
  }, [programId, router]);
  if (!programId) return null;

  if (editing) {
    return <MockPaperEditor programId={programId} paperId={editing === "new" ? null : editing} pool={pool} onClose={() => setEditing(null)} />;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? router.back() : router.push(`/dashboard/exam-program/edit-program?id=${programId}`))}
            className="mb-2 flex items-center gap-1 text-sm text-subtle hover:underline"
          >
            <Icon icon="ph:arrow-left" size={14} />
            Back to the program
          </button>
          <h1 className="text-2xl font-semibold">Mock exams</h1>
          <p className="mt-1 max-w-2xl text-sm text-subtle">
            Full-length, timed papers students sit under exam conditions: the clock is the server&apos;s, nothing is marked until they
            submit, and each result lists how every topic went. They count for more than practice in a student&apos;s predicted score.
          </p>
        </div>
        <Button onClick={() => setEditing("new")} leftIcon={<Icon icon="ph:plus" size={16} />}>
          New mock exam
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted">Loading…</p>}
      {isError && <p className="text-sm text-red-600">Couldn&apos;t load the mock exams. Please try again.</p>}

      {papers && papers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-muted/30 px-6 py-12 text-center">
          <p className="font-semibold">No mock exams yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-subtle">
            Build one from this program&apos;s Practice and Smart Zone questions (a fresh paper for every attempt), or write a fixed paper.
            {pool ? ` The program has ${pool.total} question${pool.total === 1 ? "" : "s"} to draw from.` : ""}
          </p>
        </div>
      )}

      {papers && papers.length > 0 && (
        <ul className="flex flex-col gap-3">
          {papers.map((paper) => (
            <li key={paper.paper_id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-muted/20 p-5">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {paper.title}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${paper.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {paper.is_published ? "Published" : "Draft"}
                  </span>
                  {paper.paid_only && <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">Paid students</span>}
                </p>
                <p className="mt-1 text-sm text-subtle">
                  {paper.mode === "auto" ? (paper.pool_source === "paper" ? "Drawn from its own questions" : paper.pool_source === "both" ? "Drawn from the program and its own questions" : "Fresh questions each attempt") : "Fixed questions"} · {paper.question_count ?? 0} questions ·{" "}
                  {paper.duration_minutes} min
                  {paper.passing_score !== null && ` · pass mark ${paper.passing_score}%`} · {paper.attempts} attempt{paper.attempts === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setEditing(paper.paper_id)}>Edit</Button>
                <Button variant="outline" onClick={() => setDeleting(paper)} className="text-red-500">Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={!!deleting}
        variant="danger"
        title="Delete this mock exam?"
        message={
          <p>
            &quot;{deleting?.title}&quot; will no longer be offered. Students&apos; past results stay in their history and in their predicted
            score{deleting?.mode === "fixed" ? ", but a fixed paper's questions go with it, so their review of it will be empty" : ""}.
          </p>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          const target = deleting;
          setDeleting(null);
          if (!target) return;
          remove.mutate(target.paper_id, {
            onSuccess: () => showSuccess("Mock exam deleted."),
            onError: (error) => showError(getApiErrorMessage(error, "Couldn't delete this mock exam.")),
          });
        }}
      />
    </section>
  );
}

function Toggle({label, hint, checked, onChange}: {label: string; hint: string; checked: boolean; onChange: (v: boolean) => void}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-muted/20 p-4">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-violet-600" />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-subtle">{hint}</span>
      </span>
    </label>
  );
}

function MockPaperEditor({programId, paperId, pool, onClose}: {
  programId: string;
  paperId: string | null;
  pool: ApiMockPool | undefined;
  onClose: () => void;
}) {
  const {data: detail, isLoading} = useMockPaper(paperId);
  const save = useSaveMockPaper(programId);
  const [form, setForm] = useState<MockForm>(emptyMockForm);
  const [loaded, setLoaded] = useState(!paperId);
  const [errors, setErrors] = useState<string[]>([]);

  // Loaded once: later refetches must not wipe what is being typed.
  useEffect(() => {
    if (detail && !loaded) {
      setForm(formFromDetail(detail));
      setLoaded(true);
    }
  }, [detail, loaded]);

  const set = <K extends keyof MockForm>(field: K, value: MockForm[K]) => setForm((f) => ({...f, [field]: value}));

  const submit = (publish: boolean) => {
    const next = {...form, published: publish};
    const problems = validateMockForm(next, pool);
    setErrors(problems);
    if (problems.length) return;
    save.mutate(
      {paperId, input: mockPayload(next, pool)},
      {
        onSuccess: () => {
          showSuccess(publish ? "Mock exam published." : "Mock exam saved as a draft.");
          onClose();
        },
        onError: (error) => showError(getApiErrorMessage(error, "Couldn't save this mock exam.")),
      },
    );
  };

  if (paperId && (isLoading || !loaded)) return <p className="text-sm text-muted">Loading…</p>;

  const planned = plannedQuestionCount(form, pool);
  const asked = form.useBlueprint ? blueprintTotal(form, pool) : 0;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <button type="button" onClick={onClose} className="mb-2 flex items-center gap-1 text-sm text-subtle hover:underline">
          <Icon icon="ph:arrow-left" size={14} />
          Back to mock exams
        </button>
        <h1 className="text-2xl font-semibold">{paperId ? "Edit mock exam" : "New mock exam"}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm font-medium text-gray-700">Title</span>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Full mock 1" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm font-medium text-gray-700">Description (optional)</span>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className={inputClass}
            placeholder="Shown to students before they begin" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Time allowed (minutes)</span>
          <input type="number" min={1} max={360} value={form.duration} onChange={(e) => set("duration", e.target.value)} className={inputClass} />
          <span className="text-xs text-gray-400">The server keeps the clock; the exam is submitted for the student when it runs out.</span>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Pass mark (%)</span>
          <input type="number" min={0} max={100} value={form.passingScore} onChange={(e) => set("passingScore", e.target.value)}
            placeholder="Optional: no pass/fail if empty" className={inputClass} />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">How the paper is made</p>
        <div className="grid gap-3 md:grid-cols-2" role="radiogroup" aria-label="How the paper is made">
          {([
            ["auto", "Drawn fresh each attempt", "Each attempt takes a different random set from a pool, so no two attempts are the same."],
            ["fixed", "A fixed paper", "Questions you write or upload for this paper. Everyone sits all of them, in the same set."],
          ] as const).map(([value, label, hint]) => (
            <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${form.mode === value ? "border-violet-500 bg-violet-50/50" : "border-muted/20"}`}>
              <input type="radio" name="mode" checked={form.mode === value} onChange={() => set("mode", value)} className="mt-1 accent-violet-600" />
              <span>
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs text-subtle">{hint}</span>
              </span>
            </label>
          ))}
        </div>

        {form.mode === "auto" && (
          <div className="flex flex-col gap-3 rounded-2xl border border-muted/20 p-4">
            <p className="text-sm font-semibold">Where the questions are drawn from</p>
            <div className="grid gap-2 md:grid-cols-3" role="radiogroup" aria-label="Where the questions are drawn from">
              {([
                ["program", "The program's questions", `Its Practice and Smart Zone questions (${pool?.total ?? 0} available).`],
                ["paper", "This mock exam's own questions", "Questions you upload or write just for this mock exam."],
                ["both", "Both", "Mix the program's questions with this mock exam's own."],
              ] as const).map(([value, label, hint]) => (
                <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${form.poolSource === value ? "border-violet-500 bg-violet-50/50" : "border-muted/20"}`}>
                  <input type="radio" name="poolSource" checked={form.poolSource === value} onChange={() => set("poolSource", value)} className="mt-1 accent-violet-600" />
                  <span>
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-subtle">{hint}</span>
                  </span>
                </label>
              ))}
            </div>

            {canUseBlueprint(form) && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.useBlueprint} onChange={(e) => set("useBlueprint", e.target.checked)} className="accent-violet-600" />
                Choose how many questions come from each module
              </label>
            )}

            {canUseBlueprint(form) && form.useBlueprint ? (
              <div className="flex flex-col gap-2">
                {(pool?.modules ?? []).map((m) => (
                  <label key={m.module_id} className="flex items-center justify-between gap-3 rounded-lg border border-muted/20 px-3 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{m.title}</span>
                      <span className="block truncate text-xs text-subtle">{m.topic_title} › {m.sub_topic_title} · {m.questions} available</span>
                    </span>
                    <input type="number" min={0} max={m.questions} value={form.blueprint[m.module_id] ?? ""} aria-label={`Questions from ${m.title}`}
                      onChange={(e) => set("blueprint", {...form.blueprint, [m.module_id]: e.target.value})}
                      placeholder="0" className={`${inputClass} w-24 text-right`} />
                  </label>
                ))}
                <p className="text-sm font-semibold">{asked} question{asked === 1 ? "" : "s"} per attempt</p>
              </div>
            ) : (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-700">Questions per attempt</span>
                <input type="number" min={1} max={300} value={form.questionCount} onChange={(e) => set("questionCount", e.target.value)} className={`${inputClass} w-32`} />
                <span className="text-xs text-gray-400">
                  {form.poolSource === "program"
                    ? "Spread across the program's modules in proportion to how many questions each has."
                    : "Picked at random from the pool each attempt, so add more questions than this."}
                </span>
              </label>
            )}
          </div>
        )}

        {usesOwnQuestions(form) && (
          <div className="rounded-2xl border border-muted/20 p-4">
            <p className="text-sm font-semibold">
              {form.mode === "fixed" ? "The paper's questions" : "This mock exam's own questions"} ({form.questions.length})
            </p>
            <p className="mb-3 mt-1 text-sm text-subtle">
              Use <b>Upload questions</b> to add many at once from an Excel or CSV file (it can include reading passages and directions: see the template), <b>Add from bank</b> to copy from the Question Bank, or add them one by one.
              The response you write under each option is shown to the student when they review their result, not during the exam.
            </p>
            <QuestionListEditor questions={form.questions} onChange={(q) => set("questions", q)} withResponses withPassages responsesShown="review" />
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Toggle label="Shuffle the questions" hint="Each attempt sees them in a different order." checked={form.shuffleQuestions} onChange={(v) => set("shuffleQuestions", v)} />
        <Toggle label="Shuffle the options" hint="Each question's options are mixed up." checked={form.shuffleOptions} onChange={(v) => set("shuffleOptions", v)} />
        <Toggle label="Paid students only" hint="A free registration sees it locked." checked={form.paidOnly} onChange={(v) => set("paidOnly", v)} />
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="list-disc rounded-xl border border-red-200 bg-red-50 py-3 pl-8 pr-4 text-sm text-red-700">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-muted/20 pt-5">
        <p className="text-sm text-subtle">
          {planned} question{planned === 1 ? "" : "s"} · {form.duration || "?"} min
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onClose} disabled={save.isPending}>Cancel</Button>
          <Button variant="outline" onClick={() => submit(false)} disabled={save.isPending}>
            {form.published && paperId ? "Unpublish and save" : "Save draft"}
          </Button>
          <Button onClick={() => submit(true)} loading={save.isPending} disabled={save.isPending}>
            {detail?.is_published ? "Save changes" : "Publish"}
          </Button>
        </div>
      </div>
    </section>
  );
}
