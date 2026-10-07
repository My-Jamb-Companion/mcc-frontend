"use client";

import {useState} from "react";
import {ConfirmModal, Modal, showError, showSuccess} from "@mcc/ui";
import {landingErrorMessage} from "../services/landing.service";
import type {LandingVersionSummary} from "../services/landing.service";
import {useLandingVersions, useRestoreLandingVersion} from "../hooks/useLanding";

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, {day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit"}) : "";

/** Earlier published versions. Restoring one puts it in the draft; it goes live only when published. */
export default function VersionHistoryModal({open, onClose, onRestored, disabled}: {
  open: boolean; onClose: () => void; onRestored: () => void; disabled?: boolean;
}) {
  const versions = useLandingVersions(open);
  const restore = useRestoreLandingVersion();
  const [choice, setChoice] = useState<LandingVersionSummary | null>(null);

  return (
    <>
      <Modal open={open} title="Version history" maxWidth="max-w-xl" onClose={onClose} x>
        <div className="flex flex-col gap-2">
          {versions.isLoading && <p className="text-sm text-gray-500">Loading…</p>}
          {versions.isError && <p className="text-sm text-red-600">Couldn&apos;t load the history. Please try again.</p>}
          {versions.data?.length === 0 && <p className="text-sm text-gray-500">Nothing has been published yet.</p>}
          {versions.data?.map((v) => (
            <div key={v.version_id} className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">
                  {v.note || "No note"}{" "}
                  {v.status === "published" && <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Live</span>}
                </p>
                <p className="text-xs text-gray-400">{when(v.published_at)}{v.published_by_name ? ` · ${v.published_by_name}` : ""}</p>
              </div>
              <button
                type="button"
                disabled={disabled || restore.isPending}
                onClick={() => setChoice(v)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Restore to draft
              </button>
            </div>
          ))}
        </div>
      </Modal>
      <ConfirmModal
        open={!!choice}
        title="Restore this version?"
        message="It replaces the draft you have now. Nothing changes for visitors until you publish."
        confirmText="Restore to draft"
        cancelText="Cancel"
        onConfirm={() => {
          const v = choice;
          setChoice(null);
          if (!v) return;
          restore.mutate(v.version_id, {
            onSuccess: () => { showSuccess("Restored to the draft. Publish it when you're happy."); onRestored(); onClose(); },
            onError: (e) => showError(landingErrorMessage(e, "Couldn't restore that version.")),
          });
        }}
        onCancel={() => setChoice(null)}
      />
    </>
  );
}
