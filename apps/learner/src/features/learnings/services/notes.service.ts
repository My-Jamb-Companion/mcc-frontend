import {apiClient} from "@mcc/api";

/** A student's own note, pinned to a lecture + video timestamp. */
export interface ApiNote {
  note_id: string;
  lecture_id: string;
  lecture_title: string;
  module_title: string;
  timestamp_seconds: number;
  body: string;
  created_at: string;
  updated_at: string;
}

/** Endpoint: GET /courses/<course_id>/notes */
export const getNotes = async (courseId: string): Promise<ApiNote[]> => {
  const res = await apiClient.get<{data: ApiNote[]}>(`/courses/${courseId}/notes`);
  return res.data.data;
};

/** Endpoint: POST /courses/<course_id>/notes */
export const createNote = async (
  courseId: string,
  input: {lectureId: string; timestampSeconds: number; body: string},
): Promise<{note_id: string}> => {
  const res = await apiClient.post<{data: {note_id: string}}>(`/courses/${courseId}/notes`, {
    lecture_id: input.lectureId,
    timestamp_seconds: input.timestampSeconds,
    body: input.body,
  });
  return res.data.data;
};

/** Endpoint: PATCH /courses/<course_id>/notes/<note_id> */
export const updateNote = async (
  courseId: string,
  noteId: string,
  body: string,
): Promise<{note_id: string}> => {
  const res = await apiClient.patch<{data: {note_id: string}}>(
    `/courses/${courseId}/notes/${noteId}`,
    {body},
  );
  return res.data.data;
};

/** Endpoint: DELETE /courses/<course_id>/notes/<note_id> */
export const deleteNote = async (courseId: string, noteId: string): Promise<void> => {
  await apiClient.delete(`/courses/${courseId}/notes/${noteId}`);
};
