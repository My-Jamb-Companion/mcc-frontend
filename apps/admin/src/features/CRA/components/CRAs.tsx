"use client";

import React, {useState} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import {Search} from "lucide-react";
import {Icon, showError, showSuccess} from "@mcc/ui";
import EnhancedTable from "@/src/components/Table";
import {ApiUser, getApiErrorMessage} from "@/src/features/Users/services/users.service";
import {useActivateUser} from "@/src/features/Users/hooks/useUsers";
import UserRowMenu from "@/src/features/Users/components/UserRowMenu";
import UpdateUserModal from "@/src/features/Users/components/UpdateUserModal";
import DeactivateUserModal from "@/src/features/Users/components/DeactivateUserModal";
import {useCras} from "../hooks/useCras";
import CreateCraModal from "./CreateCraModal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function CRAs() {
  const {cras, isLoading} = useCras();
  const activateUser = useActivateUser();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<ApiUser | null>(null);

  const filtered = searchQuery.trim()
    ? cras.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : cras;

  function handleActivate(user: ApiUser) {
    activateUser.mutate(user.user_id, {
      onSuccess: () => showSuccess("CRA has been activated."),
      onError: (error) =>
        showError(getApiErrorMessage(error, "Failed to activate CRA. Please try again.")),
    });
  }

  const columns: ColumnDef<ApiUser>[] = [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({row}) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 uppercase">
              {(user.full_name || user.email).slice(0, 1)}
            </div>
            <div>
              <p className="font-semibold text-slate-900 leading-tight">
                {user.full_name || "—"}
              </p>
              <p className="text-xs text-slate-400 lowercase">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({getValue}) => (
        <span className="text-slate-500">{(getValue() as string | null) || "—"}</span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      enableSorting: true,
      cell: ({getValue}) => {
        const isActive = getValue() as boolean;
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              isActive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`}
            />
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Date Created",
      cell: ({getValue}) => (
        <span className="text-slate-500">{formatDate(getValue() as string)}</span>
      ),
    },
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">CRAs</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Icon icon="line-md:plus" size={16} />
          Create CRA
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">All CRAs</h2>
          </div>

          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#6C2BD9] focus:bg-white focus:ring-1 focus:ring-[#6C2BD9]"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-400">Loading CRAs…</p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            {cras.length === 0 ? "No CRAs yet." : "No CRAs found."}
          </p>
        ) : (
          <EnhancedTable
            table={table}
            enableSelection={true}
            enableRowActions={true}
            renderRowActions={(user) => (
              <UserRowMenu
                user={user}
                onEdit={() => setEditingUser(user)}
                onDeactivate={() => setDeactivatingUser(user)}
                onActivate={() => handleActivate(user)}
              />
            )}
          />
        )}
      </div>

      <CreateCraModal open={creating} onClose={() => setCreating(false)} />
      <UpdateUserModal user={editingUser} onClose={() => setEditingUser(null)} />
      <DeactivateUserModal user={deactivatingUser} onClose={() => setDeactivatingUser(null)} />
    </div>
  );
}
