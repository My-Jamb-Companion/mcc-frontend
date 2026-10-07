"use client";

import {useState} from "react";
import {Icon, ConfirmModal} from "@mcc/ui";
import {isSafeHref, moveItem, str} from "@mcc/landing-content";
import type {Field, FieldData, ListField, StringsField} from "@mcc/landing-content";
import {emptyItem} from "../helper/editor";
import ImageField from "./ImageField";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-400 disabled:bg-gray-50 disabled:text-gray-500";

function Label({htmlFor, children, help}: {htmlFor?: string; children: React.ReactNode; help?: string}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">{children}</label>
      {help && <span className="text-xs text-gray-400">{help}</span>}
    </div>
  );
}

function IconButton({label, icon, onClick, disabled, danger}: {label: string; icon: string; onClick: () => void; disabled?: boolean; danger?: boolean}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-7 w-7 items-center justify-center rounded-md ${danger ? "text-gray-400 hover:bg-red-50 hover:text-red-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"} disabled:opacity-30 disabled:hover:bg-transparent`}
    >
      <Icon icon={icon} size={15} />
    </button>
  );
}

function StringsEditor({field, value, onChange, disabled}: {field: StringsField; value: string[]; onChange: (v: string[]) => void; disabled?: boolean}) {
  const max = field.max ?? 12;
  return (
    <div className="flex flex-col gap-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <input
            aria-label={`${field.itemLabel} ${i + 1}`}
            value={item}
            disabled={disabled}
            maxLength={120}
            onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
            className={inputClass}
          />
          <IconButton label="Move up" icon="lucide:chevron-up" disabled={disabled || i === 0} onClick={() => onChange(moveItem(value, i, i - 1))} />
          <IconButton label="Move down" icon="lucide:chevron-down" disabled={disabled || i === value.length - 1} onClick={() => onChange(moveItem(value, i, i + 1))} />
          <IconButton label={`Remove ${field.itemLabel.toLowerCase()} ${i + 1}`} icon="lucide:x" danger disabled={disabled} onClick={() => onChange(value.filter((_, j) => j !== i))} />
        </div>
      ))}
      <button
        type="button"
        disabled={disabled || value.length >= max}
        onClick={() => onChange([...value, ""])}
        className="flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-violet-400 hover:text-violet-700 disabled:opacity-50"
      >
        <Icon icon="lucide:plus" size={14} /> Add {field.itemLabel.toLowerCase()}
      </button>
    </div>
  );
}

function ListEditor({field, value, onChange, disabled}: {field: ListField; value: FieldData[]; onChange: (v: FieldData[]) => void; disabled?: boolean}) {
  const [open, setOpen] = useState<number | null>(value.length === 1 ? 0 : null);
  const [removing, setRemoving] = useState<number | null>(null);
  const max = field.max ?? 20;

  const update = (i: number, next: FieldData) => onChange(value.map((v, j) => (j === i ? next : v)));
  const move = (i: number, to: number) => {
    onChange(moveItem(value, i, to));
    setOpen(open === i ? to : open);
  };

  return (
    <div className="flex flex-col gap-2">
      {value.length === 0 && <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">Nothing here yet.</p>}
      {value.map((item, i) => {
        const isOpen = open === i;
        const title = str(item, field.titleKey).trim();
        return (
          <div key={i} className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-1 pr-2">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left"
              >
                <Icon icon={isOpen ? "lucide:chevron-down" : "lucide:chevron-right"} size={15} className="shrink-0 text-gray-400" />
                <span className="truncate text-sm font-medium text-gray-800">{title || `${field.itemLabel} ${i + 1}`}</span>
              </button>
              <IconButton label="Move up" icon="lucide:chevron-up" disabled={disabled || i === 0} onClick={() => move(i, i - 1)} />
              <IconButton label="Move down" icon="lucide:chevron-down" disabled={disabled || i === value.length - 1} onClick={() => move(i, i + 1)} />
              <IconButton label={`Remove ${field.itemLabel.toLowerCase()}`} icon="lucide:trash-2" danger disabled={disabled} onClick={() => setRemoving(i)} />
            </div>
            {isOpen && (
              <div className="border-t border-gray-100 p-3">
                <FieldForm fields={field.fields} data={item} onChange={(next) => update(i, next)} disabled={disabled} idPrefix={`${field.key}-${i}`} />
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        disabled={disabled || value.length >= max}
        onClick={() => {
          onChange([...value, emptyItem(field.fields)]);
          setOpen(value.length);
        }}
        className="flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-violet-400 hover:text-violet-700 disabled:opacity-50"
      >
        <Icon icon="lucide:plus" size={14} /> Add {field.itemLabel.toLowerCase()}
      </button>

      <ConfirmModal
        open={removing !== null}
        variant="danger"
        title={`Remove this ${field.itemLabel.toLowerCase()}?`}
        message={
          <>
            <strong className="break-words">{removing !== null ? str(value[removing] ?? {}, field.titleKey) || `${field.itemLabel} ${removing + 1}` : ""}</strong>{" "}
            will be taken out of the page once you save.
          </>
        }
        confirmText="Remove"
        cancelText="Keep it"
        onConfirm={() => {
          if (removing !== null) {
            onChange(value.filter((_, j) => j !== removing));
            setOpen(null);
          }
          setRemoving(null);
        }}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}

/** One editable field, drawn by its kind. */
function FieldControl({field, data, onChange, disabled, id}: {field: Field; data: FieldData; onChange: (next: FieldData) => void; disabled?: boolean; id: string}) {
  const set = (value: unknown) => onChange({...data, [field.key]: value});
  const raw = data[field.key];

  switch (field.kind) {
    case "text":
    case "textarea": {
      const value = typeof raw === "string" ? raw : "";
      const Tag = field.kind === "textarea" ? "textarea" : "input";
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id} help={field.help}>{field.label}</Label>
          <Tag
            id={id}
            value={value}
            disabled={disabled}
            maxLength={field.maxLength}
            rows={field.kind === "textarea" ? 3 : undefined}
            onChange={(e) => set(e.target.value)}
            className={`${inputClass} ${field.kind === "textarea" ? "resize-y" : ""}`}
          />
        </div>
      );
    }
    case "url": {
      const value = typeof raw === "string" ? raw : "";
      const bad = !isSafeHref(value);
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id} help={field.help}>{field.label}</Label>
          <input
            id={id}
            value={value}
            disabled={disabled}
            placeholder="https://… or /page or #section"
            aria-invalid={bad}
            onChange={(e) => set(e.target.value)}
            className={`${inputClass} ${bad ? "border-red-300 focus:border-red-400" : ""}`}
          />
          {bad && <p role="alert" className="text-xs text-red-600">Links must start with https://, http://, mailto:, tel:, # or /.</p>}
        </div>
      );
    }
    case "image":
      return <ImageField label={field.label} help={field.help} value={typeof raw === "string" ? raw : ""} onChange={set} disabled={disabled} />;
    case "toggle":
      return (
        <label className="flex cursor-pointer items-start gap-2.5">
          <input type="checkbox" checked={raw === true} disabled={disabled} onChange={(e) => set(e.target.checked)} className="mt-0.5 h-4 w-4 accent-violet-600" />
          <span className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">{field.label}</span>
            {field.help && <span className="text-xs text-gray-400">{field.help}</span>}
          </span>
        </label>
      );
    case "select":
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id} help={field.help}>{field.label}</Label>
          <select id={id} value={typeof raw === "string" ? raw : ""} disabled={disabled} onChange={(e) => set(e.target.value)} className={inputClass}>
            {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );
    case "strings":
      return (
        <div className="flex flex-col gap-1.5">
          <Label help={field.help}>{field.label}</Label>
          <StringsEditor field={field} value={Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string") : []} onChange={set} disabled={disabled} />
        </div>
      );
    case "list":
      return (
        <div className="flex flex-col gap-1.5">
          <Label help={field.help}>{field.label}</Label>
          <ListEditor
            field={field}
            value={Array.isArray(raw) ? raw.filter((v): v is FieldData => !!v && typeof v === "object" && !Array.isArray(v)) : []}
            onChange={set}
            disabled={disabled}
          />
        </div>
      );
  }
}

/** A form built from a block's (or the site's) field definitions. Edits are passed up whole, never applied in place. */
export default function FieldForm({fields, data, onChange, disabled, idPrefix = "f"}: {
  fields: Field[]; data: FieldData; onChange: (next: FieldData) => void; disabled?: boolean; idPrefix?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {fields.map((field) => (
        <FieldControl key={field.key} field={field} data={data} onChange={onChange} disabled={disabled} id={`${idPrefix}-${field.key}`} />
      ))}
    </div>
  );
}
