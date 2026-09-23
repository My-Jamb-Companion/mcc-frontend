import {apiClient} from "@mcc/api";

export interface ProgramSearchResult {
  program_id: string;
  program_name: string;
  program_type: "course" | "exam";
  teacher_id: string | null;
}

export interface TeacherProgram {
  program_id: string;
  program_name: string;
  program_type: "course" | "exam";
  description?: string | null;
  rating?: number | null;
  students_count: number;
}

export interface UpcomingSession {
  session_id: string;
  program_name: string;
  session_type: string;
  scheduled_date: string;
  duration: string;
  teacher_names: string[];
  zoom_url?: string | null;
  calls_taken: number;
}

export interface CoTeacher {
  teacher_id: string;
  teacher_name: string | null;
  subject?: string | null;
  email: string;
}

export interface TeacherDetail {
  teacher_id: string;
  teacher_name: string | null;
  email: string;
  // Auto-generated at signup and not editable anywhere in the app yet.
  username?: string | null;
  // Only the detail endpoint carries these; GET /admin/teachers' list items don't.
  phone?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  status: string;
  rating?: number | null;
  leaderboard_position?: number | null;
  programs: TeacherProgram[];
  date_joined: string;
  no_of_sessions: number;
  calls_taken: number;
  upcoming_session?: UpcomingSession | null;
  co_teachers: CoTeacher[];
}

export interface UpdateTeacherProfilePayload {
  teacher_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  subject?: string;
  avatar_url?: string;
}

/**
 * Searches courses and exam programs by name, for the "Assign Program"
 * picker. Endpoint: GET /admin/teachers/programs/search
 */
export const searchPrograms = async (query: string): Promise<ProgramSearchResult[]> => {
  if (!query.trim()) return [];
  const res = await apiClient.get<{success: boolean; data: ProgramSearchResult[]}>(
    "/admin/teachers/programs/search",
    {params: {q: query}},
  );
  return res.data.data;
};

/**
 * Fetches a teacher's full profile, including their real, currently
 * assigned programs (with real program IDs -- unlike GET /admin/teachers'
 * list view, which only returns program names).
 * Endpoint: GET /admin/teachers/{teacher_id}
 */
export const getTeacherDetail = async (teacherId: string): Promise<TeacherDetail> => {
  const res = await apiClient.get<{success: boolean; data: TeacherDetail}>(
    `/admin/teachers/${teacherId}`,
  );
  return res.data.data;
};

/**
 * Updates any of teacher_name, email, phone, location, subject, avatar_url.
 * Changing email is a real login-identity change on the backend -- it 409s
 * if another user already has that address, and resets email_verified.
 * Endpoint: PATCH /admin/teachers/{teacher_id}
 */
export const updateTeacherProfile = async (
  teacherId: string,
  updates: UpdateTeacherProfilePayload,
): Promise<{teacher_id: string; updates: Record<string, unknown>}> => {
  const res = await apiClient.patch<{success: boolean; data: {teacher_id: string; updates: Record<string, unknown>}}>(
    `/admin/teachers/${teacherId}`,
    updates,
  );
  return res.data.data;
};

/**
 * Assigns a teacher to a program (course or exam). No body -- the route
 * only reads program_id from the URL path.
 * Endpoint: POST /admin/teachers/{teacher_id}/programs/{program_id}
 */
export const assignProgram = async (teacherId: string, programId: string): Promise<void> => {
  await apiClient.post(`/admin/teachers/${teacherId}/programs/${programId}`);
};

/**
 * Unassigns a teacher from a program.
 * Endpoint: DELETE /admin/teachers/{teacher_id}/programs/{program_id}
 */
export const unassignProgram = async (teacherId: string, programId: string): Promise<void> => {
  await apiClient.delete(`/admin/teachers/${teacherId}/programs/${programId}`);
};
