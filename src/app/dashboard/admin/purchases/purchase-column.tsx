/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { toTitleCase } from "@/utils/toTitleCase";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";

export const purchaseColumns = (
  refresh: () => void
): ColumnDef<any>[] => [
  {
    accessorKey: "invoice_no",
    header: "Invoice #",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.invoice_no}</span>
    ),
  },
  {
    id: "supplier",
    header: "Supplier",
    cell: ({ row }) =>
      row.original.supplier?.name ?? "—",
  },
  {
    accessorKey: "invoice_date",
    header: "Date",
    cell: ({ row }) =>
      dayjs(row.original.invoice_date).format("YYYY-MM-DD"),
  },
  {
    accessorKey: "gross_amount",
    header: () => <div className="text-right">Gross</div>,
    cell: ({ row }) => (
        <div className="text-right">
        {formatNepaliCurrency(row.original.gross_amount)}
        </div>
    ),
 },
 {
    accessorKey: "vat_amount",
    header: () => <div className="text-right">VAT</div>,
    cell: ({ row }) => (
        <div className="text-right">
        {formatNepaliCurrency(row.original.vat_amount)}
        </div>
    ),
    },
    {
    accessorKey: "total_amount",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => (
        <div className="text-right font-semibold text-green-700">
        {formatNepaliCurrency(row.original.total_amount)}
        </div>
    ),
    },


  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status;
      return (
        <span
          className={`px-2 py-1 text-xs border rounded ${
            s === "paid"
              ? "bg-green-100 text-green-700 border-green-300"
              : s === "partial"
              ? "bg-orange-100 text-orange-700 border-orange-300"
              : "bg-gray-100 text-gray-700 border-gray-300"
          }`}
        >
          {toTitleCase(s)}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex gap-3 text-center items-center">
          <a
            href={`/dashboard/admin/purchases/${item.id}`}
            className="text-emerald-600 hover:text-emerald-800"
            title="View Purchase"
          >
            <Eye size={18} />
          </a>
        </div>
      );
    },
  },
];
