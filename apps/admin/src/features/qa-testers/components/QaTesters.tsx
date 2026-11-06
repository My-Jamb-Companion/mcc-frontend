"use client";

import {useState} from "react";
import {ConfirmModal, Icon, showError, showSuccess} from "@mcc/ui";
import {
  useDeleteQaTester,
  useQaTesters,
  useSendQaTesterCode,
  useSetQaTesterActive,
} from "../hooks/useQaTesters";
import {getApiErrorMessage, QaTester} from "../services/qaTesters.service";
import CreateQaTesterModal from "./CreateQaTesterModal";

export const formatWhen = (iso: string | null): string => {
  if (!iso) return "Never";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "Never" : d.toLocaleDateString(undefined, {day: "numeric", month: "short", year: "numeric"});
};

export default function QaTesters() {
  const [search, setSearch] = useState("");
  const {data, isLoading, isError, error} = useQaTesters(search);
  const setActive = useSetQaTesterActive();
  const sendCode = useSendQaTesterCode();
  const remove = useDeleteQaTester();
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<QaTester | null>(null);
  const items = data?.items ?? [];

  const toggle = (t: QaTester) =>
    setActive.mutate(
      {userId: t.user_id, isActive: !t.is_active},
      {
        onSuccess: () => showSuccess(`${t.full_name ?? t.email} is now ${t.is_active ? "switched off" : "active"}.`),
        onError: (e) => showError(getApiErrorMessage(e, "Couldn't update the tester.")),
      },
    );

  const code = (t: QaTester) =>
    sendCode.mutate(t.user_id, {
      onSuccess: () => showSuccess(`Sign-in code sent to ${t.email}.`),
      onError: (e) => showError(getApiErrorMessage(e, "Couldn't send the code. Try again in a while.")),
    });

  const confirmRemove = () => {
    if (!removing) return;
    const t = removing;
    remove.mutate(t.user_id, {
      onSuccess: () => {
        showSuccess(`${t.full_name ?? t.email} was removed.`);
        setRemoving(null);
      },
      onError: (e) => {
        showError(getApiErrorMessage(e, "Couldn't remove the tester."));
        setRemoving(null);
      },
    });
  };

  return (
    <div className="h-full">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">QA testers</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Real student accounts for checking courses and exams. They enrol for free, earn nothing, are left out of
            every company number, and their community posts stay hidden from learners.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Icon icon="line-md:plus" size={16} />
          Add tester
        </button>
      </div>

      <div className="rounded-xl border border-muted/20 p-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          aria-label="Search QA testers"
          className="mb-5 w-full max-w-sm rounded-full border border-muted/30 bg-transparent px-4 py-2 text-sm outline-none focus:border-violet-400"
        />

        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted">Loading testers…</p>
        ) : isError ? (
          <p className="py-10 text-center text-sm text-red-600">
            {getApiErrorMessage(error, "Couldn't load QA testers. Only super admins can open this page.")}
          </p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            {search.trim() ? "No testers match that search." : "No QA testers yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase text-muted">
                <tr>
                  <th className="pb-3 font-medium">Tester</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Enrolled</th>
                  <th className="pb-3 font-medium">Last login</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/10">
                {items.map((t) => (
                  <tr key={t.user_id}>
                    <td className="py-3 pr-4">
                      <p className="font-semibold">{t.full_name ?? "—"}</p>
                      <p className="text-xs text-muted">{t.email}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          t.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${t.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {t.is_active ? "Active" : "Off"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{t.enrolments}</td>
                    <td className="py-3 pr-4 text-muted">{formatWhen(t.last_login_at)}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => code(t)} disabled={sendCode.isPending} className="rounded-lg border border-muted/30 px-3 py-1.5 text-xs font-medium hover:bg-muted/10 disabled:opacity-50">
                          Send sign-in code
                        </button>
                        <button type="button" onClick={() => toggle(t)} disabled={setActive.isPending} className="rounded-lg border border-muted/30 px-3 py-1.5 text-xs font-medium hover:bg-muted/10 disabled:opacity-50">
                          {t.is_active ? "Switch off" : "Switch on"}
                        </button>
                        <button type="button" onClick={() => setRemoving(t)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/10">
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateQaTesterModal open={creating} onClose={() => setCreating(false)} />
      <ConfirmModal
        open={!!removing}
        variant="danger"
        title="Remove this QA tester?"
        message={`This removes ${removing?.full_name ?? removing?.email ?? "the tester"} and everything they did: progress, certificates, posts and wallet. It can't be undone.`}
        confirmText="Remove"
        onConfirm={confirmRemove}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
