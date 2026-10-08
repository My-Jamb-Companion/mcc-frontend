"use client";

import {useState} from "react";
import {Button, Modal, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {useDebouncedValue} from "@/src/features/students/hooks/useDebouncedValue";
import {useCreateSession, useProgramLookup, useTeacherLookup} from "../hooks/useLiveSessions";
import {
  SessionErrors,
  SessionForm,
  emptySessionForm,
  minDateTimeLocal,
  toCreateInput,
  validateSession,
} from "../helper/sessionForm";

const inputClass = "w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500";

function Field({label, error, children, htmlFor}: {label: string; error?: string; children: React.ReactNode; htmlFor?: string}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-900">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/** Pick one thing from a search box: type, choose a result, and the choice shows with a way to change it. */
function Picker<T>({
  id, placeholder, chosen, label, onChoose, onClear, useResults, describe,
}: {
  id: string;
  placeholder: string;
  chosen: T | null;
  label: (item: T) => string;
  onChoose: (item: T) => void;
  onClear: () => void;
  useResults: (q: string) => {data?: T[]; isFetching: boolean};
  describe: (item: T) => string;
}) {
  const [text, setText] = useState("");
  const query = useDebouncedValue(text, 250);
  const {data, isFetching} = useResults(query);

  if (chosen) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5 text-sm">
        <span className="truncate font-medium text-neutral-900">{label(chosen)}</span>
        <button type="button" onClick={() => { onClear(); setText(""); }} className="ml-3 shrink-0 text-xs font-semibold text-violet-700 hover:underline">
          Change
        </button>
      </div>
    );
  }
  return (
    <div className="relative">
      <input id={id} value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} autoComplete="off" className={inputClass} />
      {text.trim() && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
          {isFetching && !data?.length && <li className="px-3 py-2 text-xs text-neutral-500">Searching…</li>}
          {!isFetching && data?.length === 0 && <li className="px-3 py-2 text-xs text-neutral-500">No match.</li>}
          {data?.map((item, i) => (
            <li key={i}>
              <button type="button" onClick={() => onChoose(item)} className="flex w-full flex-col px-3 py-2 text-left hover:bg-neutral-50">
                <span className="text-sm font-medium text-neutral-900">{label(item)}</span>
                <span className="text-xs text-neutral-500">{describe(item)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Schedule a live class: a teacher, a time and (optionally) the course or exam program it belongs to. */
export default function CreateSessionModal({open, onClose}: {open: boolean; onClose: () => void}) {
  // Remounted on every open (see the key at the call site), so the form always starts empty.
  const [form, setForm] = useState<SessionForm>(emptySessionForm);
  const [errors, setErrors] = useState<SessionErrors>({});
  const create = useCreateSession();

  const set = <K extends keyof SessionForm>(key: K, value: SessionForm[K]) => setForm((prev) => ({...prev, [key]: value}));

  const submit = () => {
    const found = validateSession(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    create.mutate(toCreateInput(form), {
      onSuccess: () => {
        showSuccess("Class scheduled");
        onClose();
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Schedule a live class" maxWidth="max-w-lg">
      <div className="flex flex-col gap-4">
        <Field label="Title" error={errors.title} htmlFor="session-title">
          <input id="session-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. JAMB Mathematics: revision" className={inputClass} />
        </Field>

        <Field label="Teacher" error={errors.teacher} htmlFor="session-teacher">
          <Picker
            id="session-teacher" placeholder="Search by name or email" chosen={form.teacher}
            label={(t) => t.teacher_name ?? t.email} describe={(t) => [t.subject, t.email].filter(Boolean).join(" · ")}
            onChoose={(t) => set("teacher", t)} onClear={() => set("teacher", null)} useResults={useTeacherLookup}
          />
        </Field>

        <Field label="Course or exam program (optional)" htmlFor="session-program">
          <Picker
            id="session-program" placeholder="Search by name" chosen={form.program}
            label={(p) => p.program_name} describe={(p) => (p.program_type === "course" ? "Course" : "Exam program")}
            onChoose={(p) => set("program", p)} onClear={() => set("program", null)} useResults={useProgramLookup}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date and time" error={errors.scheduledAt} htmlFor="session-when">
            <input id="session-when" type="datetime-local" min={minDateTimeLocal()} value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Length (minutes)" error={errors.duration} htmlFor="session-duration">
            <input id="session-duration" inputMode="numeric" value={form.duration} onChange={(e) => set("duration", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Price (₦)" error={errors.price} htmlFor="session-price">
            <input id="session-price" inputMode="decimal" value={form.price} onChange={(e) => set("price", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Meeting link (optional)" error={errors.meetingUrl} htmlFor="session-link">
            <input id="session-link" value={form.meetingUrl} onChange={(e) => set("meetingUrl", e.target.value)} placeholder="Leave blank to create a Zoom meeting" className={inputClass} />
          </Field>
        </div>

        {create.isError && <p className="text-sm text-red-600">{extractApiError(create.error, "Couldn't schedule the class. Please try again.")}</p>}

        <div className="flex gap-3">
          <Button width="full" onClick={submit} disabled={create.isPending}>{create.isPending ? "Scheduling…" : "Schedule class"}</Button>
          <Button width="full" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}
