"use client";

import type { Product, ProductUnit } from "@/types/product";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
// import { formatUnitChain } from "@/utils/formatunitchain";

export function formatUnitChain(units: ProductUnit[]): string {
  if (!units || units.length === 0) return "-";

  // sort by level (1 = top)
  const sorted = [...units].sort((a, b) => a.level - b.level);

  const parts: string[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    parts.push(
      `1 ${current.unit} = ${next.conversion_factor} ${next.unit}`
    );
  }

  return parts.join(", ");
}

export const productColumns = (
  setEdit: (p: Product) => void,
  setOpen: (v: boolean) => void,
  refresh: () => void
): ColumnDef<Product>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name} {row.original.is_active ?? '-'}</span>,
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => row.original.category?.name ?? "-",
  },
  {
    id: "units",
    header: "Units",
    cell: ({ row }) => (
      <span className="text-sm">
        
        {formatUnitChain(row.original.units)}
      </span>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) =>
      row.original.is_active ? (
        <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-300 text-xs">
          Active
        </span>
      ) : (
        <span className="px-2 py-1 bg-red-100 text-red-700 border border-red-300 text-xs">
          Inactive
        </span>
      ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;

      const handleDelete = async () => {
        if (!confirm("Delete this product?")) return;
        try {
          await api.delete(`/products/${item.id}`);
          toast.success("Product deleted");
          refresh();
        } catch {
          toast.error("Delete failed");
        }
      };

      return (
        <div className="flex gap-3">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => {
              setEdit(item);
              setOpen(true);
            }}
          >
            <Pencil size={18} />
          </button>

          <button
            className="text-red-600 hover:text-red-800"
            onClick={handleDelete}
          >
            <Trash2 size={18} />
          </button>
        </div>
      );
    },
  },
];
