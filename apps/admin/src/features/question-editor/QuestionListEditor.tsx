"use client";

import {ReactNode, useState} from "react";
import {FormInputs} from "@mcc/features";
import {Button, Icon} from "@mcc/ui";
import BankTools from "@/src/features/question-bank/components/BankTools";
import SaveToBankModal from "@/src/features/question-bank/components/SaveToBankModal";
import {blankQuestion, CreatPracticeQuestionType, isMultiple, uid} from "./types";

function QuestionCard({
  question,
  index,
  withResponses,
  onChange,
  onDelete,
  onCopy,
  onSaveToBank,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: {
  question: CreatPracticeQuestionType;
  index: number;
  withResponses: boolean;
  onChange: (q: CreatPracticeQuestionType) => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onSaveToBank?: () => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const [dragOptionIndex, setDragOptionIndex] = useState<number | null>(null);
  const [dragOverOptionIndex, setDragOverOptionIndex] = useState<number | null>(null);
  const multiple = isMultiple(question.type);

  function updateField<K extends keyof CreatPracticeQuestionType>(field: K, value: CreatPracticeQuestionType[K]) {
    onChange({...question, [field]: value});
  }

  function handleOptionChange(optIndex: number, text: string) {
    const newOptions = [...question.options];
    newOptions[optIndex] = {...newOptions[optIndex], text};
    updateField("options", newOptions);
  }

  function handleResponseChange(optIndex: number, response: string) {
    const newOptions = [...question.options];
    newOptions[optIndex] = {...newOptions[optIndex], response};
    updateField("options", newOptions);
  }

  function handleOptionCorrectToggle(optIndex: number) {
    let newOptions = [...question.options];
    if (!multiple) {
      newOptions = newOptions.map((opt, i) => ({...opt, isCorrect: i === optIndex}));
    } else {
      newOptions[optIndex] = {...newOptions[optIndex], isCorrect: !newOptions[optIndex].isCorrect};
    }
    updateField("options", newOptions);
  }

  function handleTypeChange(next: "single" | "multiple") {
    let options = question.options;
    if (next === "single") {
      // A single-choice question has exactly one correct option: keep the first.
      let found = false;
      options = options.map((opt) => {
        if (opt.isCorrect && !found) {
          found = true;
          return opt;
        }
        return {...opt, isCorrect: false};
      });
    }
    onChange({...question, type: next, options});
  }

  function handleOptionDrop(e: React.DragEvent) {
    e.stopPropagation();
    if (dragOptionIndex !== null && dragOverOptionIndex !== null && dragOptionIndex !== dragOverOptionIndex) {
      const copy = [...question.options];
      const [dragged] = copy.splice(dragOptionIndex, 1);
      copy.splice(dragOverOptionIndex, 0, dragged);
      updateField("options", copy);
    }
    setDragOptionIndex(null);
    setDragOverOptionIndex(null);
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        const target = e.target as HTMLElement;
        if (
          target.closest(".option-drag-handle") ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT"
        ) {
          e.preventDefault();
          return;
        }
        onDragStart();
      }}
      onDragEnter={(e) => {
        if ((e.target as HTMLElement).closest(".option-drag-handle")) return;
        onDragEnter();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="flex items-start gap-5 border border-muted/20 rounded-3xl px-5.5 pt-3.5 pb-5 bg-white"
    >
      <div className="w-full">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-fit! p-0! cursor-grab active:cursor-grabbing text-muted/40 hover:text-muted/60">
              <Icon icon="lucide:grip-vertical" size={20} />
            </div>
            <h2 className="text-sm text-subtle font-medium">Question {index + 1}</h2>
          </div>

          <div className="flex items-center gap-3">
            <FormInputs
              type="select"
              selectRadius="full"
              selectClassName="shadow-sm border-muted/30! py-2!"
              options={[
                {label: "Single choice", value: "single"},
                {label: "Multiple choice", value: "multiple"},
              ]}
              value={multiple ? "multiple" : "single"}
              onChange={(value) => handleTypeChange(value === "multiple" ? "multiple" : "single")}
            />

            {onSaveToBank && (
              <Button
                type="button"
                variant="ghost"
                onClick={onSaveToBank}
                size={"fit"}
                className="hover:bg-transparent text-muted/50 hover:text-violet-600"
                title="Save to the Question Bank"
              >
                <Icon icon="lucide:bookmark-plus" size={20} />
              </Button>
            )}
            {onCopy && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCopy}
                size={"fit"}
                className="hover:bg-transparent text-muted/50 hover:text-muted"
                title="Copy JSON data"
              >
                <Icon icon="lucide:copy" size={20} />
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                onClick={onDelete}
                size={"fit"}
                className="text-red-400 hover:text-red-500 hover:bg-transparent "
                title="Delete question"
              >
                <Icon icon="lucide:trash-2" size={20} />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 w-[97%] ml-auto cursor-auto">
          <FormInputs
            type="text"
            inputProps={{
              value: question.question,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField("question", e.target.value),
            }}
            placeholder="Write your question here..."
            inputClassName="rounded-xl px-4 h-14"
          />

          <FormInputs
            type="textarea"
            inputProps={{
              value: question.description || "",
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("description", e.target.value),
            }}
            placeholder="Description (Optional)"
            inputClassName="resize-none rounded-xl p-4 mb-2 text-sm min-h-[4.5rem]"
          />

          <div className="space-y-4">
            {question.options.map((opt, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              return (
                <div key={opt.id} className="flex flex-col gap-2">
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDragOptionIndex(optIdx);
                    }}
                    onDragEnter={(e) => {
                      e.stopPropagation();
                      setDragOverOptionIndex(optIdx);
                    }}
                    onDragEnd={(e) => {
                      e.stopPropagation();
                      setDragOptionIndex(null);
                      setDragOverOptionIndex(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={handleOptionDrop}
                    className="flex items-center gap-4 group"
                  >
                    <div className="option-drag-handle cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                      <Icon icon="lucide:grip-vertical" size={18} />
                    </div>

                    <input
                      type={multiple ? "checkbox" : "radio"}
                      checked={opt.isCorrect}
                      onChange={() => handleOptionCorrectToggle(optIdx)}
                      aria-label={`Option ${letter} is correct`}
                      className="h-4 w-4 text-violet-600 border-gray-300 focus:ring-violet-500"
                    />

                    <div className="flex h-14 flex-1 items-center rounded-2xl border border-muted/20 px-5 bg-white transition-colors">
                      <span className="mr-4 text-gray-500 font-medium">{letter}.</span>
                      <FormInputs
                        type="text"
                        inputProps={{
                          value: opt.text,
                          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                            handleOptionChange(optIdx, e.target.value),
                        }}
                        placeholder="Enter your option here..."
                        inputClassName="flex-1 bg-transparent outline-none border-none p-0 h-auto"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...question.options];
                        newOptions.splice(optIdx, 1);
                        updateField("options", newOptions);
                      }}
                      aria-label={`Remove option ${letter}`}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-opacity"
                    >
                      <Icon icon="lucide:x" size={16} />
                    </button>
                  </div>

                  {withResponses && (
                    <div className="ml-14 mr-10">
                      <textarea
                        value={opt.response ?? ""}
                        onChange={(e) => handleResponseChange(optIdx, e.target.value)}
                        rows={2}
                        aria-label={`Response if the student picks option ${letter}`}
                        placeholder={`Response if the student picks ${letter}${opt.isCorrect ? " (the right answer)" : ""}...`}
                        className={`w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-violet-400 ${
                          opt.isCorrect ? "border-green-200 bg-green-50/40" : "border-amber-200 bg-amber-50/40"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => updateField("options", [...question.options, {id: uid(), text: "", isCorrect: false}])}
            className="flex items-center gap-2 w-fit ml-5 text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors"
          >
            <Icon icon="lucide:plus" size={18} />
            Add option
          </button>

          <FormInputs
            type="textarea"
            inputProps={{
              value: question.explanation || "",
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("explanation", e.target.value),
            }}
            placeholder="Answer explanation (Optional)"
            inputClassName="resize-none rounded-xl p-4 mt-4 text-sm min-h-[6rem]"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The question list editor shared by every Practice, Exercise, Quiz and Test in
 * both Courses and Exam Programs. `withResponses` (Practice sets only) adds a
 * response box under every option: what the student reads after choosing it,
 * right or wrong. The Question Bank tools (add from the bank, save to it) sit
 * above the list; `toolbar` adds more beside them.
 */
export default function QuestionListEditor({
  questions,
  onChange,
  withResponses = false,
  toolbar,
  single = false,
}: {
  questions: CreatPracticeQuestionType[];
  onChange: (questions: CreatPracticeQuestionType[]) => void;
  withResponses?: boolean;
  /** Extra set-level tools, shown beside the Question Bank ones. */
  toolbar?: ReactNode;
  /** Edit exactly one question (no list tools): used by the Question Bank's own editor. */
  single?: boolean;
}) {
  const [savingOne, setSavingOne] = useState<CreatPracticeQuestionType | null>(null);
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);

  function handleDrop() {
    if (dragItemIndex !== null && dragOverItemIndex !== null && dragItemIndex !== dragOverItemIndex) {
      const copy = [...questions];
      const [dragged] = copy.splice(dragItemIndex, 1);
      copy.splice(dragOverItemIndex, 0, dragged);
      onChange(copy);
    }
    setDragItemIndex(null);
    setDragOverItemIndex(null);
  }

  return (
    <section className="mt-4">
      {withResponses && (
        <p className="mb-4 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-800">
          Practice is for learning, not scoring. Write a response under each option: students read it after choosing
          that option, whether it is right or wrong.
        </p>
      )}

      {!single && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <BankTools questions={questions} onChange={onChange} withResponses={withResponses} />
          {toolbar}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            withResponses={withResponses}
            onChange={(nq) => onChange(questions.map((existing, i) => (i === idx ? nq : existing)))}
            onDelete={single ? undefined : () => onChange(questions.filter((_, i) => i !== idx))}
            onCopy={single ? undefined : () => navigator.clipboard.writeText(JSON.stringify(q, null, 2))}
            onSaveToBank={single ? undefined : () => setSavingOne(q)}
            onDragStart={() => setDragItemIndex(idx)}
            onDragEnter={() => setDragOverItemIndex(idx)}
            onDragEnd={() => {
              setDragItemIndex(null);
              setDragOverItemIndex(null);
            }}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {!single && (
      <div className="mt-10 flex justify-center">
        <Button
          variant="ghost"
          className="font-semibold"
          size="sm"
          onClick={() => onChange([...questions, blankQuestion()])}
          leftIcon={
            <>
              <hr className="w-35 bg-muted/20 border-muted opacity-30" />
              <Icon icon="lucide:plus" size={15} />
            </>
          }
          rightIcon={<hr className="w-35 bg-muted/20 border-muted opacity-30" />}
        >
          Add Question
        </Button>
      </div>
      )}

      <SaveToBankModal open={!!savingOne} questions={savingOne ? [savingOne] : []} onClose={() => setSavingOne(null)} />
    </section>
  );
}
