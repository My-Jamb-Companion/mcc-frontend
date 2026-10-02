"use client";

import {useMemo, useState} from "react";
import Link from "next/link";
import {extractApiError} from "@mcc/api";
import {ConfirmModal, Icon} from "@mcc/ui";
import {describeCharge, isAllowanceUsed} from "../helper/charge";
import {
  deckIsSavable,
  MAX_PART_CHARS,
  mergeDeck,
  splitIntoParts,
  titleFromFilename,
} from "../helper/studyMaterial";
import {useGenerateFlashcards, useSaveStudySet} from "../hooks/useFlashcards";
import {useLectureRecorder} from "../hooks/useLectureRecorder";
import type {
  Flashcard,
  FlashcardDifficulty,
  StudyMaterialResult,
} from "../services/flashcards.service";
import DeckEditor from "./DeckEditor";
import LectureRecorder from "./LectureRecorder";
import MaterialUpload from "./MaterialUpload";

export type MaterialSource = "paste" | "upload" | "record";

interface FlashcardGeneratorProps {
  source: MaterialSource;
  onBack: () => void;
}

const COUNT_OPTIONS: {label: string; value: number | undefined}[] = [
  {label: "Auto (5–10)", value: undefined},
  {label: "5", value: 5},
  {label: "8", value: 8},
  {label: "10", value: 10},
  {label: "15", value: 15},
  {label: "20", value: 20},
];

const DIFFICULTY_OPTIONS: {label: string; value: FlashcardDifficulty | undefined}[] = [
  {label: "Any", value: undefined},
  {label: "Easy", value: "easy"},
  {label: "Medium", value: "medium"},
  {label: "Hard", value: "hard"},
];

const HEADINGS: Record<MaterialSource, {title: string; blurb: string}> = {
  paste: {
    title: "Flashcard generator",
    blurb: "Paste your notes, a transcript, or anything you're studying — Brainy will turn it into flashcards.",
  },
  upload: {
    title: "Upload your material",
    blurb: "Add a PDF, Word or PowerPoint file, or a photo of your notes. Check the text, then make flashcards.",
  },
  record: {
    title: "Record a lecture",
    blurb: "Brainy writes down what it hears. Fix any mistakes, then turn it into flashcards.",
  },
};

