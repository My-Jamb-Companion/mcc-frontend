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

export interface TeacherDetail {
  teacher_id: string;
  teacher_name: string | null;
  email: string;
  // Only the detail endpoint carries these; GET /admin/teachers' list items don't.
  phone?: string | null;
  location?: string | null;
  programs: TeacherProgram[];
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
