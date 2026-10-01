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
import {useCategories, useUpdateCategory} from "../hooks/useCategories";
import {ApiCategory, getApiErrorMessage} from "../services/category.service";
import CategoryRowMenu from "./CategoryRowMenu";
import CreateCategoryModal from "./CreateCategoryModal";
import EditCategoryModal from "./EditCategoryModal";

export default function Categories() {
  const {categories, isLoading} = useCategories();
  const updateCategory = useUpdateCategory();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);

  const filtered = searchQuery.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : categories;

  function handleActivate(category: ApiCategory) {
    updateCategory.mutate(
      {categoryId: category.category_id, payload: {is_active: true}},
      {
        onSuccess: () => showSuccess(`"${category.name}" has been activated.`),
        onError: (error) =>
          showError(getApiErrorMessage(error, "Failed to activate category. Please try again.")),
      },
    );
  }

  function handleDeactivate(category: ApiCategory) {
    updateCategory.mutate(
      {categoryId: category.category_id, payload: {is_active: false}},
      {
        onSuccess: () => showSuccess(`"${category.name}" has been deactivated.`),
        onError: (error) =>
          showError(getApiErrorMessage(error, "Failed to deactivate category. Please try again.")),
      },
    );
  }

  const columns: ColumnDef<ApiCategory>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({getValue}) => (
        <span className="font-semibold text-slate-900">{getValue() as string}</span>
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
              isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
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
    <div className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Icon icon="line-md:plus" size={16} />
          Create Category
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">All Categories</h2>
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
          <p className="py-10 text-center text-sm text-slate-400">Loading categories…</p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            {categories.length === 0 ? "No categories yet." : "No categories found."}
          </p>
        ) : (
          <EnhancedTable
            table={table}
            enableRowActions={true}
            renderRowActions={(category) => (
              <CategoryRowMenu
                category={category}
                onEdit={() => setEditingCategory(category)}
                onDeactivate={() => handleDeactivate(category)}
                onActivate={() => handleActivate(category)}
              />
            )}
          />
        )}
      </div>

      <CreateCategoryModal open={creating} onClose={() => setCreating(false)} />
      <EditCategoryModal category={editingCategory} onClose={() => setEditingCategory(null)} />
    </div>
  );
}
