import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {extractApiError} from "@mcc/api";
import {showError, showSuccess} from "@mcc/ui";
import {
  ApiLiveSession,
  cancelSession,
  markSessionDelivered,
  undoSessionDelivered,
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
    started: new Date(api.scheduled_at).getTime() <= Date.now(),
    delivered: api.status === "completed",
    cancelled: api.status === "cancelled",
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

const naira = (v: string) => `₦${new Intl.NumberFormat("en-NG", {maximumFractionDigits: 0}).format(Math.abs(Number(v)))}`;

/** Teachers are paid per session delivered (pricing model D1); admins can confirm or correct a delivery. */
export const useSessionDelivery = () => {
  const queryClient = useQueryClient();
  const onError = (e: unknown) => showError(extractApiError(e, "Couldn't update the delivery"));
  const refresh = () => queryClient.invalidateQueries({queryKey: ["live-sessions"]});
  const mark = useMutation({
    mutationFn: markSessionDelivered,
    onSuccess: (r) => {
      showSuccess(r.enrolments_paid > 0
        ? `Marked delivered. The teacher was paid ${naira(r.amount_credited)} for ${r.enrolments_paid} enrolment${r.enrolments_paid === 1 ? "" : "s"}.`
        : r.legacy_enrolments > 0 && r.enrolments_with_budget_used_up === 0
          ? "Marked delivered. Its students bought at an old flat price, so the teacher was paid when they bought."
          : "Marked delivered. No enrolment had paid sessions left to pay the teacher for.");
      refresh();
    },
    onError,
  });
  const undo = useMutation({
    mutationFn: undoSessionDelivered,
    onSuccess: (r) => {
      showSuccess(Number(r.amount_credited) !== 0
        ? `Delivery undone. ${naira(r.amount_credited)} was taken back from the teacher's earnings.`
        : "Delivery undone. It hadn't paid the teacher anything.");
      refresh();
    },
    onError,
  });
  return {mark, undo};
};
