"use client";

import {useState} from "react";
import {Icon, Modal, showError, showSuccess} from "@mcc/ui";
import {useDeleteUser, useDeletionCheck} from "../hooks/useUsers";
import {ApiUser, getApiErrorMessage} from "../services/users.service";
import {emailMatches} from "../helper/deleteConfirm";

/**
 * Permanently deletes a test account. The server decides whether an account qualifies (nothing that looks like a real
 * customer: no payments, paid enrolments, earnings, courses taught); this asks first, and shows why when it does not,
 * pointing to Deactivate. The account's email has to be typed back.
 */
export default function DeleteUserModal({user, onClose}: {user: ApiUser | null; onClose: () => void}) {
  const [typed, setTyped] = useState("");
  const check = useDeletionCheck(user?.user_id ?? null);
  const remove = useDeleteUser();

  const close = () => {
    setTyped("");
    onClose();
  };

  function confirm() {
    if (!user) return;
    remove.mutate(
      {userId: user.user_id, confirmEmail: typed.trim()},
      {
        onSuccess: () => {
          showSuccess("The account was deleted.");
          close();
        },
        onError: (error) => showError(getApiErrorMessage(error, "Couldn't delete this account. Please try again.")),
      },
    );
  }

  return (
    <Modal open={!!user} title="Delete account permanently" maxWidth="max-w-md">
      {user && (
        <div className="flex flex-col gap-4">
          {check.isLoading && <p className="py-6 text-center text-sm text-gray-500">Checking this account…</p>}
          {check.isError && <p className="text-sm text-red-500">Couldn&apos;t check this account. Please try again.</p>}

          {check.data && !check.data.can_delete && (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <Icon icon="lucide:shield-alert" size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold">This account can&apos;t be deleted.</p>
                  <ul className="mt-1 list-disc pl-5">
                    {check.data.reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                  <p className="mt-2">Only test accounts can be deleted. To remove a real account&apos;s access, deactivate it: that keeps its history.</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={close} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                  Close
                </button>
              </div>
            </>
          )}

          {check.data?.can_delete && (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
                <Icon icon="lucide:alert-triangle" size={18} className="mt-0.5 shrink-0 text-red-600" />
                <p className="text-sm text-red-800">
                  This permanently deletes <span className="font-semibold">{user.full_name || user.email}</span> and everything
                  that belongs to them: progress, answers, wallet, notifications. It can&apos;t be undone. The email can register again afterwards.
                </p>
              </div>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
                Type <span className="font-mono text-gray-900">{user.email}</span> to confirm
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={close} disabled={remove.isPending} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  disabled={remove.isPending || !emailMatches(typed, user.email)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {remove.isPending ? "Deleting…" : "Delete permanently"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
