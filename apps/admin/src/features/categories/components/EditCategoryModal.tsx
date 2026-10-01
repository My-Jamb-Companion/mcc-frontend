"use client";

import {useEffect, useState} from "react";
import {Modal, showError, showSuccess} from "@mcc/ui";
import {useUpdateCategory} from "../hooks/useCategories";
import {ApiCategory, getApiErrorMessage} from "../services/category.service";

export default function EditCategoryModal({
  category,
  onClose,
}: {
  category: ApiCategory | null;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const updateCategory = useUpdateCategory();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIsActive(category.is_active);
    }
  }, [category]);

  function handleSave() {
    if (!category || !name.trim()) return;
    updateCategory.mutate(
      {categoryId: category.category_id, payload: {name: name.trim(), is_active: isActive}},
      {
        onSuccess: () => {
          showSuccess("Category updated successfully!");
          onClose();
        },
        onError: (error) => {
          showError(getApiErrorMessage(error, "Failed to update category. Please try again."));
        },
      },
    );
  }

  return (
    <Modal open={!!category} title="Edit category" maxWidth="max-w-md">
      {category && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-400"
            />
            Active
            <span className="font-normal text-gray-400">
              (inactive categories no longer appear as a choice when creating a course or exam program)
            </span>
          </label>

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
              disabled={updateCategory.isPending || !name.trim()}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateCategory.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
