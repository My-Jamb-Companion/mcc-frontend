"use client";

import {useState} from "react";
import {Button, Icon, showError} from "@mcc/ui";
import PracticeQuestions from "./PracticeQuestions";
import {displayName, nameTaken, nextName, PracticeSet} from "@/src/features/Exam-program/helper/practiceSets";
import {uid} from "@/src/features/question-editor/types";

/**
 * A module's Practice: one or more named sets, each its own list of questions, as a course's Practice is. Students pick a set
 * to play, so a module can have a practice per passage, per topic or per difficulty.
 */
export default function PracticeSetsManager({
  sets,
  onChange,
}: {
  sets: PracticeSet[];
  onChange: (sets: PracticeSet[]) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(sets[0]?.id ?? null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const selected = sets.find((s) => s.id === selectedId) ?? sets[0] ?? null;

  function add() {
    const set: PracticeSet = {id: uid(), name: nextName(sets), questions: []};
    onChange([...sets, set]);
    setSelectedId(set.id);
    startRename(set);
  }

  function startRename(set: PracticeSet) {
    setRenamingId(set.id);
    setDraft(set.name);
  }

  function commitRename(set: PracticeSet) {
    const name = draft.trim();
    setRenamingId(null);
    if (name === set.name.trim()) return;
    if (nameTaken(sets, set.id, name)) {
      showError(`Another practice is already called "${displayName(name)}". Give each practice its own name.`);
      return;
    }
    onChange(sets.map((s) => (s.id === set.id ? {...s, name} : s)));
  }

  function remove(set: PracticeSet) {
    const next = sets.filter((s) => s.id !== set.id);
    if (set.questions.length > 0 && !window.confirm(`Delete "${displayName(set.name)}" and its ${set.questions.length} question${set.questions.length === 1 ? "" : "s"}?`)) return;
    onChange(next);
    if (selectedId === set.id) setSelectedId(next[0]?.id ?? null);
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Practices</p>
        <Button type="button" variant="outline" shadow="sm" size="sm" onClick={add} leftIcon={<Icon icon="lucide:plus" size={14} />}>
          Add practice
        </Button>
      </div>

      {sets.length === 0 ? (
        <p className="text-sm text-gray-500">No practices yet. Click &ldquo;Add practice&rdquo; to create one.</p>
      ) : (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Practices">
          {sets.map((set) => {
            const isSelected = set.id === selected?.id;
            if (renamingId === set.id) {
              return (
                <input
                  key={set.id}
                  autoFocus
                  value={draft}
                  aria-label="Practice name"
                  placeholder="Practice name"
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => commitRename(set)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename(set);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  className="w-44 rounded-full border border-violet-400 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-violet-300"
                />
              );
            }
            return (
              <div
                key={set.id}
                className={`group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  isSelected ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <button type="button" role="tab" aria-selected={isSelected} onClick={() => setSelectedId(set.id)} className="flex items-center gap-1.5">
                  <span>{displayName(set.name)}</span>
                  <span className="text-xs text-gray-500">({set.questions.length})</span>
                </button>
                <span className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <button type="button" onClick={() => startRename(set)} aria-label={`Rename ${displayName(set.name)}`}>
                    <Icon icon="lucide:pencil" size={11} className="text-gray-500" />
                  </button>
                  <button type="button" onClick={() => remove(set)} aria-label={`Delete ${displayName(set.name)}`}>
                    <Icon icon="lucide:trash-2" size={11} className="text-red-400" />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="mt-2 border-t border-gray-100 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Questions in {displayName(selected.name)}</p>
          <PracticeQuestions
            key={selected.id}
            withResponses
            questions={selected.questions}
            onChange={(questions) => onChange(sets.map((s) => (s.id === selected.id ? {...s, questions} : s)))}
          />
        </div>
      )}
    </div>
  );
}
