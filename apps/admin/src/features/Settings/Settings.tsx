"use client";

import React, {useState} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import {Search, SlidersHorizontal} from "lucide-react";
import EnhancedTable from "@/src/components/Table";
import {ApiUser} from "./services/users.service";
import {useUsers} from "./hooks/useUsers";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Settings() {
  const {users, isLoading} = useUsers();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = searchQuery.trim()
    ? users.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : users;

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
      accessorKey: "role",
      header: "User Role",
      cell: ({getValue}) => (
        <span className="font-medium text-slate-700 capitalize">
          {getValue() as string}
        </span>
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
    {
      accessorKey: "auth_provider",
      header: "Sign-up method",
      cell: ({getValue}) => (
        <span className="font-medium text-slate-700 capitalize">
          {getValue() as string}
        </span>
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
    <div className="h-full ">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Users</h2>
          </div>

          <div className="flex items-center gap-3">
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

            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              Filter
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-slate-400">Loading users…</p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">No users found.</p>
        ) : (
          <EnhancedTable table={table} enableSelection={true} enableRowActions={true} />
        )}
      </div>
    </div>
  );
}
