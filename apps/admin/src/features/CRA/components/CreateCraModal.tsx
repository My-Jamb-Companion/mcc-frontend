"use client";

import {useState} from "react";
import {Modal, showError, showSuccess} from "@mcc/ui";
import {useCreateCra} from "../hooks/useCras";
import {getApiErrorMessage} from "../services/cra.service";

export default function CreateCraModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const createCra = useCreateCra();

  function reset() {
    setFullName("");
    setEmail("");
    setPhone("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleCreate() {
    if (!fullName.trim() || !email.trim()) return;
    createCra.mutate(
      {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      },
      {
        onSuccess: (created) => {
          showSuccess(`${created.full_name} was added as a CRA.`);
          handleClose();
        },
        onError: (error) => {
          showError(getApiErrorMessage(error, "Failed to create CRA. Please try again."));
        },
      },
    );
  }

  return (
    <Modal open={open} title="Create CRA" maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          CRAs don&apos;t self-register -- this creates the account directly.
          They&apos;ll set a password the same way an admin-provisioned
          teacher does, via the forgot-password flow.
        </p>

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
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Phone number <span className="text-gray-400">(optional)</span>
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
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
            onClick={handleCreate}
            disabled={createCra.isPending || !fullName.trim() || !email.trim()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createCra.isPending ? "Creating..." : "Create CRA"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
