"use client";

import {useState} from "react";
import {ChevronDown, Pencil, Trash2, Plus} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface Note {
  id: string;
  timestamp: string;
  lectureTitle: string;
  lectureSubtitle: string;
  body: string;
}

interface NotesTabProps {
  currentTimestamp?: number;
  notes?: Note[];
  onTimestampClick?: (timestamp: string) => void;
}

export default function NotesTab({
  currentTimestamp = 0,
  notes: initialNotes = DEFAULT_NOTES,
  onTimestampClick,
}: NotesTabProps) {
  const formattedTime = formatTime(currentTimestamp);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [lecture, setLecture] = useState("All lecture");
  const [sort, setSort] = useState("Sort by most recent");
  const [newNoteText, setNewNoteText] = useState("");
  const [composing, setComposing] = useState(false);

  const handleAdd = () => {
    if (!newNoteText.trim()) return;
    const newNote: Note = {
      id: crypto.randomUUID(),
      timestamp: formattedTime,
      lectureTitle: "Current Lecture",
      lectureSubtitle: "",
      body: newNoteText.trim(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setNewNoteText("");
    setComposing(false);
  };

  const handleEdit = (id: string, body: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? {...n, body} : n)));
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <section className="w-full md:max-w-[75%] mx-auto font-sans">
      {/* Create note input */}
      <div className="mb-5">
        {composing ? (
          <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm">
            <p className="text-xs text-violet-600 font-medium mb-2">
              Note at {formattedTime}
            </p>
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
                disabled={!newNoteText.trim()}
                className="px-3 py-1 text-xs font-medium bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Save note
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setComposing(true)}
            className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-400 bg-white hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm text-left"
          >
            <span>Create a new note at {formattedTime}</span>
            <Plus className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Dropdown
          value={lecture}
          options={["All lecture", "This lecture", "Bookmarked"]}
          onChange={setLecture}
        />
        <Dropdown
          value={sort}
          options={[
            "Sort by most recent",
            "Sort by oldest",
            "Sort by lecture order",
          ]}
          onChange={setSort}
        />
      </div>

      {/* Notes list */}
      <div>
        {notes.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            No notes yet. Create one above!
          </p>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTimestampClick={onTimestampClick}
            />
          ))
        )}
      </div>
    </section>
  );
}

// ─── Dropdown ────────────────────────────────────────────────────────────────

function Dropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        {value}
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-md z-10 min-w-[180px]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                opt === value ? "text-violet-600 font-medium" : "text-gray-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TimestampBadge ───────────────────────────────────────────────────────────

function TimestampBadge({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="min-w-[48px] px-2 py-0.5 rounded-full border border-violet-300 text-violet-600 text-xs font-semibold bg-white hover:bg-violet-50 transition-colors"
    >
      {label}
    </button>
  );
}

// ─── NoteCard ────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  onEdit,
  onDelete,
  onTimestampClick,
}: {
  note: Note;
  onEdit: (id: string, body: string) => void;
  onDelete: (id: string) => void;
  onTimestampClick?: (ts: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.body);

  const handleSave = () => {
    onEdit(note.id, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(note.body);
    setEditing(false);
  };

  return (
    <section className="py-4 border-b border-gray-100 last:border-none">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <TimestampBadge
            label={note.timestamp}
            onClick={() => onTimestampClick?.(note.timestamp)}
          />
          <span className="text-sm font-semibold text-gray-900">
            {note.lectureTitle}
          </span>
          <span className="text-sm text-gray-400">{note.lectureSubtitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded"
            aria-label="Edit note"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded"
            aria-label="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
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
              className="px-3 py-1 text-xs font-medium bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
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

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_NOTES: Note[] = [
  {
    id: "1",
    timestamp: "1:20",
    lectureTitle: "Flexbox",
    lectureSubtitle: "Flex Sizing",
    body: "Might not need this, but it is good",
  },
  {
    id: "2",
    timestamp: "2:13",
    lectureTitle: "Introduction",
    lectureSubtitle: "Certification Information",
    body: "This is working, I enjoyed it",
  },
];
