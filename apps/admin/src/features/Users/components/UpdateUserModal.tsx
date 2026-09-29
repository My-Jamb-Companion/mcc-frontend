"use client";

import {useEffect, useState} from "react";
import {Modal, showError, showSuccess} from "@mcc/ui";
import {useUpdateUser} from "../hooks/useUsers";
import {ApiUser, getApiErrorMessage} from "../services/users.service";

export default function UpdateUserModal({
  user,
  onClose,
}: {
  user: ApiUser | null;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? "");
      setPhoneNumber(user.phone_number ?? "");
    }
  }, [user]);

  function handleSave() {
    if (!user) return;
    updateUser.mutate(
      {userId: user.user_id, payload: {full_name: fullName.trim(), phone_number: phoneNumber.trim()}},
      {
        onSuccess: () => {
          showSuccess("User updated successfully!");
          onClose();
        },
        onError: (error) => {
          showError(getApiErrorMessage(error, "Failed to update user. Please try again."));
        },
      },
    );
  }

  return (
    <Modal open={!!user} title="Update user" maxWidth="max-w-md">
      {user && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{user.email}</p>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Phone number</label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateUser.isPending || !fullName.trim()}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateUser.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
