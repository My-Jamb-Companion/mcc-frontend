"use client";

import {useMemo, useState} from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {Search} from "lucide-react";
import {Icon, showError, showSuccess} from "@mcc/ui";
import EnhancedTable from "@/src/components/Table";
import {CATALOG_LABELS, CatalogItem, CatalogKind, filterByName} from "../helper/catalog";
import {useCatalog, useUpdateCatalogItem} from "../hooks/useCatalog";
import {getApiErrorMessage} from "../services/catalog.service";
import CatalogItemModal from "./CatalogItemModal";
import CatalogRowMenu from "./CatalogRowMenu";

/** The table, search and create/edit modals for one kind (exam types or subjects). */
export default function CatalogPanel({kind}: {kind: CatalogKind}) {
  const labels = CATALOG_LABELS[kind];
  const {items, isLoading, isError} = useCatalog(kind);
  const update = useUpdateCatalogItem(kind);
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CatalogItem | null>(null);

  const filtered = useMemo(() => filterByName(items, query), [items, query]);

  function toggleActive(item: CatalogItem) {
    const next = !item.is_active;
    update.mutate(
      {id: item.id, payload: {is_active: next}},
      {
        onSuccess: () => showSuccess(`"${item.name}" ${next ? "activated" : "deactivated"}.`),
        onError: (error) =>
          showError(getApiErrorMessage(error, `Couldn't update this ${labels.singular}. Please try again.`)),
      },
    );
  }

  const columns: ColumnDef<CatalogItem>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({getValue}) => <span className="font-semibold text-slate-900">{getValue() as string}</span>,
    },
    {
      accessorKey: "program_count",
      header: "Programs",
      cell: ({getValue}) => <span className="text-slate-600">{getValue() as number}</span>,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({getValue}) => {
        const active = getValue() as boolean;
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    state: {sorting},
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            aria-label={`Search ${labels.plural.toLowerCase()}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#6C2BD9] focus:bg-white focus:ring-1 focus:ring-[#6C2BD9]"
          />
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Icon icon="line-md:plus" size={16} />
          Add {labels.singular}
        </button>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-slate-400">Loading {labels.plural.toLowerCase()}…</p>
      ) : isError ? (
        <p className="py-10 text-center text-sm text-red-600">
          Couldn&apos;t load {labels.plural.toLowerCase()}. Please refresh.
        </p>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          {items.length === 0 ? `No ${labels.plural.toLowerCase()} yet.` : `No ${labels.plural.toLowerCase()} match.`}
        </p>
      ) : (
        <EnhancedTable
          table={table}
          enableRowActions={true}
          renderRowActions={(item) => (
            <CatalogRowMenu item={item} onEdit={() => setEditing(item)} onToggleActive={() => toggleActive(item)} />
          )}
        />
      )}

      {creating && <CatalogItemModal kind={kind} open onClose={() => setCreating(false)} />}
      {editing && <CatalogItemModal kind={kind} item={editing} open onClose={() => setEditing(null)} />}
    </div>
  );
}
