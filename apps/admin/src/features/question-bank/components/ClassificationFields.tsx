"use client";

import {useCatalogOptions} from "@/src/features/exam-catalog/hooks/useCatalog";
import type {Difficulty} from "../services/questionBank.service";

export interface Classification {
  subject_id: string;
  topic: string;
  difficulty: Difficulty | "";
}

export const EMPTY_CLASSIFICATION: Classification = {subject_id: "", topic: "", difficulty: ""};

const field =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400";

/** Subject, topic and difficulty, as a question (or a batch of them) is filed in the bank. */
export default function ClassificationFields({
  value,
  onChange,
}: {
  value: Classification;
  onChange: (next: Classification) => void;
}) {
  const {options} = useCatalogOptions("subjects", value.subject_id);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
        Subject
        <select
          value={value.subject_id}
          onChange={(e) => onChange({...value, subject_id: e.target.value})}
          className={field}
        >
          <option value="">No subject</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
        Topic
        <input
          value={value.topic}
          maxLength={255}
          onChange={(e) => onChange({...value, topic: e.target.value})}
          placeholder="e.g. Algebra"
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
        Difficulty
        <select
          value={value.difficulty}
          onChange={(e) => onChange({...value, difficulty: e.target.value as Classification["difficulty"]})}
          className={field}
        >
          <option value="">Not set</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>
    </div>
  );
}

/** The classification as the API takes it: blanks are left out. */
export function toClassificationPayload(c: Classification) {
  return {
    ...(c.subject_id ? {subject_id: c.subject_id} : {}),
    ...(c.topic.trim() ? {topic: c.topic.trim()} : {}),
    ...(c.difficulty ? {difficulty: c.difficulty} : {}),
  };
}
