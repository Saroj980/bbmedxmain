"use client";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Empty } from "antd";
import type { DataTableProps } from "./DataTable.types";
import { Loader2 } from "lucide-react";

export function DataTable<TData>({
  title,
  columns,
  data,
  loading = false,
  pageSize,
  disablePagination = false,
  emptyMessage = 'No records found.',
  pagination,
  getRowClassName,
  expandedRowRenderer,
  disableSearch = false,
  className,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter,
      
     },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: pageSize || 50 }
    },
    manualPagination: !!pagination,
    pageCount: pagination
      ? Math.ceil(pagination.total / pagination.pageSize)
      : undefined,
    // onGlobalFilterChange: setGlobalFilter,

    // getCoreRowModel: getCoreRowModel(),
    // getFilteredRowModel: getFilteredRowModel(),
    // getSortedRowModel: getSortedRowModel(),
  });


  return (
    <div className={`relative bg-white border shadow-md rounded-xl overflow-hidden ${className || ""}`}>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-[#009966]" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      )}

      {/* HEADER */}
      {(!disableSearch || title) && (
        <div className="p-4 border-b flex items-center justify-between bg-slate-50/70 backdrop-blur-sm print:hidden">
          <h2 className="text-lg font-bold text-[#163A5F] font-heading">
            {title}
          </h2>

          {!disableSearch && (
            <Input
              placeholder="Search..."
              className="w-56 bg-white border-slate-200 focus-visible:ring-[#163A5F]"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              disabled={loading}
            />
          )}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-4 py-3 font-semibold text-gray-700 whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-16">
                  <Empty description={emptyMessage || "No data"} />
                </td>
              </tr>
            )}
            {!loading && data.length > 0 &&
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    className={`border-b transition ${getRowClassName ? getRowClassName(row.original) : 'hover:bg-[#F1FAF6]'}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {/* We inject toggleCollapse if the cell handles expansion, otherwise we can just render the cell. 
                            Actually, we can pass it via cell context in columns, but easier to let the parent trigger state. */}
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {expandedRowRenderer && row.getIsExpanded() && (
                    <tr className="bg-gray-50/80">
                      <td colSpan={row.getVisibleCells().length} className="p-0 border-b">
                        {expandedRowRenderer(row.original, () => row.toggleExpanded())}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {!disablePagination && (
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 print:hidden">
        <button
          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-100"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage() || loading}
        >
          Previous
        </button>

        <span className="text-gray-600 text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>

        <button
          className="px-3 py-1 border rounded-md bg-white hover:bg-gray-100"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage() || loading}
        >
          Next
        </button>
      </div>
      )}
    </div>
  );
}
