"use client";

import {useState} from "react";
import {Modal, showError, showSuccess} from "@mcc/ui";
import {splitForBank, toBankQuestion} from "@/src/features/question-editor/bank";
import type {CreatPracticeQuestionType} from "@/src/features/question-editor/types";
import {useSaveSetToBank} from "../hooks/useQuestionBank";
import {getApiErrorMessage} from "../services/questionBank.service";
import ClassificationFields, {Classification, EMPTY_CLASSIFICATION, toClassificationPayload} from "./ClassificationFields";

/** Save some or all of a set's questions to the shared Question Bank. */
export default function SaveToBankModal({
  open,
  questions,
  onClose,
}: {
  open: boolean;
  questions: CreatPracticeQuestionType[];
  onClose: () => void;
}) {
  const [classification, setClassification] = useState<Classification>(EMPTY_CLASSIFICATION);
  const save = useSaveSetToBank();
  const {ready, problems} = splitForBank(questions);

  function handleClose() {
    setClassification(EMPTY_CLASSIFICATION);
    onClose();
  }

  function handleSave() {
    save.mutate(
      {questions: ready.map(toBankQuestion), classification: toClassificationPayload(classification)},
      {
        onSuccess: (result) => {
          const already = result.skipped_count
            ? ` ${result.skipped_count} ${result.skipped_count === 1 ? "was" : "were"} already in the bank.`
            : "";
          showSuccess(
            `${result.added_count} ${result.added_count === 1 ? "question" : "questions"} added to the Question Bank.${already}`,
          );
          handleClose();
        },
        onError: (error) => showError(getApiErrorMessage(error, "Couldn't save to the Question Bank. Please try again.")),
      },
    );
  }

  return (
    <Modal open={open} title="Save to the Question Bank" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          {ready.length === 0
            ? "There are no complete questions to save yet."
            : `${ready.length} ${ready.length === 1 ? "question is" : "questions are"} ready. Questions already in the bank are skipped, so nothing is saved twice.`}
        </p>

        {problems.length > 0 && (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">Not saved, because they are incomplete:</p>
            <ul className="mt-1 list-disc pl-5">
              {problems.map((p) => (
                <li key={p.index}>
                  Question {p.index + 1} {p.problem}
                </li>
              ))}
            </ul>
          </div>
        )}

        {ready.length > 0 && (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              File {ready.length === 1 ? "it" : "them"} under (optional)
            </p>
            <ClassificationFields value={classification} onChange={setClassification} />
          </>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={handleClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={save.isPending || ready.length === 0}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {save.isPending ? "Saving..." : `Save ${ready.length || ""} to bank`.replace("  ", " ")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
