"use client";

import {useState} from "react";
import {Modal, showError, showSuccess} from "@mcc/ui";
import {useCreateCategory} from "../hooks/useCategories";
import {getApiErrorMessage} from "../services/category.service";

export default function CreateCategoryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const createCategory = useCreateCategory();

  function handleClose() {
    setName("");
    onClose();
  }

  function handleCreate() {
    if (!name.trim()) return;
    createCategory.mutate(name.trim(), {
      onSuccess: (created) => {
        showSuccess(`"${created.name}" was added as a category.`);
        handleClose();
      },
      onError: (error) => {
        showError(getApiErrorMessage(error, "Failed to create category. Please try again."));
      },
    });
  }

  return (
    <Modal open={open} title="Create category" maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mathematics"
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
            disabled={createCategory.isPending || !name.trim()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createCategory.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
