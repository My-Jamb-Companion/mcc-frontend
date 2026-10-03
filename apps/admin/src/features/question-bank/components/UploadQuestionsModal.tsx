"use client";

import {useRef, useState} from "react";
import {Icon, Modal, showError, showSuccess} from "@mcc/ui";
import {downloadBlob} from "@/src/features/Exam-program/helper/export";
import {
  countWithResponses,
  fromBankQuestion,
  ParseResult,
  parsedToBankPayload,
} from "@/src/features/question-editor/bank";
import type {CreatPracticeQuestionType} from "@/src/features/question-editor/types";
import {useParseQuestionFile, useSaveSetToBank} from "../hooks/useQuestionBank";
import {downloadQuestionTemplate, getApiErrorMessage} from "../services/questionBank.service";

export type UploadTarget =
  /** Into a Practice / Exercise / Quiz / Test set; `withResponses` is true for Practice. */
  | {kind: "set"; withResponses: boolean; onAdd: (questions: CreatPracticeQuestionType[]) => void}
  /** Straight into the Question Bank (the bank page). */
  | {kind: "bank"};

const link = "inline-flex items-center gap-1.5 rounded-lg border border-violet-200 px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-50";

function saved(added: number, skipped: number) {
  const already = skipped ? ` ${skipped} ${skipped === 1 ? "was" : "were"} already in the bank.` : "";
  return `${added} ${added === 1 ? "question" : "questions"} added to the Question Bank.${already}`;
}

/**
 * Upload questions from an Excel / CSV template. The file is only READ first:
 * the admin sees the questions that will be added and every problem, by row,
 * and nothing is added until they confirm.
 */
export default function UploadQuestionsModal({
  open,
  target,
  onClose,
}: {
  open: boolean;
  target: UploadTarget;
  onClose: () => void;
}) {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [alsoSave, setAlsoSave] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const parse = useParseQuestionFile();
  const save = useSaveSetToBank();

  const inBank = target.kind === "bank";
  const withResponses = target.kind === "set" && target.withResponses;
  const questions = result?.questions ?? [];
  const errors = result?.errors ?? [];
  const failedRows = new Set(errors.map((e) => e.row)).size;
  const responses = countWithResponses(questions);

  function reset() {
    setResult(null);
    setAlsoSave(false);
    parse.reset();
    if (input.current) input.current.value = "";
  }

  function close() {
    reset();
    onClose();
  }

  function read(file: File | undefined) {
    if (!file) return;
    setResult(null);
    parse.mutate(file, {
      onSuccess: setResult,
      onError: (error) => showError(getApiErrorMessage(error, "Couldn't read that file. Please try again.")),
    });
  }

  async function template(format: "xlsx" | "csv") {
    try {
      downloadBlob(await downloadQuestionTemplate(format), `question-template.${format}`);
    } catch (error) {
      showError(getApiErrorMessage(error, "Couldn't download the template. Please try again."));
    }
  }

  function confirm() {
    if (!result || questions.length === 0) return;
    const payloads = questions.map(parsedToBankPayload);
    const toBank = () =>
      save.mutate(
        {questions: payloads, source: "upload"},
        {
          onSuccess: (r) => showSuccess(saved(r.added_count, r.skipped_count)),
          onError: (error) => showError(getApiErrorMessage(error, "Couldn't save to the Question Bank. Please try again.")),
        },
      );

    if (target.kind === "bank") {
      save.mutate(
        {questions: payloads, source: "upload"},
        {
          onSuccess: (r) => {
            showSuccess(saved(r.added_count, r.skipped_count));
            close();
          },
          onError: (error) => showError(getApiErrorMessage(error, "Couldn't save to the Question Bank. Please try again.")),
        },
      );
      return;
    }

    target.onAdd(questions.map((q) => fromBankQuestion(q, target.withResponses)));
    showSuccess(`${questions.length} ${questions.length === 1 ? "question" : "questions"} added to this set.`);
    if (alsoSave) toBank();
    close();
  }

  const busy = parse.isPending || save.isPending;

  return (
    <Modal open={open} title="Upload questions" maxWidth="max-w-3xl">
      <div className="flex flex-col gap-4">
        <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <p>
            Fill in the template (one question per row), then upload it. You review the questions before anything is
            added.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => template("xlsx")} className={link}>
              <Icon icon="lucide:download" size={14} />
              Excel template
            </button>
            <button type="button" onClick={() => template("csv")} className={link}>
              <Icon icon="lucide:download" size={14} />
              CSV template
            </button>
          </div>
        </div>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            read(e.dataTransfer.files?.[0]);
          }}
          className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-7 text-center text-sm transition-colors ${
            dragging ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-violet-300"
          }`}
        >
          <Icon icon="lucide:file-spreadsheet" size={24} />
          <span className="font-medium text-gray-800">
            {parse.isPending ? "Reading the file…" : result ? `${result.filename} — choose another file` : "Choose a file or drop it here"}
          </span>
          <span className="text-xs text-gray-500">.xlsx or .csv · up to 500 questions · 2 MB</span>
          <input
            ref={input}
            type="file"
            accept=".xlsx,.csv"
            aria-label="Question file"
            className="sr-only"
            onChange={(e) => read(e.target.files?.[0])}
          />
        </label>

        {result && (
          <>
            <p className="text-sm text-gray-700" role="status">
              <span className="font-semibold text-emerald-700">
                {questions.length} {questions.length === 1 ? "question" : "questions"} ready
              </span>
              {failedRows > 0 && (
                <>
                  {" · "}
                  <span className="font-semibold text-amber-700">
                    {failedRows} {failedRows === 1 ? "row has" : "rows have"} problems and will not be added
                  </span>
                </>
              )}
            </p>

            {errors.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-semibold">Fix these in the file and upload it again, or continue without them:</p>
                <ul className="mt-1 list-disc pl-5">
                  {errors.map((e, i) => (
                    <li key={i}>
                      Row {e.row}: {e.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {questions.length > 0 && (
              <ul className="max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-100">
                {questions.map((q) => (
                  <li key={q.row} className="px-4 py-2.5 text-sm">
                    <p className="font-medium text-gray-900">
                      <span className="mr-2 text-xs font-normal text-gray-400">Row {q.row}</span>
                      {q.question_text}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {q.options.map((o, i) => (
                        <span key={i} className={q.correct_answers.includes(o) ? "font-semibold text-emerald-700" : ""}>
                          {i > 0 && " · "}
                          {String.fromCharCode(65 + i)}. {o}
                        </span>
                      ))}
                    </p>
                    {(q.subject_name || q.topic || q.difficulty) && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        {[q.subject_name, q.topic, q.difficulty].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {responses > 0 && !inBank && !withResponses && (
              <p className="rounded-xl bg-gray-50 px-4 py-2.5 text-xs text-gray-600">
                {responses} {responses === 1 ? "question has" : "questions have"} Practice responses. They are used only
                in a Practice set, so they are not added to this one{alsoSave ? ", but they are kept in the bank" : ""}.
              </p>
            )}

            {!inBank && questions.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={alsoSave} onChange={(e) => setAlsoSave(e.target.checked)} className="h-4 w-4" />
                Also save these questions to the Question Bank
              </label>
            )}
          </>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <button type="button" onClick={close} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy || questions.length === 0}
            className="whitespace-nowrap rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {save.isPending
              ? "Saving..."
              : inBank
                ? `Save ${questions.length || ""} to the bank`.replace("  ", " ")
                : `Add ${questions.length || ""} to this set`.replace("  ", " ")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
