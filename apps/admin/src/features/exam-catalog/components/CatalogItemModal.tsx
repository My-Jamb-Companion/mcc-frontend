"use client";

import {useState} from "react";
import {Modal, showError, showSuccess} from "@mcc/ui";
import {CATALOG_LABELS, CatalogItem, CatalogKind} from "../helper/catalog";
import {useCreateCatalogItem, useUpdateCatalogItem} from "../hooks/useCatalog";
import {getApiErrorMessage} from "../services/catalog.service";

interface Props {
  kind: CatalogKind;
  /** Pass an item to edit it; omit to create a new one. */
  item?: CatalogItem | null;
  open: boolean;
  onClose: () => void;
  /** Create mode only: lets the program wizard select what was just added. */
  onCreated?: (item: CatalogItem) => void;
}

/**
 * Create or edit an exam type / subject. Mount it only while open (it seeds
 * its fields from `item` on mount, so each open starts fresh).
 */
export default function CatalogItemModal({kind, item, open, onClose, onCreated}: Props) {
  const labels = CATALOG_LABELS[kind];
  const editing = !!item;
  const [name, setName] = useState(item?.name ?? "");
  const [isActive, setIsActive] = useState(item?.is_active ?? true);
  const create = useCreateCatalogItem(kind);
  const update = useUpdateCatalogItem(kind);
  const pending = create.isPending || update.isPending;
  const trimmed = name.trim();
  const changed = !editing || trimmed !== item.name || isActive !== item.is_active;

  function submit() {
    if (!trimmed || pending || !changed) return;
    const fail = (error: unknown) =>
      showError(getApiErrorMessage(error, `Couldn't save this ${labels.singular}. Please try again.`));

    if (item) {
      update.mutate(
        {id: item.id, payload: {name: trimmed, is_active: isActive}},
        {
          onSuccess: () => {
            showSuccess(`"${trimmed}" updated.`);
            onClose();
          },
          onError: fail,
        },
      );
    } else {
      create.mutate(trimmed, {
        onSuccess: (created) => {
          showSuccess(`"${created.name}" was added.`);
          onCreated?.(created);
          onClose();
        },
        onError: fail,
      });
    }
  }

  return (
    <Modal open={open} title={editing ? `Edit ${labels.singular}` : `Add ${labels.singular}`} maxWidth="max-w-md">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="catalog-name" className="text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="catalog-name"
            autoFocus
            value={name}
            maxLength={255}
            onChange={(e) => setName(e.target.value)}
            placeholder={`e.g. ${labels.example}`}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </div>

        {editing && (
          <label className="flex items-start gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-400"
            />
            <span>
              Active
              <span className="block font-normal text-gray-400">
                Inactive {labels.plural.toLowerCase()} no longer appear when creating a program. Programs already
                using one keep it.
              </span>
            </span>
          </label>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending || !trimmed || !changed}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Saving…" : editing ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
