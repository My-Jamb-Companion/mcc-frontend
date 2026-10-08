"use client";

import {useState} from "react";
import {Icon, Modal, showError, showSuccess} from "@mcc/ui";
import {getApiErrorMessage, ApiCra} from "../services/cra.service";
import {useDeactivateCra, useUpdateCra} from "../hooks/useCras";

const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400";

/** Edit a CRA's name and phone. Mounted per CRA (keyed), so it always starts from their current values. */
export function EditCraModal({cra, onClose}: {cra: ApiCra | null; onClose: () => void}) {
  return (
    <Modal open={!!cra} onClose={onClose} title="Update CRA" maxWidth="max-w-md">
      {cra && <EditForm key={cra.cra_id} cra={cra} onClose={onClose} />}
    </Modal>
  );
}

function EditForm({cra, onClose}: {cra: ApiCra; onClose: () => void}) {
  const [fullName, setFullName] = useState(cra.full_name ?? "");
  const [phone, setPhone] = useState(cra.phone ?? "");
  const update = useUpdateCra();

  const save = () =>
    update.mutate(
      {id: cra.cra_id, payload: {full_name: fullName.trim(), phone: phone.trim()}},
      {
        onSuccess: () => { showSuccess("CRA updated."); onClose(); },
        onError: (e) => showError(getApiErrorMessage(e, "Couldn't update this CRA. Please try again.")),
      },
    );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">{cra.email}</p>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cra-name" className="text-sm font-medium text-gray-700">Full name</label>
        <input id="cra-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cra-phone" className="text-sm font-medium text-gray-700">Phone number</label>
        <input id="cra-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
        <button
          type="button" onClick={save} disabled={update.isPending || !fullName.trim()}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {update.isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

/** Switch a CRA off, with the reason that goes in the account history. */
export function DeactivateCraModal({cra, onClose}: {cra: ApiCra | null; onClose: () => void}) {
  return (
    <Modal open={!!cra} onClose={onClose} title="Deactivate CRA" maxWidth="max-w-md">
      {cra && <DeactivateForm key={cra.cra_id} cra={cra} onClose={onClose} />}
    </Modal>
  );
}

function DeactivateForm({cra, onClose}: {cra: ApiCra; onClose: () => void}) {
  const [reason, setReason] = useState("");
  const deactivate = useDeactivateCra();

  const confirm = () =>
    deactivate.mutate(
      {id: cra.cra_id, reason: reason.trim()},
      {
        onSuccess: () => { showSuccess("CRA has been deactivated."); onClose(); },
        onError: (e) => showError(getApiErrorMessage(e, "Couldn't deactivate this CRA. Please try again.")),
      },
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <Icon icon="lucide:alert-triangle" size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">{cra.full_name || cra.email}</span> won&apos;t be able to sign in. Nothing is
          deleted, and you can activate them again whenever you like.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cra-reason" className="text-sm font-medium text-gray-700">Reason (required)</label>
        <textarea
          id="cra-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
          placeholder="Why is this CRA being deactivated?" className={`${inputClass} resize-none`}
        />
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
        <button
          type="button" onClick={confirm} disabled={deactivate.isPending || !reason.trim()}
          className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deactivate.isPending ? "Deactivating…" : "Deactivate"}
        </button>
      </div>
    </div>
  );
}
