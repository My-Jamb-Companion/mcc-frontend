"use client";

import {showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {ChevronUp} from "lucide-react";
import {useVote} from "@/src/features/learnings/hooks/useCommunity";

/** One vote per person on a question or an answer, never your own. Shows the count either way. */
export function VoteButton({courseId, postId, count, voted, disabled}: {courseId: string; postId: string; count: number; voted: boolean; disabled?: boolean}) {
  const vote = useVote(courseId);
  return (
    <button
      type="button"
      disabled={disabled || vote.isPending}
      aria-pressed={voted}
      aria-label={voted ? `Remove your vote (${count})` : `Vote up (${count})`}
      onClick={() =>
        vote.mutate({postId, on: !voted}, {onError: (e) => showError(extractApiError(e, "Couldn't save your vote"))})
      }
      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-default ${
        voted ? "border-primary bg-primary/10 text-primary" : "border-muted/30 text-muted hover:text-foreground"
      }`}
    >
      <ChevronUp className="w-3.5 h-3.5" />
      <span>{count}</span>
    </button>
  );
}
