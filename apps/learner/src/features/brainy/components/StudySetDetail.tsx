"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {ConfirmModal, Icon} from "@mcc/ui";
import {useDeleteStudySet, useStudySet, useUpdateStudySet} from "../hooks/useFlashcards";
import {deckIsSavable} from "../helper/studyMaterial";
import StudyProgressSummary from "./StudyProgressSummary";

/** A card being edited: saved cards keep their id (and so their progress); new ones have none yet. */
type EditableCard = {id?: string; front: string; back: string};

export default function StudySetDetail() {
  const {setId} = useParams<{setId: string}>();
  const router = useRouter();
  const {data: set, isLoading} = useStudySet(setId);
  const updateSet = useUpdateStudySet(setId);
  const deleteSet = useDeleteStudySet();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<EditableCard[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (set) {
      setTitle(set.title);
      setDescription(set.description ?? "");
      setCards(set.content);
    }
  }, [set]);

  const dirty =
    !!set &&
    (title !== set.title ||
      description !== (set.description ?? "") ||
      cards.length !== set.content.length ||
      cards.some((c, i) => c.id !== set.content[i]?.id || c.front !== set.content[i]?.front || c.back !== set.content[i]?.back));

  function updateCard(index: number, field: "front" | "back", value: string) {
    setCards((prev) => prev.map((c, i) => (i === index ? {...c, [field]: value} : c)));
  }

  function removeCard(index: number) {
    setCards((prev) => prev.filter((_, i) => i !== index));
  }

  function addCard() {
    setCards((prev) => [...prev, {front: "", back: ""}]);
  }

  function handleSave() {
    updateSet.mutate({title: title.trim(), description: description.trim(), content: cards});
  }

  if (isLoading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (!set) {
    return <p className="text-sm text-muted">This study set couldn&apos;t be found.</p>;
  }

  const canStudy = set.content.length > 0 && !dirty;
  const savable = !!title.trim() && deckIsSavable(cards) && dirty && !updateSet.isPending;

  return (
    <div className="max-sm:px-4">
      <Link
        href="/learnings/study-sets"
        className="mb-6 flex items-center gap-1 text-sm text-subtle hover:underline"
      >
        <Icon icon="lucide:chevron-left" size={16} />
        Back to study sets
      </Link>

      <StudyProgressSummary summary={set.summary} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/learnings/study-sets/${setId}/study`}
          aria-disabled={!canStudy}
          className={`inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90 ${canStudy ? "" : "pointer-events-none opacity-50"}`}
        >
          <Icon icon="lucide:layers" size={16} />
          Study
        </Link>
        <Link
          href={`/learnings/study-sets/${setId}/quiz`}
          aria-disabled={!canStudy}
          className={`inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary hover:bg-primary/5 ${canStudy ? "" : "pointer-events-none opacity-50"}`}
        >
          <Icon icon="lucide:list-checks" size={16} />
          Quiz
        </Link>
        {dirty && <span className="text-xs text-muted">Save your changes to study.</span>}
      </div>

      <div className="mt-6 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          aria-label="Title"
          className="w-full rounded-md border border-muted/20 p-2 text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          aria-label="Description"
          className="w-full rounded-md border border-muted/20 p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>

      <div className="mt-6 space-y-3">
        {cards.map((card, index) => (
          <div key={card.id ?? `new-${index}`} className="rounded-2xl border-2 border-muted/20 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <input
                  value={card.front}
                  onChange={(e) => updateCard(index, "front", e.target.value)}
                  placeholder="Question"
                  aria-label={`Card ${index + 1} question`}
                  className="w-full rounded-md border border-muted/10 p-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                />
                <input
                  value={card.back}
                  onChange={(e) => updateCard(index, "back", e.target.value)}
                  placeholder="Answer"
                  aria-label={`Card ${index + 1} answer`}
                  className="w-full rounded-md border border-muted/10 p-2 text-sm text-muted outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
              <button
                type="button"
                onClick={() => removeCard(index)}
                aria-label="Remove card"
                className="p-1 text-muted hover:text-danger"
              >
                <Icon icon="lucide:trash-2" size={16} />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addCard}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted/30 py-3 text-sm font-medium text-muted hover:border-primary hover:text-primary"
        >
          <Icon icon="lucide:plus" size={16} />
          Add card
        </button>
      </div>

      {cards.length > 0 && !deckIsSavable(cards) && (
        <p role="alert" className="mt-3 text-xs text-danger">
          Every card needs both a question and an answer.
        </p>
      )}
      {cards.length === 0 && (
        <p role="alert" className="mt-3 text-xs text-danger">
          A study set needs at least one card. Add one, or delete the set.
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={deleteSet.isPending}
          className="rounded-full border border-danger/30 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/5 disabled:opacity-50"
        >
          Delete set
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!savable}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updateSet.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>

      <ConfirmModal
        open={confirmDelete}
        variant="danger"
        title="Delete this study set?"
        message="The cards and your study progress will be removed. This can't be undone."
        confirmText="Delete"
        cancelText="Keep it"
        onConfirm={() => {
          setConfirmDelete(false);
          deleteSet.mutate(setId, {onSuccess: () => router.push("/learnings/study-sets")});
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
