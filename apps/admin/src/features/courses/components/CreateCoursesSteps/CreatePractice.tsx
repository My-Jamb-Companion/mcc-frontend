import {FormInputs} from "@mcc/features";
import {Button, Icon} from "@mcc/ui";
import {useState} from "react";
import {uid} from "./Step2";
import {CreatPracticeQuestionType} from "@/src/features/courses/types/types";

function QuestionCard({
  question,
  index,
  onChange,
  onDelete,
  onCopy,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: {
  question: CreatPracticeQuestionType;
  index: number;
  onChange: (q: CreatPracticeQuestionType) => void;
  onDelete: () => void;
  onCopy: () => void;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const [dragOptionIndex, setDragOptionIndex] = useState<number | null>(null);
  const [dragOverOptionIndex, setDragOverOptionIndex] = useState<number | null>(
    null,
  );

  function updateField<K extends keyof CreatPracticeQuestionType>(
    field: K,
    value: CreatPracticeQuestionType[K],
  ) {
    onChange({...question, [field]: value});
  }

  function handleOptionChange(optIndex: number, text: string) {
    const newOptions = [...question.options];
    newOptions[optIndex] = {...newOptions[optIndex], text};
    updateField("options", newOptions);
  }

  function handleOptionCorrectToggle(optIndex: number) {
    let newOptions = [...question.options];
    if (question.type === "single") {
      newOptions = newOptions.map((opt, i) => ({
        ...opt,
        isCorrect: i === optIndex,
      }));
    } else {
      newOptions[optIndex] = {
        ...newOptions[optIndex],
        isCorrect: !newOptions[optIndex].isCorrect,
      };
    }
    updateField("options", newOptions);
  }

  function handleAddOption() {
    updateField("options", [
      ...question.options,
      {id: uid(), text: "", isCorrect: false},
    ]);
  }

  function handleOptionDrop(e: React.DragEvent) {
    e.stopPropagation();
    if (
      dragOptionIndex !== null &&
      dragOverOptionIndex !== null &&
      dragOptionIndex !== dragOverOptionIndex
    ) {
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
        if (
          (e.target as HTMLElement).closest(".option-drag-handle") ||
          (e.target as HTMLElement).tagName === "INPUT" ||
          (e.target as HTMLElement).tagName === "TEXTAREA" ||
          (e.target as HTMLElement).tagName === "SELECT"
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
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-fit! p-0! cursor-grab active:cursor-grabbing text-muted/40 hover:text-muted/60">
              <Icon icon="lucide:grip-vertical" size={20} />
            </div>
            <h2 className="text-sm text-subtle font-medium">
              Question {index + 1}
            </h2>
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
              value={question.type}
              onChange={(value) =>
                updateField("type", value as "single" | "multiple")
              }
            />

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
          </div>
        </div>

        {/* Question Content */}
        <div className="flex flex-col gap-5 w-[97%] ml-auto cursor-auto">
          <FormInputs
            type="text"
            inputProps={{
              value: question.question,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                updateField("question", e.target.value),
            }}
            placeholder="Write your question here..."
            inputClassName="rounded-xl px-4 h-14"
          />

          <FormInputs
            type="textarea"
            inputProps={{
              value: question.description || "",
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateField("description", e.target.value),
            }}
            placeholder="Description (Optional)"
            inputClassName="resize-none rounded-xl p-4 mb-2 text-sm min-h-[4.5rem]"
          />

          {/* Options */}
          <div className="space-y-4">
            {question.options.map((opt, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              return (
                <div
                  key={opt.id}
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
                    type={question.type === "single" ? "radio" : "checkbox"}
                    checked={opt.isCorrect}
                    onChange={() => handleOptionCorrectToggle(optIdx)}
                    className="h-4 w-4 text-violet-600 border-gray-300 focus:ring-violet-500"
                  />

                  <div className="flex h-14 flex-1 items-center rounded-2xl border border-muted/20 px-5 bg-white transition-colors">
                    <span className="mr-4 text-gray-500 font-medium">
                      {letter}.
                    </span>
                    {/* The bordered/rounded wrapper here comes from the parent
                        div above; FormInputs' own div/label/error wrapper still
                        renders around the <input>, so double check this looks
                        right visually — worth a look with real data. */}
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
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-opacity"
                  >
                    <Icon icon="lucide:x" size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddOption}
            className="flex items-center gap-2 w-fit ml-5 text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors"
          >
            <Icon icon="lucide:plus" size={18} />
            Add option
          </button>

          <FormInputs
            type="textarea"
            inputProps={{
              value: question.explanation || "",
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateField("explanation", e.target.value),
            }}
            placeholder="Answer explanation (Optional)"
            inputClassName="resize-none rounded-xl p-4 mt-4 text-sm min-h-[6rem]"
          />
        </div>
      </div>
    </div>
  );
}

export default function PracticeQuestions({
  questions,
  onChange,
  //   contextLabel,
}: {
  questions: CreatPracticeQuestionType[];
  onChange: (questions: CreatPracticeQuestionType[]) => void;
  //   contextLabel: string;
}) {
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(
    null,
  );

  function handleAddQuestion() {
    onChange([
      ...questions,
      {
        id: uid(),
        type: "single",
        question: "",
        options: [
          {id: uid(), text: "", isCorrect: false},
          {id: uid(), text: "", isCorrect: false},
        ],
      },
    ]);
  }

  function handleQuestionChange(
    index: number,
    newQuestion: CreatPracticeQuestionType,
  ) {
    const copy = [...questions];
    copy[index] = newQuestion;
    onChange(copy);
  }

  function handleQuestionDelete(index: number) {
    const copy = [...questions];
    copy.splice(index, 1);
    onChange(copy);
  }

  function handleQuestionCopy(index: number) {
    const target = questions[index];
    navigator.clipboard.writeText(JSON.stringify(target, null, 2));
  }

  function handleDrop() {
    if (
      dragItemIndex !== null &&
      dragOverItemIndex !== null &&
      dragItemIndex !== dragOverItemIndex
    ) {
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
      {/* <div className="flex items-center gap-3 w-full mb-4">
        <p className="font-medium text-sm">
          {contextLabel} <span className="text-muted">/ Practice</span>
        </p>
        <hr className="border-muted/30 flex-1" />
      </div> */}

      <div className="flex flex-col gap-6">
        {questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            onChange={(nq) => handleQuestionChange(idx, nq)}
            onDelete={() => handleQuestionDelete(idx)}
            onCopy={() => handleQuestionCopy(idx)}
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

      <div className="mt-10 flex justify-center">
        <Button
          variant="ghost"
          className="font-semibold"
          size="sm"
          onClick={handleAddQuestion}
          leftIcon={
            <>
              <hr className="w-35 bg-muted/20 border-muted opacity-30" />
              <Icon icon="lucide:plus" size={15} />
            </>
          }
          rightIcon={
            <hr className="w-35 bg-muted/20 border-muted opacity-30" />
          }
        >
          Add Question
        </Button>
      </div>
    </section>
  );
}
