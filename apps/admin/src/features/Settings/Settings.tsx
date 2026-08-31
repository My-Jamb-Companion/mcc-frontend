"use client";

import React, {useState} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import {Plus, Search, SlidersHorizontal} from "lucide-react";
import EnhancedTable from "@/src/components/Table";
import {Button} from "@mcc/ui";
import AddUserModal from "./AddUser";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  status: "Active" | "Inactive";
  addDate: string;
  lastActive: string;
  hasAccess: boolean;
}

const initialData: User[] = [
  {
    id: "1",
    name: "Bright Mba",
    email: "bright@gmail.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bright1",
    role: "Admin",
    status: "Active",
    addDate: "March 31, 2026",
    lastActive: "March 31, 2026",
    hasAccess: false,
  },
  {
    id: "2",
    name: "Bright Mba",
    email: "bright@gmail.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bright2",
    role: "Admin",
    status: "Active",
    addDate: "March 31, 2026",
    lastActive: "March 31, 2026",
    hasAccess: false,
  },
  {
    id: "3",
    name: "Bright Mba",
    email: "bright@gmail.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bright3",
    role: "Admin",
    status: "Active",
    addDate: "March 31, 2026",
    lastActive: "March 31, 2026",
    hasAccess: false,
  },
];

export default function Settings() {
  const [data, setData] = useState<User[]>(initialData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addUser, setAddUser] = useState(false);

  const toggleAccess = (id: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? {...item, hasAccess: !item.hasAccess} : item,
      ),
    );
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({row}) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-9 w-9 rounded-full bg-slate-100 object-cover"
            />
            <div>
              <p className="font-semibold text-slate-900 leading-tight">
                {user.name}
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
        <span className="font-medium text-slate-700">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({getValue}) => {
        const status = getValue() as string;
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "addDate",
      header: "Date Created",
      cell: ({getValue}) => (
        <span className="text-slate-500">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "lastActive",
      header: "Last Active",
      cell: ({getValue}) => (
        <span className="font-semibold text-slate-700">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "hasAccess",
      header: "Access",
      cell: ({row}) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleAccess(row.original.id);
          }}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            row.original.hasAccess ? "bg-[#6C2BD9]" : "bg-slate-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              row.original.hasAccess ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data,
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
        <Button
          radius={"full"}
          leftIcon={<Plus />}
          onClick={() => setAddUser(true)}
        >
          Add user
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              User &amp; Permission
            </h2>
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

        <EnhancedTable
          table={table}
          enableSelection={true}
          enableRowActions={true}
        />
      </div>
      {addUser && (
        <AddUserModal isOpen={addUser} onClose={() => setAddUser(false)} />
      )}
    </div>
  );
}
