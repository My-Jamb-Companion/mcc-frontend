import {useState, ReactNode} from "react";
import {Table, RowData, flexRender} from "@tanstack/react-table";
import {ChevronDown, ChevronUp, MoreVertical} from "lucide-react";

interface EnhancedTableProps<TData extends RowData> {
  table: Table<TData>;
  className?: string;
  selectionFn?: () => void;
  selectionFnText?: string;
  enableSelection?: boolean;
  enableRowActions?: boolean;
  rowActions?: ReactNode;
  onRowAction?: (row: TData) => void;
  onRowClick?: (row: TData) => void;
  handleLoadMore?: () => void;
  hasMore?: boolean;
  isAdminPeopleCard?: boolean;
  lastEvaluated?: unknown;
  isLoading?: boolean;
}

export default function EnhancedTable<TData extends RowData>({
  table,
  className = "",
  selectionFn,
  selectionFnText,
  enableSelection = false,
  enableRowActions = false,
  rowActions = null,
  onRowAction,
  onRowClick,
  handleLoadMore,
  hasMore = false,
  isAdminPeopleCard = false,
  lastEvaluated,
  isLoading = false,
}: EnhancedTableProps<TData>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(table.getRowModel().rows.map((row) => row.id));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowId: string) => {
    const newSelected = new Set(selectedRows);

    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }

    setSelectedRows(newSelected);
  };

  const totalRows = table.getRowModel().rows.length;
  const selectedCount = selectedRows.size;

  return (
    <div className="flex h-full flex-col">
      <div className="bg-gray-50 rounded-t-xl">
        {enableSelection && selectedCount > 0 && (
          <div className="mt-3 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm text-blue-700 font-medium">
              {selectedCount} of {totalRows} selected
            </span>

            <button
              onClick={() =>
                selectionFn ? selectionFn() : setSelectedRows(new Set())
              }
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectionFnText ?? "Clear selection"}
            </button>
          </div>
        )}
      </div>

      {totalRows !== 0 && (
        <div className="flex flex-col min-h-0">
          <div className="overflow-auto h-full  custom-scrollbar">
            <table className={`${className} w-full text-textPrimary`}>
              <thead className="sticky top-0 z-10 bg-white shadow-xs">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-200">
                    {enableSelection && (
                      <th className="p-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedCount === totalRows && totalRows > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}

                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left text-xs font-semibold p-4 text-gray-700 uppercase tracking-wider max-w-[300px]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </span>

                          {header.column.getCanSort() && (
                            <button
                              onClick={header.column.getToggleSortingHandler()}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp
                                  size={16}
                                  className="text-blue-600"
                                />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown
                                  size={16}
                                  className="text-blue-600"
                                />
                              ) : (
                                <ChevronDown
                                  size={16}
                                  className="text-gray-400"
                                />
                              )}
                            </button>
                          )}
                        </div>
                      </th>
                    ))}

                    {enableRowActions && <th className="p-4 w-12" />}
                  </tr>
                ))}
              </thead>

              <tbody>
                {isLoading
                  ? Array.from({length: 8}).map((_, i) => (
                      <SkeletonRow
                        key={i}
                        columns={table.getAllColumns().length}
                        enableSelection={enableSelection}
                        enableRowActions={enableRowActions}
                      />
                    ))
                  : table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => onRowClick?.(row.original)}
                        className={`border-b border-gray-100 transition relative hover:bg-gray-100 ${
                          selectedRows.has(row.id) ? "bg-blue-50" : ""
                        } ${onRowClick ? "cursor-pointer" : ""}`}
                      >
                        {enableSelection && (
                          <td
                            className="p-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selectedRows.has(row.id)}
                              onChange={() => handleSelectRow(row.id)}
                            />
                          </td>
                        )}

                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="text-sm py-4 px-4 max-w-[300px]"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}

                        {enableRowActions && (
                          <td
                            className="p-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => onRowAction?.(row.original)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              {rowActions ?? <MoreVertical size={18} />}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2 ">
            <div className="flex max-sm:flex-col lg:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{totalRows}</span>{" "}
                results
              </div>

              <div className="flex items-center gap-3">
                {!isAdminPeopleCard && hasMore && (
                  <button
                    className={`border border-gray-300 rounded-lg px-6 py-3 text-textPrimary font-medium
                    ${
                      lastEvaluated === null
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                    ${!hasMore ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => handleLoadMore?.()}
                    disabled={!hasMore}
                  >
                    Load More
                  </button>
                )}

                {isAdminPeopleCard && (
                  <button
                    onClick={() => (window.location.href = "/admin/people")}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SkeletonRowProps {
  columns: number;
  enableSelection?: boolean;
  enableRowActions?: boolean;
}

const SkeletonRow = ({
  columns,
  enableSelection = false,
  enableRowActions = false,
}: SkeletonRowProps) => (
  <tr className="animate-pulse">
    {enableSelection && (
      <td className="p-4">
        <div className="w-4 h-4 bg-gray-200 rounded" />
      </td>
    )}

    {Array.from({length: columns}).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 w-full bg-gray-200 rounded" />
      </td>
    ))}

    {enableRowActions && (
      <td className="p-4">
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </td>
    )}
  </tr>
);
