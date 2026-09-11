import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  ApiLiveSession,
  cancelSession,
  getLiveSessionsOverview,
  listThisWeekSessions,
  rescheduleSession,
  shareSessionLink,
} from "../services/liveSessions.service";
import {CallRowData} from "../components/SessionCallList";

function toCallRow(api: ApiLiveSession): CallRowData {
  return {
    id: api.session_id,
    studentName: api.title,
    hostName: api.teacher_name,
    subject: api.program_type
      ? `${api.program_type === "course" ? "Course" : "Exam"} session`
      : "Live session",
    time: new Date(api.scheduled_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    type: api.program_type === "exam" ? "Exam" : "Course",
    status: api.status === "completed" ? "completed" : "upcoming",
    action: api.status === "planned" ? "share" : "replay",
    meetingUrl: api.meeting_url ?? undefined,
  };
}

export const useThisWeekSessions = () => {
  const query = useQuery({
    queryKey: ["live-sessions", "this-week"],
    queryFn: () => listThisWeekSessions().then((rows) => rows.map(toCallRow)),
  });

  return {...query, calls: query.data ?? []};
};

export const useLiveSessionsOverview = (days = 30) => {
  return useQuery({
    queryKey: ["live-sessions", "overview", days],
    queryFn: () => getLiveSessionsOverview(days),
  });
};

export const useRescheduleSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({sessionId, scheduledAt}: {sessionId: string; scheduledAt: string}) =>
      rescheduleSession(sessionId, scheduledAt),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["live-sessions"]});
    },
  });
};

export const useCancelSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => cancelSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["live-sessions"]});
    },
  });
};

export const useShareSessionLink = () => {
  return useMutation({
    mutationFn: ({sessionId, recipientId}: {sessionId: string; recipientId: string}) =>
      shareSessionLink(sessionId, recipientId),
  });
};
