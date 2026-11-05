export type ListenKind = "course" | "exam";

/** One section of a lesson as the server will speak it: the same sections, in the same order, as the pages. */
export interface AudioSection {
  index: number;
  heading: string | null;
  /** Audio parts to play in order; 0 when the section has nothing to say. */
  parts: number;
  chars: number;
}

export interface AudioManifest {
  available: boolean;
  sections: AudioSection[];
}

/** One piece of audio to play. */
export interface PlaylistItem {
  section: number;
  part: number;
}

export const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;
export const DEFAULT_SPEED = 1;

/** Where a lesson's audio lives: a course's or an exam-prep program's, with an optional section and part. */
export function audioPath(kind: ListenKind, parentId: string, lectureId: string, section?: number, part?: number): string {
  const base = kind === "exam" ? `/exams/${parentId}/lectures/${lectureId}/audio` : `/courses/${parentId}/lectures/${lectureId}/audio`;
  return section === undefined || part === undefined ? base : `${base}/${section}/${part}`;
}

/** Every part of every section, in the order they are heard; a section with nothing to say adds nothing. */
export function playlist(sections: AudioSection[]): PlaylistItem[] {
  const items: PlaylistItem[] = [];
  for (const s of sections) {
    for (let part = 0; part < s.parts; part++) items.push({section: s.index, part});
  }
  return items;
}

/** The place in the playlist to start from for a section: its first part, or the next section that has one. -1 when none is left. */
export function firstItemFrom(items: PlaylistItem[], section: number): number {
  return items.findIndex((item) => item.section >= section);
}

/** The speed after this one, wrapping from the fastest back to the slowest. */
export function nextSpeed(current: number): number {
  const i = SPEEDS.findIndex((s) => s === current);
  return SPEEDS[(i + 1) % SPEEDS.length];
}

/** A speed read back from storage, or the default when it is missing or not one we offer. */
export function readSpeed(stored: string | null): number {
  const n = Number(stored);
  return (SPEEDS as readonly number[]).includes(n) ? n : DEFAULT_SPEED;
}

/**
 * Listening is only offered when the server can speak the lesson and its sections line up one-for-one with the pages
 * on screen; if they ever differ, the page and the audio could not stay together, so it is not offered.
 */
export function canListen(manifest: AudioManifest | undefined, pages: number): boolean {
  return !!manifest && manifest.available && manifest.sections.length === pages && manifest.sections.some((s) => s.parts > 0);
}

export const sectionLabel = (section: number, total: number): string => `Section ${section + 1} of ${total}`;
