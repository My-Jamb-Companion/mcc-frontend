import type { ApiContentReport } from "./services/moderation.service";

export const POST_STATE: Record<string, { label: string; style: string }> = {
  visible: { label: "Showing", style: "bg-green-50 text-green-700" },
  held: { label: "Held, only its author sees it", style: "bg-amber-50 text-amber-700" },
  hidden: { label: "Hidden after reports, only its author sees it", style: "bg-amber-50 text-amber-700" },
  removed: { label: "Removed", style: "bg-gray-100 text-gray-600" },
};

/** What the two buttons do depends on what was reported: for a community post they decide the post itself. */
export function decisionCopy(report: Pick<ApiContentReport, "content_type" | "content_status" | "pending_reports">) {
  if (report.content_type !== "community_post") {
    return {
      resolve: { label: "Resolve", title: "Resolve report", text: "Confirm you've acted on the reported content. This marks the report resolved." },
      dismiss: { label: "Dismiss", title: "Dismiss report", text: "No action needed on the reported content. This marks the report dismissed." },
    };
  }
  const others = Math.max(0, (report.pending_reports ?? 1) - 1);
  const alsoClosed = others > 0 ? ` The ${others} other open report${others === 1 ? "" : "s"} on it will be closed too.` : "";
  const putsBack = report.content_status === "held" || report.content_status === "hidden";
  return {
    resolve: {
      label: "Remove post",
      title: "Remove this post?",
      text: `The post is removed from the course and its author is told.${alsoClosed} Everyone who reported it is told it was removed.`,
    },
    dismiss: {
      label: putsBack ? "Keep post" : "Dismiss",
      title: putsBack ? "Keep this post?" : "Dismiss this report?",
      text: putsBack
        ? `The post goes back to the course.${alsoClosed} Everyone who reported it is told it was reviewed and left in place.`
        : "The post stays as it is. This report is dismissed and the reporter is told it was reviewed and left in place.",
    },
  };
}

