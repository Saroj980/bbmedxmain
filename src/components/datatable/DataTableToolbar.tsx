"use client";

import { Input } from "@/components/ui/input";
import { Table } from "@tanstack/react-table";
import { Download, Settings2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Props<T> {
  table: Table<T>;
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
}

export function DataTableToolbar<T>({ table, globalFilter, setGlobalFilter }: Props<T>) {

  // CSV EXPORT
  const exportCSV = () => {
    const headers = table
      .getAllColumns()
      .filter((col) => col.getIsVisible())
      .map((col) => col.columnDef.header as string);

    const rows = table.getRowModel().rows.map((row) =>
      row.getVisibleCells().map((cell) => cell.getValue())
    );

    const csvContent =
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    a.click();
  };

  return (
    <div className="flex items-center justify-between p-4">

      {/* SEARCH */}
      <Input
        placeholder="Search..."
        className="w-60"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />

      {/* ACTIONS */}
      <div className="flex items-center gap-3">
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#009966] text-white rounded-lg hover:bg-[#008456]"
        >
          <Download size={16} /> Export
        </button>

        {/* COLUMN TOGGLE */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-3 py-2 bg-gray-100 rounded-lg">
            <Settings2 size={18} />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {table
              .getAllLeafColumns()
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                >
                  {column.columnDef.header as string}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
