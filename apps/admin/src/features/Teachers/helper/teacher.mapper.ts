import {Teacher as ApiTeacher} from "@mcc/features";
import {Teacher} from "../types/types";

/**
 * Adapts one GET /admin/teachers list item (the raw API shape from
 * @mcc/features's teacher.service.ts) into the local Teacher shape
 * TeachersTable already renders.
 */
export function fromApiTeacher(api: ApiTeacher): Teacher {
  const programs = Array.isArray(api.programs) ? api.programs : [];

  return {
    id: api.teacher_id ?? api.id ?? api.email,
    name: api.teacher_name ?? api.name ?? api.email,
    email: api.email,
    avatar: api.avatar_url ?? "",
    programs: programs.length
      ? programs.map((name: string, i: number) => ({
          id: `${api.teacher_id}-${i}`,
          thumbnailLabel: (name || "?").slice(0, 1).toUpperCase(),
          title: name,
          subtitle: api.subject ?? "",
        }))
      : [
          {
            id: `${api.teacher_id}-subject`,
            thumbnailLabel: (api.subject || "?").slice(0, 1).toUpperCase(),
            title: api.subject || "No program assigned",
            subtitle: "",
          },
        ],
    dateJoined: api.date_joined
      ? new Date(api.date_joined).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—",
    rank: api.leaderboard_position ?? 0,
    rating: api.rating != null ? String(api.rating) : "—",
    sessions: {total: api.no_of_sessions ?? 0},
  };
}
