import {ApiActiveStudent, ApiProspectiveStudent} from "../services/student.service";
import {Student, ProspectiveStudent, Method} from "../types/types";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function fromApiActiveStudent(api: ApiActiveStudent): Student {
  return {
    id: api.user_id,
    name: api.full_name || api.email,
    email: api.email,
    avatar: "",
    programs: [
      {
        id: "enrolled",
        thumbnailLabel: (api.program_enrolled || "?").slice(0, 1).toUpperCase(),
        title: api.program_enrolled,
        subtitle: api.program_description,
      },
    ],
    dateJoined: formatDate(api.date_joined),
    dateJoinedTime: formatTime(api.date_joined),
    dateOnboarded: formatDate(api.date_onboarded),
    dateOnboardedTime: formatTime(api.date_onboarded),
    rank: api.leaderboard_position ?? 0,
    location: api.location,
  };
}

export function fromApiProspectiveStudent(
  api: ApiProspectiveStudent,
): ProspectiveStudent {
  const method: Method = api.enrolled_program_id
    ? {
        type: "course",
        thumbnailLabel: (api.program_type || "?").slice(0, 1).toUpperCase(),
        title: api.program_type || "Enrolled program",
        subtitle: api.assigned_cra_name
          ? `Assigned to ${api.assigned_cra_name}`
          : "Awaiting CRA assignment",
      }
    : {type: "badge", label: "Free program"};

  return {
    id: api.user_id,
    avatar: api.avatar_url ?? "",
    name: api.full_name || api.email,
    email: api.email,
    dateJoined: formatDate(api.enrolled_at),
    time: formatTime(api.enrolled_at),
    method,
  };
}
