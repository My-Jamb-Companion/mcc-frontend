import {apiClient} from "@mcc/api";

export type AudioKind = "course" | "exam";

export interface MissingPart {
  section: number;
  part: number;
  chars: number;
}

export interface LessonAudio {
  lecture_id: string;
  title: string;
  module_title: string | null;
  sections: number;
  parts: number;
  chars: number;
  ready_parts: number;
  missing: MissingPart[];
}

export interface AudioStatus {
  configured: boolean;
  voice: {provider: string; model: string; voice: string} | null;
  daily_limit: number;
  spent_today: number;
  lectures: LessonAudio[];
  totals: {lectures: number; parts: number; chars: number; missing_parts: number; missing_chars: number};
}

export interface GenerateResult {
  made: boolean;
  chars: number;
  spent_today: number;
}

const base = (kind: AudioKind, parentId: string) =>
  kind === "exam" ? `/admin/exams/programs/${parentId}/lesson-audio` : `/admin/courses/${parentId}/lesson-audio`;

/** Endpoint: GET /admin/courses/<id>/lesson-audio or /admin/exams/programs/<id>/lesson-audio */
export const getAudioStatus = async (kind: AudioKind, parentId: string): Promise<AudioStatus> =>
  (await apiClient.get<{data: AudioStatus}>(base(kind, parentId))).data.data;

/** Endpoint: POST .../lesson-audio/generate -- makes one part now unless it already exists. */
export const generateAudioPart = async (
  kind: AudioKind,
  parentId: string,
  lectureId: string,
  section: number,
  part: number,
): Promise<GenerateResult> =>
  (await apiClient.post<{data: GenerateResult}>(`${base(kind, parentId)}/generate`, {lecture_id: lectureId, section, part})).data.data;
