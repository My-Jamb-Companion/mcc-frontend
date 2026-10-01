"use client";

import {useState} from "react";
import {Icon} from "@mcc/ui";
import {ApiCategory} from "../services/category.service";

export default function CategoryRowMenu({
  category,
  onEdit,
  onDeactivate,
  onActivate,
}: {
  category: ApiCategory;
  onEdit: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Row actions"
        className="p-1 hover:bg-gray-200 rounded"
      >
        <Icon icon="lucide:more-vertical" size={18} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Icon icon="lucide:pencil" size={14} />
              Edit
            </button>
            {category.is_active ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onDeactivate();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-red-50"
              >
                <Icon icon="lucide:eye-off" size={14} />
                Deactivate
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onActivate();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-success hover:bg-green-50"
              >
                <Icon icon="lucide:eye" size={14} />
                Activate
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
