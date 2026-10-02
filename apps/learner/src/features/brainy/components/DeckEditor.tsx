"use client";

import {Icon} from "@mcc/ui";
import type {Flashcard} from "../services/flashcards.service";

interface DeckEditorProps {
  deck: Flashcard[];
  onChange: (deck: Flashcard[]) => void;
}

/** Editable list of cards: fix a wrong answer, drop a bad card, or add one by hand. */
export default function DeckEditor({deck, onChange}: DeckEditorProps) {
  const update = (index: number, patch: Partial<Flashcard>) =>
    onChange(deck.map((card, i) => (i === index ? {...card, ...patch} : card)));
  const remove = (index: number) => onChange(deck.filter((_, i) => i !== index));

  const fieldClass =
    "w-full resize-none rounded-md border border-muted/20 p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-400";

  return (
    <div className="space-y-3">
      {deck.map((card, index) => (
        <div key={index} className="rounded-2xl border-2 border-muted/20 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Card {index + 1}</span>
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Delete card ${index + 1}`}
              className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
            >
              <Icon icon="ph:trash" size={16} />
            </button>
          </div>
          <textarea
            value={card.front}
            onChange={(e) => update(index, {front: e.target.value})}
            aria-label={`Card ${index + 1} question`}
            placeholder="Question or term"
            rows={2}
            className={`${fieldClass} font-semibold text-gray-900`}
          />
          <textarea
            value={card.back}
            onChange={(e) => update(index, {back: e.target.value})}
            aria-label={`Card ${index + 1} answer`}
            placeholder="Answer or definition"
            rows={2}
            className={`${fieldClass} mt-2 text-gray-600`}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...deck, {front: "", back: ""}])}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-muted/40 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-purple-400 hover:text-purple-600"
      >
        <Icon icon="ph:plus" size={14} />
        Add a card
      </button>
    </div>
  );
}
