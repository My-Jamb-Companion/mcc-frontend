"use client";

import {useState} from "react";
import {Icon} from "@mcc/ui";
import {useGenerateFlashcards, useSaveStudySet} from "../hooks/useFlashcards";
import type {Flashcard} from "../services/flashcards.service";

interface FlashcardGeneratorProps {
  onBack: () => void;
}

export default function FlashcardGenerator({onBack}: FlashcardGeneratorProps) {
  const generate = useGenerateFlashcards();
  const saveSet = useSaveStudySet();

  const [content, setContent] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setError(null);
    setFlashcards(null);
    setSaved(false);

    try {
      const result = await generate.mutateAsync(trimmed);
      if (!result.generated || result.flashcards.length === 0) {
        setError("Couldn't generate flashcards from that. Try adding more detail.");
        return;
      }
      setFlashcards(result.flashcards);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!flashcards || !title.trim() || !subject.trim()) return;
    setError(null);
    try {
      await saveSet.mutateAsync({title: title.trim(), subject: subject.trim(), content: flashcards});
      setSaved(true);
    } catch {
      setError("Couldn't save this study set. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-[660px] mx-auto">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted hover:text-primary mb-4"
      >
        <Icon icon="ep:back" size={16} />
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 sm:text-[28px]">Flashcard generator</h1>
      <p className="mt-2 text-sm text-gray-400">
        Paste your notes, a transcript, or anything you&apos;re studying — Brainy will turn it
        into flashcards.
      </p>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your study material here..."
        rows={8}
        className="mt-4 w-full resize-none rounded-2xl border-2 border-muted/20 p-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
      />

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!content.trim() || generate.isPending}
        className="mt-3 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generate.isPending ? "Generating…" : "Generate flashcards"}
      </button>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {flashcards && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            {`${flashcards.length} flashcard${flashcards.length === 1 ? "" : "s"}`}
          </h2>
          <div className="space-y-3">
            {flashcards.map((card, index) => (
              <div key={index} className="rounded-2xl border-2 border-muted/20 p-4">
                <p className="text-sm font-semibold text-gray-900">{card.front}</p>
                <p className="mt-1 text-sm text-gray-500">{card.back}</p>
              </div>
            ))}
          </div>

          {saved ? (
            <p className="mt-4 text-sm text-green-600">
              Saved! Find it in your study sets.
            </p>
          ) : (
            <div className="mt-6 space-y-3 rounded-2xl border-2 border-muted/20 p-4">
              <p className="text-sm font-semibold text-gray-900">Save as a study set</p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-md border border-muted/20 p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              />
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="w-full rounded-md border border-muted/20 p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim() || !subject.trim() || saveSet.isPending}
                className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saveSet.isPending ? "Saving…" : "Save study set"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
