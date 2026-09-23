"use client";

import {useState} from "react";
import {Pencil, Trash2, Plus} from "lucide-react";
import {formatDuration} from "@/src/features/learnings/hooks/useLesson";
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNote,
} from "@/src/features/learnings/hooks/useNotes";
import {ApiNote} from "@/src/features/learnings/services/notes.service";

interface NotesTabProps {
  courseId: string;
  activeLessonId: string | null;
  currentTimestamp?: number;
  onTimestampClick?: (seconds: number) => void;
}

export default function NotesTab({
  courseId,
  activeLessonId,
  currentTimestamp = 0,
  onTimestampClick,
}: NotesTabProps) {
  const {notes, isLoading} = useNotes(courseId);
  const createNote = useCreateNote(courseId);
  const [newNoteText, setNewNoteText] = useState("");
  const [composing, setComposing] = useState(false);
  const formattedTime = formatDuration(currentTimestamp);

  const handleAdd = () => {
    if (!newNoteText.trim() || !activeLessonId) return;
    createNote.mutate(
      {
        lectureId: activeLessonId,
        timestampSeconds: Math.floor(currentTimestamp),
        body: newNoteText.trim(),
      },
      {
        onSuccess: () => {
          setNewNoteText("");
          setComposing(false);
        },
      },
    );
  };

  return (
    <section className="w-full md:max-w-[75%] mx-auto font-sans">
      <div className="mb-5">
        {composing ? (
          <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm">
            <p className="text-xs text-violet-600 font-medium mb-2">Note at {formattedTime}</p>
            <textarea
              autoFocus
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Write your note..."
              rows={3}
              className="w-full text-sm text-gray-700 resize-none outline-none leading-relaxed placeholder:text-gray-400"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setComposing(false);
                  setNewNoteText("");
                }}
                className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newNoteText.trim() || createNote.isPending}
                className="px-3 py-1 text-xs font-medium bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {createNote.isPending ? "Saving…" : "Save note"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setComposing(true)}
            disabled={!activeLessonId}
            className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-400 bg-white hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm text-left disabled:opacity-50"
          >
            <span>Create a new note at {formattedTime}</span>
            <Plus className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      <div>
        {isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading notes…</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            No notes yet. Create one above!
          </p>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.note_id}
              courseId={courseId}
              note={note}
              onTimestampClick={onTimestampClick}
            />
          ))
        )}
      </div>
    </section>
  );
}

function NoteCard({
  courseId,
  note,
  onTimestampClick,
}: {
  courseId: string;
  note: ApiNote;
  onTimestampClick?: (seconds: number) => void;
}) {
  const updateNote = useUpdateNote(courseId);
  const deleteNote = useDeleteNote(courseId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.body);

  const handleSave = () => {
    if (!draft.trim()) return;
    updateNote.mutate({noteId: note.note_id, body: draft.trim()}, {onSuccess: () => setEditing(false)});
  };

  const handleCancel = () => {
    setDraft(note.body);
    setEditing(false);
  };

  return (
    <section className="py-4 border-b border-gray-100 last:border-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => onTimestampClick?.(note.timestamp_seconds)}
            className="shrink-0 min-w-[48px] px-2 py-0.5 rounded-full border border-violet-300 text-violet-600 text-xs font-semibold bg-white hover:bg-violet-50 transition-colors"
          >
            {formatDuration(note.timestamp_seconds)}
          </button>
          <span className="text-sm font-semibold text-gray-900 truncate">{note.lecture_title}</span>
          <span className="text-sm text-gray-400 truncate">{note.module_title}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded"
            aria-label="Edit note"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteNote.mutate(note.note_id)}
            disabled={deleteNote.isPending}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded disabled:opacity-40"
            aria-label="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="ml-[60px]">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none outline-none focus:ring-2 focus:ring-violet-300 leading-relaxed"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              disabled={updateNote.isPending}
              className="px-3 py-1 text-xs font-medium bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors disabled:opacity-40"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="ml-[60px] text-sm text-gray-500 leading-relaxed bg-gray-50 rounded-lg px-3 py-2">
          {note.body}
        </p>
      )}
    </section>
  );
}
