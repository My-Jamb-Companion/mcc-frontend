"use client";

import {useState} from "react";
import {Icon} from "@mcc/ui";
import {appendQuestions, splitForBank} from "@/src/features/question-editor/bank";
import type {CreatPracticeQuestionType} from "@/src/features/question-editor/types";
import BankPickerModal from "./BankPickerModal";
import SaveToBankModal from "./SaveToBankModal";
import UploadQuestionsModal from "./UploadQuestionsModal";

const button =
  "inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Set-level question tools shown above every Practice, Exercise, Quiz and Test
 * question list: upload questions from a template, copy questions in from the
 * Question Bank, or save the set to it.
 */
export default function BankTools({
  questions,
  onChange,
  withResponses,
}: {
  questions: CreatPracticeQuestionType[];
  onChange: (questions: CreatPracticeQuestionType[]) => void;
  withResponses: boolean;
}) {
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const hasSomethingToSave = splitForBank(questions).ready.length + splitForBank(questions).problems.length > 0;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <button type="button" onClick={() => setUploading(true)} className={button}>
        <Icon icon="lucide:upload" size={16} />
        Upload questions
      </button>
      <button type="button" onClick={() => setPicking(true)} className={button}>
        <Icon icon="lucide:library" size={16} />
        Add from bank
      </button>
      <button type="button" onClick={() => setSaving(true)} disabled={!hasSomethingToSave} className={button}>
        <Icon icon="lucide:bookmark-plus" size={16} />
        Save set to bank
      </button>

      <BankPickerModal
        open={picking}
        inSet={questions}
        withResponses={withResponses}
        onClose={() => setPicking(false)}
        onAdd={(picked) => {
          onChange(appendQuestions(questions, picked));
          setPicking(false);
        }}
      />
      <UploadQuestionsModal
        open={uploading}
        target={{
          kind: "set",
          withResponses,
          onAdd: (added) => onChange(appendQuestions(questions, added)),
        }}
        onClose={() => setUploading(false)}
      />
      <SaveToBankModal open={saving} questions={questions} onClose={() => setSaving(false)} />
    </div>
  );
}
