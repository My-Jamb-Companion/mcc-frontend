"use client";

import EnhancedTable from "@/src/components/Table";
import {Icon} from "@mcc/ui";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

export type studiodata = {
  id: number;
  avatar: string;
  name: string;
  email: string;
  conversation: string;
  date: string;
  tool: string;
  quality: "excellent" | "average" | "poor";
};

export default function StudioTable({
  data,
  active,
}: {
  data: studiodata[];
  active: string;
}) {
  const columns: ColumnDef<studiodata>[] = [
    {
      accessorKey: "name",
      header: `Name of ${active == "teacher" ? "teacher" : "student"}`,
      cell: ({row}) => {
        const data = row.original;

        return (
          <div className="flex items-center gap-3">
            <img
              src={data.avatar}
              className="h-11 w-11 rounded-full object-cover border border-muted"
            />

            <div>
              <p className="font-medium text-xs">{data.name}</p>
              <p className="text-[10px] text-subtle">{data.email}</p>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "conversation",
      header: "Conversation",
      cell: ({row}) => {
        const data = row.original;

        return (
          <div className="flex items-center gap-3 truncate text-xs text-subtle">
            <Icon icon="ri:bard-fill" size={12} />
            {data.conversation}
          </div>
        );
      },
    },

    {
      accessorKey: "date",
      header: "Date",
      cell: ({row}) => (
        <div className="text-xs text-subtle">{row.original.date}</div>
      ),
    },

    {
      accessorKey: "tool",
      header: "AI tool",
      cell: ({row}) => (
        <div className="inline-flex items-center gap-2 rounded-full text-xs bg-gray-100 px-3 py-1">
          <Icon icon="material-symbols:folder-open-outline-sharp" size={12} />
          {row.original.tool}
        </div>
      ),
    },

    {
      accessorKey: "quality",
      header: "Quality",
      cell: ({row}) => <StatusBadge status={row.original.quality} />,
    },
  ];
  //   return <DataTable columns={columns} data={data} />;
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <EnhancedTable table={table} className="min-w-full" isLoading={false} />
  );
}

const colors = {
  excellent: "bg-green-100 text-green-700",
  average: "bg-orange-100 text-orange-700",
  poor: "bg-red-100 text-red-700",
};

export function StatusBadge({status}: {status: keyof typeof colors}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
        colors[status]
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {status[0].toUpperCase() + status.slice(1)}
    </span>
  );
}
