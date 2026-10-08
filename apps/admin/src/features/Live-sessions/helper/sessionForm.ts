import type {CreateSessionInput, ProgramOption, TeacherOption} from "../services/liveSessions.service";

/** The windows the overview offers. The server allows at most a year, so there is no "all time". */
export const DURATION_DAYS: Record<string, number> = {
  "last month": 30,
  "last 6 months": 180,
  "last year": 365,
};

export interface SessionForm {
  title: string;
  teacher: TeacherOption | null;
  program: ProgramOption | null;
  /** From a datetime-local input: "YYYY-MM-DDTHH:mm", in the admin's own time zone. */
  scheduledAt: string;
  duration: string;
  price: string;
  meetingUrl: string;
}

export const emptySessionForm = (): SessionForm => ({
  title: "", teacher: null, program: null, scheduledAt: "", duration: "60", price: "0", meetingUrl: "",
});

export type SessionErrors = Partial<Record<keyof SessionForm, string>>;

export function validateSession(form: SessionForm, now: Date = new Date()): SessionErrors {
  const errors: SessionErrors = {};
  if (!form.title.trim()) errors.title = "Give the class a title.";
  if (!form.teacher) errors.teacher = "Choose the teacher.";
  if (!form.scheduledAt) errors.scheduledAt = "Choose a date and time.";
  else {
    const when = new Date(form.scheduledAt);
    if (Number.isNaN(when.getTime())) errors.scheduledAt = "That date and time isn't valid.";
    else if (when.getTime() <= now.getTime()) errors.scheduledAt = "The class must be in the future.";
  }
  const minutes = Number(form.duration);
  if (!/^\d+$/.test(form.duration.trim()) || minutes < 1 || minutes > 480) errors.duration = "Enter 1 to 480 minutes.";
  const price = Number(form.price);
  if (form.price.trim() === "" || !Number.isFinite(price) || price < 0) errors.price = "Enter 0 or more.";
  if (form.meetingUrl.trim() && !/^https?:\/\//i.test(form.meetingUrl.trim())) errors.meetingUrl = "A meeting link starts with https://";
  return errors;
}

/** The request body for a valid form: the time as an ISO instant, the program as its id and type. */
export function toCreateInput(form: SessionForm): CreateSessionInput {
  return {
    title: form.title.trim(),
    teacher_id: form.teacher!.teacher_id,
    ...(form.program ? {program_type: form.program.program_type, program_id: form.program.program_id} : {}),
    scheduled_at: new Date(form.scheduledAt).toISOString(),
    duration_minutes: Number(form.duration),
    price: Number(form.price),
    ...(form.meetingUrl.trim() ? {meeting_url: form.meetingUrl.trim()} : {}),
  };
}

/** The earliest value a datetime-local input should offer: now, to the minute, in local time. */
export function minDateTimeLocal(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/**
 * Chart rows for the call summary: one per day of the window, oldest first, a short date label and
 * numbers (the server sends revenue as a string and leaves out days with no calls, which would
 * make a quiet week look like a short one).
 */
export function chartRows(
  days: {date: string; calls: number; revenue: number | string}[],
  windowDays?: number,
  now: Date = new Date(),
) {
  const label = (key: string) =>
    new Date(`${key}T12:00:00`).toLocaleDateString("en-GB", {day: "numeric", month: "short"});
  const byDay = new Map(days.map((d) => [d.date.slice(0, 10), d]));
  const keys: string[] = [];
  if (windowDays) {
    for (let i = windowDays - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 12);
      keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    }
  } else {
    keys.push(...[...byDay.keys()].sort());
  }
  return keys.map((key) => {
    const d = byDay.get(key);
    return {day: label(key), calls: d?.calls ?? 0, revenue: Number(d?.revenue) || 0};
  });
}
