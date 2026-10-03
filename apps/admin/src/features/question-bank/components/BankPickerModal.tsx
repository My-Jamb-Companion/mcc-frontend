"use client";

import {useEffect, useMemo, useState} from "react";
import {Modal} from "@mcc/ui";
import {useCatalogOptions} from "@/src/features/exam-catalog/hooks/useCatalog";
import {
  ApiBankQuestion,
  bankQuestionKey,
  editorQuestionKey,
  fromBankQuestion,
} from "@/src/features/question-editor/bank";
import type {CreatPracticeQuestionType} from "@/src/features/question-editor/types";
import {useBankQuestions, useBankTopics} from "../hooks/useQuestionBank";
import type {Difficulty} from "../services/questionBank.service";

const select = "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400";

function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/**
 * Pick questions from the shared bank into a set. Picking COPIES: the chosen
 * questions come back as independent editor questions (fresh ids), so editing
 * one never changes the bank or another set. Practice responses are copied
 * only into a Practice set.
 */
export default function BankPickerModal({
  open,
  inSet,
  withResponses,
  onAdd,
  onClose,
}: {
  open: boolean;
  /** The set's current questions, to mark the ones already there. */
  inSet: CreatPracticeQuestionType[];
  withResponses: boolean;
  onAdd: (questions: CreatPracticeQuestionType[]) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState<Map<string, ApiBankQuestion>>(new Map());

  const debouncedSearch = useDebounced(search);
  const {options: subjects} = useCatalogOptions("subjects");
  const topics = useBankTopics(open);
  const list = useBankQuestions(
    {search: debouncedSearch, subject_id: subjectId, topic, difficulty, page, limit: 8},
    open,
  );

  const present = useMemo(() => new Set(inSet.map(editorQuestionKey)), [inSet]);
  const rows = list.data?.questions ?? [];
  const copiedResponses = withResponses ? 0 : [...picked.values()].filter((q) => q.option_feedback?.some(Boolean)).length;

  function reset() {
    setSearch("");
    setSubjectId("");
    setTopic("");
    setDifficulty("");
    setPage(1);
    setPicked(new Map());
  }

  function close() {
    reset();
    onClose();
  }

  function toggle(q: ApiBankQuestion) {
    setPicked((prev) => {
      const next = new Map(prev);
      if (next.has(q.bank_id)) next.delete(q.bank_id);
      else next.set(q.bank_id, q);
      return next;
    });
  }

  function add() {
    onAdd([...picked.values()].map((q) => fromBankQuestion(q, withResponses)));
    reset();
  }

  const filterChanged = (fn: () => void) => () => {
    fn();
    setPage(1);
  };

  return (
    <Modal open={open} title="Add from the Question Bank" maxWidth="max-w-3xl">
      <div className="flex flex-col gap-4">
        <div className="grid gap-2 sm:grid-cols-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search questions or topics"
            aria-label="Search the bank"
            className={`${select} sm:col-span-4`}
          />
          <select
            value={subjectId}
            aria-label="Subject"
            onChange={(e) => filterChanged(() => setSubjectId(e.target.value))()}
            className={select}
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select value={topic} aria-label="Topic" onChange={(e) => filterChanged(() => setTopic(e.target.value))()} className={select}>
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
            onChange={(e) => filterChanged(() => setDifficulty(e.target.value as Difficulty | ""))()}
            className={select}
          >
            <option value="">Any difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <span className="self-center text-xs text-gray-500">{list.data ? `${list.data.total} in the bank` : ""}</span>
        </div>

        <div className="max-h-[48vh] overflow-y-auto rounded-xl border border-gray-100">
          {list.isLoading ? (
            <p className="py-10 text-center text-sm text-gray-400">Loading the bank…</p>
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              {list.data?.total === 0 && !debouncedSearch && !subjectId && !topic && !difficulty
                ? "The bank is empty. Save a set of questions to it, or add some from the Question Bank page."
                : "No questions match."}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {rows.map((q) => {
                const inThisSet = present.has(bankQuestionKey(q));
                const checked = picked.has(q.bank_id);
                return (
                  <li key={q.bank_id}>
                    <label
                      className={`flex items-start gap-3 px-4 py-3 text-sm ${
                        inThisSet ? "cursor-not-allowed bg-gray-50 opacity-60" : "cursor-pointer hover:bg-violet-50/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={inThisSet}
                        onChange={() => toggle(q)}
                        className="mt-1 h-4 w-4"
                        aria-label={`Select: ${q.question_text}`}
                      />
                      <span className="flex-1">
                        <span className="block font-medium text-gray-900">{q.question_text}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                          <span>{q.question_type === "multi_choice" ? "Multiple choice" : "Single choice"}</span>
                          <span>· {q.options.length} options</span>
                          {q.subject_name && <span>· {q.subject_name}</span>}
                          {q.topic && <span>· {q.topic}</span>}
                          {q.difficulty && <span className="rounded-full bg-gray-100 px-2 py-0.5 capitalize">{q.difficulty}</span>}
                          {q.option_feedback?.some(Boolean) && (
                            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-violet-700">Has responses</span>
                          )}
                          {inThisSet && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Already in this set</span>}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {list.data && list.data.pages > 1 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {list.data.page} of {list.data.pages}
            </span>
            <button
              type="button"
              disabled={page >= list.data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

        {copiedResponses > 0 && (
          <p className="rounded-xl bg-gray-50 px-4 py-2.5 text-xs text-gray-600">
            {copiedResponses} of the selected {copiedResponses === 1 ? "question has" : "questions have"} Practice
            responses. They are copied only into a Practice set, not into this one.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-gray-500">{picked.size ? `${picked.size} selected` : "Select questions to copy into this set"}</span>
          <div className="flex gap-2">
            <button type="button" onClick={close} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                add();
              }}
              disabled={picked.size === 0}
              className="whitespace-nowrap rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {picked.size ? `Add ${picked.size} to this set` : "Add to this set"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
