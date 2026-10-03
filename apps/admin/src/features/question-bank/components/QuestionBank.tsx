"use client";

import {useEffect, useState} from "react";
import {ConfirmModal, Icon, showError, showSuccess} from "@mcc/ui";
import {useCatalogOptions} from "@/src/features/exam-catalog/hooks/useCatalog";
import type {ApiBankQuestion} from "@/src/features/question-editor/bank";
import {useBankQuestions, useBankTopics, useDeleteBankQuestion} from "../hooks/useQuestionBank";
import {Difficulty, getApiErrorMessage} from "../services/questionBank.service";
import BankQuestionModal from "./BankQuestionModal";

const PAGE_SIZE = 15;
const select = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#6C2BD9]";

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  easy: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  hard: "bg-rose-50 text-rose-700",
};

function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function QuestionBank() {
  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ApiBankQuestion | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ApiBankQuestion | null>(null);

  const debouncedSearch = useDebounced(search);
  const {options: subjects} = useCatalogOptions("subjects");
  const topics = useBankTopics();
  const list = useBankQuestions({search: debouncedSearch, subject_id: subjectId, topic, difficulty, page, limit: PAGE_SIZE});
  const remove = useDeleteBankQuestion();

  const rows = list.data?.questions ?? [];
  const total = list.data?.total ?? 0;
  const filtered = !!(debouncedSearch || subjectId || topic || difficulty);

  function filter(fn: () => void) {
    fn();
    setPage(1);
  }

  function handleDelete() {
    if (!deleting) return;
    const target = deleting;
    remove.mutate(target.bank_id, {
      onSuccess: () => showSuccess("Question deleted from the bank. Sets it was copied into are unchanged."),
      onError: (error) => showError(getApiErrorMessage(error, "Couldn't delete the question. Please try again.")),
    });
    setDeleting(null);
  }

  return (
    <div className="h-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Question Bank</h1>
          <p className="mt-1 text-sm text-slate-500">
            Reusable questions for Courses and Exam Programs. Adding one to a set copies it, so changing a question here
            never changes a course or exam program.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Icon icon="line-md:plus" size={16} />
          Add question
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={search}
            onChange={(e) => filter(() => setSearch(e.target.value))}
            placeholder="Search questions or topics"
            aria-label="Search the bank"
            className={`${select} sm:col-span-2 lg:col-span-4`}
          />
          <select value={subjectId} aria-label="Subject" onChange={(e) => filter(() => setSubjectId(e.target.value))} className={select}>
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select value={topic} aria-label="Topic" onChange={(e) => filter(() => setTopic(e.target.value))} className={select}>
            <option value="">All topics</option>
            {(topics.data ?? []).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={difficulty}
            aria-label="Difficulty"
            onChange={(e) => filter(() => setDifficulty(e.target.value as Difficulty | ""))}
            className={select}
          >
            <option value="">Any difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <span className="self-center text-sm text-slate-500">
            {list.data ? `${total} ${total === 1 ? "question" : "questions"}` : ""}
          </span>
        </div>

        {list.isLoading ? (
          <p className="py-10 text-center text-sm text-slate-400">Loading the bank…</p>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            {filtered ? "No questions match these filters." : "The bank is empty. Add a question, or save a set to it from any course or exam program."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4 font-medium">Question</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Subject / topic</th>
                  <th className="py-2 pr-4 font-medium">Difficulty</th>
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((q) => (
                  <tr key={q.bank_id} className="border-b border-slate-50 align-top">
                    <td className="max-w-md py-3 pr-4">
                      <p className="font-medium text-slate-900">{q.question_text}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {q.options.length} options
                        {q.option_feedback?.some(Boolean) ? " · has Practice responses" : ""}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{q.question_type === "multi_choice" ? "Multiple" : "Single"}</td>
                    <td className="py-3 pr-4 text-slate-600">
                      {q.subject_name || q.topic ? [q.subject_name, q.topic].filter(Boolean).join(" · ") : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {q.difficulty ? (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${DIFFICULTY_STYLE[q.difficulty]}`}>
                          {q.difficulty}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 pr-4 capitalize text-slate-600">{q.source}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(q)}
                          aria-label={`Edit: ${q.question_text}`}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-violet-600"
                        >
                          <Icon icon="lucide:pencil" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(q)}
                          aria-label={`Delete: ${q.question_text}`}
                          className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-500"
                        >
                          <Icon icon="lucide:trash-2" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {list.data && list.data.pages > 1 && (
          <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              {(list.data.page - 1) * list.data.limit + 1}–{Math.min(list.data.page * list.data.limit, total)} of {total}
            </span>
            <button
              type="button"
              disabled={page >= list.data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <BankQuestionModal open={creating || !!editing} existing={editing} onClose={() => (setCreating(false), setEditing(null))} />

      <ConfirmModal
        open={!!deleting}
        variant="danger"
        title="Delete this question?"
        message="It is removed from the bank only. Courses and exam programs it was copied into keep their own copy."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