export default function FlashcardGenerator({source, onBack}: FlashcardGeneratorProps) {
  const generate = useGenerateFlashcards();
  const saveSet = useSaveStudySet();
  const recorder = useLectureRecorder();

  const [typed, setTyped] = useState("");
  const [count, setCount] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<FlashcardDifficulty | undefined>(undefined);
  const [partIndex, setPartIndex] = useState(0);
  // Parts already turned into cards, remembered by their text so editing the
  // material doesn't leave stale "done" ticks on parts that changed.
  const [donePartTexts, setDonePartTexts] = useState<string[]>([]);

  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [savedSetId, setSavedSetId] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  // Recording writes into the recorder's own transcript; everything else into `typed`.
  const material = source === "record" ? recorder.text : typed;
  const setMaterial = source === "record" ? recorder.setText : setTyped;

  const parts = useMemo(() => splitIntoParts(material), [material]);
  const safePartIndex = Math.min(partIndex, Math.max(parts.length - 1, 0));
  const currentPart = parts[safePartIndex];
  const isLong = parts.length > 1;
  const heading = HEADINGS[source];

  const handleExtracted = (result: StudyMaterialResult) => {
    setMaterial(result.text);
    setPartIndex(0);
    setDonePartTexts([]);
    setTitle((current) => current || titleFromFilename(result.filename));
    setError(result.truncated ? "That file is very long, so only the first part was kept." : null);
  };

  const handleGenerate = async () => {
    if (!currentPart) return;
    setError(null);
    setNotice(null);
    setSavedSetId(null);

    try {
      const result = await generate.mutateAsync({content: currentPart, options: {count, difficulty}});
      if (!result.generated || result.flashcards.length === 0) {
        setError("Couldn't generate flashcards from that. Try adding more detail.");
        return;
      }

      const merged = mergeDeck(deck, result.flashcards);
      setDeck(merged.deck);
      const skipped = result.flashcards.length - merged.added;
      const paid = describeCharge(result.charge);
      setNotice(
        `Added ${merged.added} flashcard${merged.added === 1 ? "" : "s"}` +
          (skipped > 0 ? ` (${skipped} duplicate${skipped === 1 ? "" : "s"} skipped)` : "") +
          (paid ? ` · ${paid}` : "") +
          ".",
      );

      const done = [...donePartTexts, currentPart];
      setDonePartTexts(done);
      // Move on to the next part that hasn't been turned into cards yet.
      const next = parts.findIndex((p) => !done.includes(p));
      if (next !== -1) setPartIndex(next);
    } catch (err) {
      setError(
        isAllowanceUsed(err)
          ? extractApiError(err, "You've used your Brainy allowance. Add gems to keep going.")
          : "Something went wrong. Please try again.",
      );
    }
  };

  const handleSave = async () => {
    if (!deckIsSavable(deck) || !title.trim() || !subject.trim()) return;
    setError(null);
    try {
      const created = await saveSet.mutateAsync({title: title.trim(), subject: subject.trim(), content: deck});
      setSavedSetId(created.set_id);
    } catch {
      setError("Couldn't save this study set. Please try again.");
    }
  };

  const handleBack = () => {
    if (deck.length > 0 && !savedSetId) setConfirmLeave(true);
    else onBack();
  };

  const allPartsDone = isLong && parts.every((p) => donePartTexts.includes(p));
  const generateLabel = generate.isPending
    ? "Generating…"
    : isLong
      ? `Generate from part ${safePartIndex + 1} of ${parts.length}`
      : deck.length > 0
        ? "Generate more flashcards"
        : "Generate flashcards";

  return (
    <div className="mx-auto w-full max-w-[660px]">
      <button
        type="button"
        onClick={handleBack}
        className="mb-4 flex items-center gap-1 text-sm text-muted hover:text-primary"
      >
        <Icon icon="ep:back" size={16} />
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 sm:text-[28px]">{heading.title}</h1>
      <p className="mt-2 text-sm text-gray-400">{heading.blurb}</p>

      {source === "upload" && <MaterialUpload onExtracted={handleExtracted} />}
      {source === "record" && <LectureRecorder recorder={recorder} />}

      {(source !== "upload" || material) && (
        <>
          <textarea
            value={material}
            onChange={(e) => {
              setMaterial(e.target.value);
              setPartIndex(0);
            }}
            aria-label="Study material"
            placeholder={
              source === "record"
                ? "Your lecture will appear here as you record. You can also paste a transcript."
                : "Paste your study material here..."
            }
            rows={8}
            className="mt-4 w-full resize-y rounded-2xl border-2 border-muted/20 p-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          />
          <p className="mt-1 text-xs text-gray-400">
            {material.length.toLocaleString()} characters
            {isLong ? ` · ${parts.length} parts of up to ${MAX_PART_CHARS.toLocaleString()}` : ""}
          </p>
        </>
      )}

      {isLong && (
        <div className="mt-3 rounded-2xl bg-purple-50 p-3 text-sm text-purple-900">
          <p>
            This is long, so Brainy works through it in {parts.length} parts. Make flashcards from
            each part and they&apos;ll all go into one deck.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {parts.map((part, index) => {
              const done = donePartTexts.includes(part);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPartIndex(index)}
                  aria-pressed={index === safePartIndex}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    index === safePartIndex
                      ? "border-purple-600 bg-purple-600 text-white"
                      : "border-purple-200 bg-white text-purple-700 hover:border-purple-400"
                  }`}
                >
                  {done && <Icon icon="ph:check" size={12} />}
                  Part {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          How many cards
          <select
            value={count ?? ""}
            onChange={(e) => setCount(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-md border border-muted/20 bg-white p-2 text-sm font-normal text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            {COUNT_OPTIONS.map((option) => (
              <option key={option.label} value={option.value ?? ""}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          <legend className="mb-1">Difficulty</legend>
          <div className="flex gap-1.5">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setDifficulty(option.value)}
                aria-pressed={difficulty === option.value}
                className={`flex-1 rounded-md border p-2 text-sm font-normal transition-colors ${
                  difficulty === option.value
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-muted/20 bg-white text-gray-700 hover:border-purple-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!currentPart || generate.isPending}
        className="mt-4 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generateLabel}
      </button>
      {allPartsDone && <span className="ml-3 text-xs text-green-600">All parts done</span>}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-500">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-3 text-sm text-green-600">
          {notice}
        </p>
      )}

      {deck.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              {`${deck.length} flashcard${deck.length === 1 ? "" : "s"}`}
            </h2>
            <button
              type="button"
              onClick={() => {
                setDeck([]);
                setDonePartTexts([]);
                setSavedSetId(null);
                setNotice(null);
              }}
              className="text-xs font-medium text-gray-500 hover:text-red-500"
            >
              Clear all
            </button>
          </div>

          <DeckEditor
            deck={deck}
            onChange={(next) => {
              setDeck(next);
              setSavedSetId(null);
            }}
          />

          {savedSetId ? (
            <p role="status" className="mt-4 text-sm text-green-600">
              Saved!{" "}
              <Link href={`/learnings/study-sets/${savedSetId}`} className="underline">
                Open your study set
              </Link>{" "}
              or{" "}
              <Link href="/learnings/study-sets" className="underline">
                see all study sets.
              </Link>
            </p>
          ) : (
            <div className="mt-6 space-y-3 rounded-2xl border-2 border-muted/20 p-4">
              <p className="text-sm font-semibold text-gray-900">Save as a study set</p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                aria-label="Study set title"
                className="w-full rounded-md border border-muted/20 p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              />
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                aria-label="Study set subject"
                className="w-full rounded-md border border-muted/20 p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              />
              {!deckIsSavable(deck) && (
                <p className="text-xs text-amber-600">
                  Every card needs both a question and an answer before you can save.
                </p>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={!deckIsSavable(deck) || !title.trim() || !subject.trim() || saveSet.isPending}
                className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saveSet.isPending ? "Saving…" : "Save study set"}
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={confirmLeave}
        variant="warning"
        title="Leave without saving?"
        message="These flashcards haven't been saved as a study set. If you leave now, they'll be lost."
        confirmText="Leave"
        cancelText="Keep editing"
        onConfirm={() => {
          setConfirmLeave(false);
          onBack();
        }}
        onCancel={() => setConfirmLeave(false)}
      />
    </div>
  );
}
