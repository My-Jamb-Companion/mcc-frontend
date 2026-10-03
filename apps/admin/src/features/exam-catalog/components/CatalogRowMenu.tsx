"use client";

import {useState} from "react";
import {Icon} from "@mcc/ui";
import type {CatalogItem} from "../helper/catalog";

export default function CatalogRowMenu({
  item,
  onEdit,
  onToggleActive,
}: {
  item: CatalogItem;
  onEdit: () => void;
  onToggleActive: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Actions for ${item.name}`}
        className="rounded p-1 hover:bg-gray-200"
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
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onToggleActive();
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                item.is_active ? "text-danger" : "text-success"
              }`}
            >
              <Icon icon={item.is_active ? "lucide:eye-off" : "lucide:eye"} size={14} />
              {item.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
