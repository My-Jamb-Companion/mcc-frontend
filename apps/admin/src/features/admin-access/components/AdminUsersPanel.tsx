"use client";

import {useState} from "react";
import {Icon, showError, showSuccess} from "@mcc/ui";
import {summarizeAccess} from "../helper/access";
import {useAdmins, useMyAccess, useResendAdminInvite, useUpdateAdmin} from "../hooks/useAdminAccess";
import {ApiAdmin, getApiErrorMessage} from "../services/adminAccess.service";
import AdminAccessModal from "./AdminAccessModal";

/** The Users page's "Admin users" tab: who can sign in to this console, and what each of them can use. */
export default function AdminUsersPanel() {
  const admins = useAdmins();
  const me = useMyAccess();
  const update = useUpdateAdmin();
  const resend = useResendAdminInvite();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ApiAdmin | null>(null);

  const rows = admins.data ?? [];

  function setActive(admin: ApiAdmin, active: boolean) {
    update.mutate(
      {userId: admin.user_id, input: {is_active: active}},
      {
        onSuccess: () => showSuccess(active ? `${admin.full_name || admin.email} can sign in again.` : `${admin.full_name || admin.email} has been deactivated and is signed out of the console.`),
        onError: (error) => showError(getApiErrorMessage(error, "Couldn't update the admin. Please try again.")),
      },
    );
  }

  function resendInvite(admin: ApiAdmin) {
    resend.mutate(admin.user_id, {
      onSuccess: (r) => (r.invite_sent ? showSuccess("Invite sent.") : showError("The email couldn't be sent.")),
      onError: (error) => showError(getApiErrorMessage(error, "Couldn't send the invite. Please try again.")),
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Admin users</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            People who can sign in to this console. A <b>super admin</b> can do everything; everyone else can only use the
            areas you choose, either to view or to manage.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Icon icon="line-md:plus" size={16} />
          Create admin
        </button>
      </div>

      {admins.isLoading ? (
        <p className="py-10 text-center text-sm text-slate-400">Loading admins…</p>
      ) : admins.isError ? (
        <p className="py-10 text-center text-sm text-red-500">Couldn&apos;t load the admins. Please try again.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4 font-medium">Admin</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Can use</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const itsMe = a.user_id === me.data?.user_id;
                return (
                  <tr key={a.user_id} className="border-b border-slate-50 align-top">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-slate-900">
                        {a.full_name || "—"} {itsMe && <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">You</span>}
                      </p>
                      <p className="text-xs text-slate-400">{a.email}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${a.level === "super" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-700"}`}>
                        {a.preset_label}
                      </span>
                    </td>
                    <td className="max-w-xs py-3 pr-4 text-xs text-slate-600">{summarizeAccess(a.permissions, a.level === "super")}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${a.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${a.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {a.is_active ? (a.email_verified ? "Active" : "Invited") : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        {!itsMe && (
                          <button type="button" onClick={() => setEditing(a)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100">
                            Edit access
                          </button>
                        )}
                        {a.is_active && !a.email_verified && (
                          <button type="button" onClick={() => resendInvite(a)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100">
                            Resend invite
                          </button>
                        )}
                        {!itsMe && (
                          <button
                            type="button"
                            onClick={() => setActive(a, !a.is_active)}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${a.is_active ? "text-red-600 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                          >
                            {a.is_active ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminAccessModal open={creating || !!editing} existing={editing} onClose={() => (setCreating(false), setEditing(null))} />
    </div>
  );
}
