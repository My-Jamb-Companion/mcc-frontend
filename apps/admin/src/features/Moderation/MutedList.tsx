"use client";

import { ConfirmModal, showError, showSuccess } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { useMutes, useUnmuteUser } from "./hooks/useModeration";
import { muteEnds } from "./reportCopy";

/** Who is muted from course discussions right now, with a way to lift it early. */
export function MutedList() {
  const { data: mutes, isLoading } = useMutes();
  const unmute = useUnmuteUser();

  return (
    <div className="divide-y divide-gray-100">
      {isLoading && <p className="py-6 text-sm text-neutral-400">Loading…</p>}
      {mutes && mutes.length === 0 && <p className="py-6 text-sm text-neutral-400">Nobody is muted.</p>}
      {mutes?.map((m) => (
        <div key={m.mute_id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900">
              {m.user_name || m.user_email || m.user_id}
              {m.source === "auto" && (
                <span className="ml-2 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">Muted automatically</span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-neutral-400">
              Muted {muteEnds(m.muted_until)}
              {m.user_email && m.user_name ? ` · ${m.user_email}` : ""}
            </p>
            <p className="mt-1 text-sm text-neutral-600">{m.reason}</p>
          </div>
          <ConfirmModal
            title="Lift this mute?"
            description="They'll be able to post in course discussions again, and they'll be told."
            confirmText="Unmute"
            variant="default"
            onConfirm={() =>
              unmute.mutate(m.user_id, {
                onSuccess: () => showSuccess("Unmuted"),
                onError: (error) => showError(extractApiError(error, "Couldn't unmute")),
              })
            }
            trigger={
              <button type="button" className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">
                Unmute
              </button>
            }
          />
        </div>
      ))}
    </div>
  );
}
