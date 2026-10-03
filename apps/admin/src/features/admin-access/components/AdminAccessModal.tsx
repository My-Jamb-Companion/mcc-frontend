"use client";

import {useState} from "react";
import {Modal, showError, showSuccess} from "@mcc/ui";
import {
  AccessLevel,
  hasValidAccess,
  PermissionMap,
  permissionsForPreset,
  presetFor,
  toApiPermissions,
} from "../helper/access";
import {useAccessCatalog, useCreateAdmin, useUpdateAdmin} from "../hooks/useAdminAccess";
import {AccessCatalog, ApiAdmin, getApiErrorMessage} from "../services/adminAccess.service";

const field = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-400 disabled:bg-gray-50 disabled:text-gray-500";
const LEVELS: {value: AccessLevel; label: string}[] = [
  {value: "none", label: "No access"},
  {value: "view", label: "View"},
  {value: "manage", label: "Manage"},
];

function Form({catalog, existing, onClose}: {catalog: AccessCatalog; existing: ApiAdmin | null; onClose: () => void}) {
  const create = useCreateAdmin();
  const update = useUpdateAdmin();
  const [fullName, setFullName] = useState(existing?.full_name ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [phone, setPhone] = useState(existing?.phone_number ?? "");
  const [preset, setPreset] = useState(existing?.preset ?? "course_developer");
  const [permissions, setPermissions] = useState<PermissionMap>(() =>
    existing ? (existing.level === "super" ? {} : {...existing.permissions}) : permissionsForPreset("course_developer", catalog.presets),
  );

  const isSuper = preset === "super_admin";
  const emailOk = !!existing || /^\S+@\S+\.\S+$/.test(email.trim());
  const canSave = !!fullName.trim() && emailOk && hasValidAccess(preset, permissions);
  const busy = create.isPending || update.isPending;
  const groups = Array.from(new Set(catalog.areas.map((a) => a.group)));

  function choosePreset(key: string) {
    setPreset(key);
    setPermissions(permissionsForPreset(key, catalog.presets));
  }

  function setLevel(area: string, level: AccessLevel) {
    const next = {...permissions, [area]: level};
    setPermissions(next);
    // A hand-made set that happens to match a template is that template.
    setPreset(presetFor(next, catalog.presets));
  }

  function save() {
    const access = {preset, permissions: isSuper ? {} : toApiPermissions(permissions)};
    const onError = (error: unknown) => showError(getApiErrorMessage(error, "Couldn't save the admin. Please try again."));

    if (existing) {
      update.mutate(
        {userId: existing.user_id, input: {full_name: fullName.trim(), phone_number: phone.trim() || undefined, ...access}},
        {onSuccess: () => { showSuccess("Admin updated. Their new access applies straight away."); onClose(); }, onError},
      );
    } else {
      create.mutate(
        {full_name: fullName.trim(), email: email.trim(), phone_number: phone.trim() || undefined, ...access},
        {
          onSuccess: (admin) => {
            showSuccess(
              admin.invite_sent
                ? `${admin.full_name} was added. We emailed them a code to set a password.`
                : `${admin.full_name} was added. The email couldn't be sent: ask them to use Forgot password on the login page.`,
            );
            onClose();
          },
          onError,
        },
      );
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Ada Obi" className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!existing} placeholder="name@company.com" type="email" className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
          Phone (optional)
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-gray-800">Role</p>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Role">
          {catalog.presets.map((p) => (
            <button
              type="button"
              key={p.key}
              role="radio"
              aria-checked={preset === p.key}
              onClick={() => choosePreset(p.key)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                preset === p.key ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-violet-300"
              }`}
            >
              <span className="block text-sm font-semibold text-gray-900">{p.label}</span>
              <span className="mt-0.5 block text-xs text-gray-500">{p.description}</span>
            </button>
          ))}
          <div
            className={`rounded-xl border px-4 py-3 ${preset === "custom" ? "border-violet-500 bg-violet-50" : "border-dashed border-gray-200"}`}
            aria-current={preset === "custom"}
          >
            <span className="block text-sm font-semibold text-gray-900">Custom access{preset === "custom" ? " (selected)" : ""}</span>
            <span className="mt-0.5 block text-xs text-gray-500">Pick any combination below; it becomes custom once it differs from a role.</span>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-gray-800">What they can use</p>
        {isSuper ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            A super admin can use everything, including creating and managing other admins. Only give this to people you
            fully trust.
          </p>
        ) : (
          <>
            <p className="mb-3 text-xs text-gray-500">
              <b>View</b> lets them look but not change anything. <b>Manage</b> lets them create, edit and delete.
            </p>
            <div className="max-h-[38vh] overflow-y-auto rounded-xl border border-gray-100">
              {groups.map((group) => (
                <div key={group}>
                  <p className="bg-gray-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{group}</p>
                  {catalog.areas
                    .filter((a) => a.group === group)
                    .map((area) => {
                      const current = permissions[area.key] ?? "none";
                      return (
                        <div key={area.key} className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-4 py-2.5">
                          <div className="min-w-0 flex-1 basis-56">
                            <p className="text-sm font-medium text-gray-900">{area.label}</p>
                            <p className="text-xs text-gray-500">{area.description}</p>
                          </div>
                          <div role="radiogroup" aria-label={`${area.label} access`} className="inline-flex overflow-hidden rounded-lg border border-gray-200 text-xs font-medium">
                            {LEVELS.map((l) => (
                              <button
                                type="button"
                                key={l.value}
                                role="radio"
                                aria-checked={current === l.value}
                                onClick={() => setLevel(area.key, l.value)}
                                className={`px-3 py-1.5 transition-colors ${
                                  current === l.value
                                    ? l.value === "manage" ? "bg-violet-600 text-white" : l.value === "view" ? "bg-violet-100 text-violet-800" : "bg-gray-100 text-gray-700"
                                    : "bg-white text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {l.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </>
        )}
        {!hasValidAccess(preset, permissions) && <p className="mt-2 text-xs text-amber-700">Choose at least one area.</p>}
      </div>

      {!existing && (
        <p className="text-xs text-gray-500">
          They get no password from you. We email them a code to set their own; they can also use Forgot password on the login page.
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy || !canSave}
          className="whitespace-nowrap rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Saving..." : existing ? "Save access" : "Create admin"}
        </button>
      </div>
    </div>
  );
}

/** Create an admin and choose what they can use, or change an existing admin's access. */
export default function AdminAccessModal({
  open,
  existing,
  onClose,
}: {
  open: boolean;
  existing: ApiAdmin | null;
  onClose: () => void;
}) {
  const catalog = useAccessCatalog(open);
  return (
    <Modal open={open} title={existing ? `Edit access: ${existing.full_name || existing.email}` : "Create an admin"} maxWidth="max-w-3xl">
      {open && catalog.data && <Form key={existing?.user_id ?? "new"} catalog={catalog.data} existing={existing} onClose={onClose} />}
      {open && catalog.isLoading && <p className="py-8 text-center text-sm text-gray-400">Loading…</p>}
      {open && catalog.isError && <p className="py-8 text-center text-sm text-red-500">Couldn&apos;t load the access options. Please try again.</p>}
    </Modal>
  );
}
