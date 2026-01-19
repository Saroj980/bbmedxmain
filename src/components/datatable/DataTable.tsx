"use client";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { DataTableProps } from "./DataTable.types";
import { Loader2 } from "lucide-react";

export function DataTable<TData>({
  title,
  columns,
  data,
  loading = false,
  pageSize,
  disablePagination = false,
  emptyMessage,
  pagination,
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

  if (!loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        {emptyMessage ?? "No records found."}
      </div>
    );
  }

  return (
    <div className="relative bg-white border shadow-md rounded-xl overflow-hidden">

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-[#009966]" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      )}

      {/* HEADER */}
      <div className="p-5 border-b flex items-center justify-between bg-[#F8FFFB]">
        <h2 className="text-xl font-semibold text-[#009966] font-heading">
          {title}
        </h2>

        <Input
          placeholder="Search..."
          className="w-56 bg-white"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-4 py-3 font-semibold text-gray-700"
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
            {!loading &&
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-[#F1FAF6] transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {!disablePagination && (
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
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
