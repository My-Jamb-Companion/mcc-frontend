"use client";

import {useState} from "react";
import {Modal, showError, showSuccess} from "@mcc/ui";
import QuestionListEditor from "@/src/features/question-editor/QuestionListEditor";
import {ApiBankQuestion, fromBankQuestion, questionProblem, toBankQuestion} from "@/src/features/question-editor/bank";
import {blankQuestion, CreatPracticeQuestionType, optionResponses} from "@/src/features/question-editor/types";
import {useCreateBankQuestion, useUpdateBankQuestion} from "../hooks/useQuestionBank";
import {getApiErrorMessage} from "../services/questionBank.service";
import ClassificationFields, {Classification, toClassificationPayload} from "./ClassificationFields";

function initialQuestion(existing: ApiBankQuestion | null): CreatPracticeQuestionType {
  return existing ? fromBankQuestion(existing, true) : blankQuestion();
}

function initialClassification(existing: ApiBankQuestion | null): Classification {
  return {
    subject_id: existing?.subject_id ?? "",
    topic: existing?.topic ?? "",
    difficulty: existing?.difficulty ?? "",
  };
}

function Form({existing, onClose}: {existing: ApiBankQuestion | null; onClose: () => void}) {
  const [question, setQuestion] = useState(() => initialQuestion(existing));
  const [classification, setClassification] = useState(() => initialClassification(existing));
  const create = useCreateBankQuestion();
  const update = useUpdateBankQuestion();
  const problem = questionProblem(question);
  const busy = create.isPending || update.isPending;

  function handleSave() {
    if (problem) return;
    const base = toBankQuestion(question);
    const onError = (error: unknown) => showError(getApiErrorMessage(error, "Couldn't save the question. Please try again."));

    if (existing) {
      // Explicit blanks, so a cleared description, explanation, response or filing is cleared in the bank too.
      update.mutate(
        {
          bankId: existing.bank_id,
          payload: {
            ...base,
            description: base.description ?? "",
            explanation: base.explanation ?? "",
            option_feedback: optionResponses(question),
            subject_id: classification.subject_id || null,
            topic: classification.topic.trim() || null,
            difficulty: classification.difficulty || null,
          },
        },
        {
          onSuccess: () => {
            showSuccess("Question updated.");
            onClose();
          },
          onError,
        },
      );
    } else {
      create.mutate(
        {...base, ...toClassificationPayload(classification)},
        {
          onSuccess: () => {
            showSuccess("Question added to the bank.");
            onClose();
          },
          onError,
        },
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ClassificationFields value={classification} onChange={setClassification} />
      <QuestionListEditor single withResponses questions={[question]} onChange={([q]) => q && setQuestion(q)} />
      {problem && <p className="text-sm text-amber-700">This question {problem}.</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={busy || !!problem}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Saving..." : existing ? "Save changes" : "Add to bank"}
        </button>
      </div>
    </div>
  );
}

/** Create a bank question, or edit one. The responses are Practice-only extras; leave them blank for Exercise or Quiz material. */
export default function BankQuestionModal({
  open,
  existing,
  onClose,
}: {
  open: boolean;
  existing: ApiBankQuestion | null;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title={existing ? "Edit bank question" : "Add a question to the bank"} maxWidth="max-w-4xl">
      {/* Remounts per question, so the form always starts from the right one. */}
      {open && <Form key={existing?.bank_id ?? "new"} existing={existing} onClose={onClose} />}
    </Modal>
  );
}
