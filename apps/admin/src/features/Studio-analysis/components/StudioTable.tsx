"use client";

import EnhancedTable from "@/src/components/Table";
import {Icon} from "@mcc/ui";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {ApiConversationItem} from "../services/ai-studio.service";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function StudioTable({
  data,
  isLoading,
  onRowClick,
}: {
  data: ApiConversationItem[];
  isLoading: boolean;
  onRowClick: (item: ApiConversationItem) => void;
}) {
  const columns: ColumnDef<ApiConversationItem>[] = [
    {
      accessorKey: "full_name",
      header: "Name of student",
      cell: ({row}) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <img
              src={
                item.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.email)}`
              }
              alt={item.full_name}
              className="h-11 w-11 rounded-full object-cover border border-muted"
            />
            <div>
              <p className="font-medium text-xs">{item.full_name}</p>
              <p className="text-[10px] text-subtle">{item.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Conversation",
      cell: ({row}) => (
        <div className="flex items-center gap-3 truncate text-xs text-subtle max-w-75">
          <Icon icon="ri:bard-fill" size={12} className="shrink-0" />
          <span className="truncate">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: "last_message_at",
      header: "Date",
      cell: ({row}) => (
        <div className="text-xs text-subtle whitespace-nowrap">
          {formatDate(row.original.last_message_at)}
        </div>
      ),
    },
    {
      accessorKey: "message_count",
      header: "Messages",
      cell: ({row}) => (
        <div className="text-xs font-medium text-gray-700">
          {row.original.message_count}
        </div>
      ),
    },
    {
      id: "tool",
      header: "AI tool",
      cell: () => (
        <div className="inline-flex items-center gap-2 rounded-full text-xs bg-gray-100 px-3 py-1 whitespace-nowrap">
          <Icon icon="material-symbols:folder-open-outline-sharp" size={12} />
          Brainy AI
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <EnhancedTable
      table={table}
      className="min-w-full"
      isLoading={isLoading}
      enableRowActions
      onRowAction={onRowClick}
    />
  );
}
