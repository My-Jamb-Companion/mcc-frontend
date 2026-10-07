"use client";

import {useState} from "react";
import {ConfirmModal, Icon, Modal} from "@mcc/ui";
import {BLOCK_BY_TYPE, BLOCKS} from "@mcc/landing-content";
import type {LandingBlock} from "@mcc/landing-content";
import {blockSubtitle, blockTitle, positionLabel} from "../helper/editor";

export const SITE_SELECTION = "__site__";

function Row({block, index, total, selected, disabled, onSelect, onToggle, onMove, onDuplicate, onRemove, dragging, onDragStart, onDragOver, onDragEnd}: {
  block: LandingBlock; index: number; total: number; selected: boolean; disabled?: boolean;
  onSelect: () => void; onToggle: () => void; onMove: (to: number) => void; onDuplicate: () => void; onRemove: () => void;
  dragging: boolean; onDragStart: () => void; onDragOver: () => void; onDragEnd: () => void;
}) {
  const def = BLOCK_BY_TYPE[block.type];
  const sub = blockSubtitle(block);
  const small = "flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <li
      draggable={!disabled}
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDragEnd={onDragEnd}
      className={`rounded-xl border bg-white ${selected ? "border-violet-400 ring-2 ring-violet-100" : "border-gray-200"} ${dragging ? "opacity-40" : ""}`}
    >
      <div className="flex items-center gap-1 pr-1.5">
        <span className="cursor-grab px-1.5 text-gray-300" aria-hidden="true"><Icon icon="lucide:grip-vertical" size={16} /></span>
        <button type="button" onClick={onSelect} aria-current={selected} className="flex min-w-0 flex-1 items-center gap-2.5 py-2.5 text-left">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${block.visible ? "bg-violet-50 text-violet-600" : "bg-gray-100 text-gray-400"}`}>
            <Icon icon={def?.icon ?? "lucide:square"} size={16} />
          </span>
          <span className="min-w-0">
            <span className={`block truncate text-sm font-medium ${block.visible ? "text-gray-800" : "text-gray-400"}`}>{blockTitle(block)}</span>
            {(sub || !block.visible) && (
              <span className="block truncate text-xs text-gray-400">{block.visible ? sub : `Hidden${sub ? ` · ${sub}` : ""}`}</span>
            )}
          </span>
        </button>
        <button type="button" className={small} disabled={disabled} onClick={onToggle} aria-label={block.visible ? "Hide this section" : "Show this section"} title={block.visible ? "Hide this section" : "Show this section"}>
          <Icon icon={block.visible ? "lucide:eye" : "lucide:eye-off"} size={15} />
        </button>
        <button type="button" className={small} disabled={disabled || index === 0} onClick={() => onMove(index - 1)} aria-label={`Move up (${positionLabel(index, total)})`} title="Move up">
          <Icon icon="lucide:chevron-up" size={15} />
        </button>
        <button type="button" className={small} disabled={disabled || index === total - 1} onClick={() => onMove(index + 1)} aria-label={`Move down (${positionLabel(index, total)})`} title="Move down">
          <Icon icon="lucide:chevron-down" size={15} />
        </button>
        <button type="button" className={small} disabled={disabled} onClick={onDuplicate} aria-label="Duplicate this section" title="Duplicate">
          <Icon icon="lucide:copy" size={15} />
        </button>
        <button type="button" className={`${small} hover:!bg-red-50 hover:!text-red-600`} disabled={disabled} onClick={onRemove} aria-label="Delete this section" title="Delete">
          <Icon icon="lucide:trash-2" size={15} />
        </button>
      </div>
    </li>
  );
}

/** The sections of the page, in order: pick one to edit it, drag or use the arrows to reorder, hide, copy or delete. */
export default function BlockList({blocks, selectedId, disabled, onSelect, onMove, onToggle, onDuplicate, onRemove, onAdd}: {
  blocks: LandingBlock[]; selectedId: string | null; disabled?: boolean;
  onSelect: (id: string) => void; onMove: (id: string, to: number) => void; onToggle: (id: string) => void;
  onDuplicate: (id: string) => void; onRemove: (id: string) => void; onAdd: (type: string) => void;
}) {
  const [removing, setRemoving] = useState<LandingBlock | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => onSelect(SITE_SELECTION)}
        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left ${selectedId === SITE_SELECTION ? "border-violet-400 ring-2 ring-violet-100" : "border-gray-200"} bg-white`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500"><Icon icon="lucide:settings-2" size={16} /></span>
        <span>
          <span className="block text-sm font-medium text-gray-800">Header, footer and search</span>
          <span className="block text-xs text-gray-400">Name, menu, footer links, SEO</span>
        </span>
      </button>

      <p className="mt-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Sections</p>
      <ul className="flex flex-col gap-1.5">
        {blocks.map((block, i) => (
          <Row
            key={block.id}
            block={block}
            index={i}
            total={blocks.length}
            selected={selectedId === block.id}
            disabled={disabled}
            dragging={dragId === block.id}
            onSelect={() => onSelect(block.id)}
            onToggle={() => onToggle(block.id)}
            onMove={(to) => onMove(block.id, to)}
            onDuplicate={() => onDuplicate(block.id)}
            onRemove={() => setRemoving(block)}
            onDragStart={() => setDragId(block.id)}
            onDragOver={() => { if (dragId && dragId !== block.id) onMove(dragId, i); }}
            onDragEnd={() => setDragId(null)}
          />
        ))}
      </ul>
      {blocks.length === 0 && <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">The page has no sections yet.</p>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setAdding(true)}
        className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-600 hover:border-violet-400 hover:text-violet-700 disabled:opacity-50"
      >
        <Icon icon="lucide:plus" size={16} /> Add a section
      </button>

      <Modal open={adding} title="Add a section" maxWidth="max-w-2xl" onClose={() => setAdding(false)} x>
        <div className="grid gap-2 sm:grid-cols-2">
          {BLOCKS.map((def) => (
            <button
              key={def.type}
              type="button"
              onClick={() => { onAdd(def.type); setAdding(false); }}
              className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 text-left hover:border-violet-400 hover:bg-violet-50/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><Icon icon={def.icon} size={18} /></span>
              <span>
                <span className="block text-sm font-semibold text-gray-800">{def.label}</span>
                <span className="block text-xs text-gray-500">{def.description}</span>
              </span>
            </button>
          ))}
        </div>
      </Modal>

      <ConfirmModal
        open={!!removing}
        variant="danger"
        title="Delete this section?"
        message={
          <>
            <strong>{removing ? blockTitle(removing) : ""}</strong> and everything written in it will be taken off the page once you save.
            You can hide it instead if you might want it back.
          </>
        }
        confirmText="Delete section"
        cancelText="Keep it"
        onConfirm={() => { if (removing) onRemove(removing.id); setRemoving(null); }}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
