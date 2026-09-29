"use client";

import {useState} from "react";
import {Icon, Modal, showError, showSuccess} from "@mcc/ui";
import {useDeactivateUser} from "../hooks/useUsers";
import {ApiUser, getApiErrorMessage} from "../services/users.service";

export default function DeactivateUserModal({
  user,
  onClose,
}: {
  user: ApiUser | null;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const deactivateUser = useDeactivateUser();

  function handleConfirm() {
    if (!user || !reason.trim()) return;
    deactivateUser.mutate(
      {userId: user.user_id, reason: reason.trim()},
      {
        onSuccess: () => {
          showSuccess("User has been deactivated.");
          setReason("");
          onClose();
        },
        onError: (error) => {
          showError(getApiErrorMessage(error, "Failed to deactivate user. Please try again."));
        },
      },
    );
  }

  function handleClose() {
    setReason("");
    onClose();
  }

  return (
    <Modal open={!!user} title="Deactivate user" maxWidth="max-w-md">
      {user && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <Icon icon="lucide:alert-triangle" size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              This deactivates <span className="font-semibold">{user.full_name || user.email}</span>'s
              account -- they won't be able to log in. This is reversible; accounts are never
              permanently deleted.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Reason (required)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this account being deactivated?"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={deactivateUser.isPending || !reason.trim()}
              className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deactivateUser.isPending ? "Deactivating..." : "Deactivate"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
