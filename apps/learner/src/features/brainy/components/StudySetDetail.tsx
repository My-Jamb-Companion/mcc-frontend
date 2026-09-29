"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {Icon} from "@mcc/ui";
import {useDeleteStudySet, useStudySet, useUpdateStudySet} from "../hooks/useFlashcards";
import type {Flashcard} from "../services/flashcards.service";

export default function StudySetDetail() {
  const {setId} = useParams<{setId: string}>();
  const router = useRouter();
  const {data: set, isLoading} = useStudySet(setId);
  const updateSet = useUpdateStudySet(setId);
  const deleteSet = useDeleteStudySet();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);

  useEffect(() => {
    if (set) {
      setTitle(set.title);
      setDescription(set.description ?? "");
      setCards(set.content);
    }
  }, [set]);

  function updateCard(index: number, field: "front" | "back", value: string) {
    setCards((prev) => prev.map((c, i) => (i === index ? {...c, [field]: value} : c)));
  }

  function removeCard(index: number) {
    setCards((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    updateSet.mutate({title, description, content: cards});
  }

  function handleDelete() {
    if (!confirm("Delete this study set? This can't be undone.")) return;
    deleteSet.mutate(setId, {onSuccess: () => router.push("/learnings/study-sets")});
  }

  if (isLoading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (!set) {
    return <p className="text-sm text-muted">This study set couldn&apos;t be found.</p>;
  }

  return (
    <div>
      <Link
        href="/learnings/study-sets"
        className="mb-6 flex items-center gap-1 text-sm text-subtle hover:underline"
      >
        <Icon icon="lucide:chevron-left" size={16} />
        Back to study sets
      </Link>

      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-md border border-muted/20 p-2 text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full rounded-md border border-muted/20 p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>

      <div className="mt-6 space-y-3">
        {cards.map((card, index) => (
          <div key={index} className="rounded-2xl border-2 border-muted/20 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <input
                  value={card.front}
                  onChange={(e) => updateCard(index, "front", e.target.value)}
                  className="w-full rounded-md border border-muted/10 p-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                />
                <input
                  value={card.back}
                  onChange={(e) => updateCard(index, "back", e.target.value)}
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
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteSet.isPending}
          className="rounded-full border border-danger/30 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/5 disabled:opacity-50"
        >
          Delete set
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!title.trim() || updateSet.isPending}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updateSet.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
