"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ProductFieldDefinition } from "@/types/product-field";
import { Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const fieldColumns = (
  setEdit: (f: ProductFieldDefinition) => void,
  setOpen: (v: boolean) => void,
  refresh: () => void
): ColumnDef<ProductFieldDefinition>[] => [
  {
    id: "order",
    header: "Order",
    cell: ({ row }) => row.original.order,
  },
  {
    accessorKey: "label",
    header: "Label",
  },
  {
    accessorKey: "key",
    header: "Key",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "required",
    header: "Required",
    cell: ({ row }) =>
      row.original.required ? (
        <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-400 text-xs">
          Yes
        </span>
      ) : (
        <span className="px-2 py-1 bg-red-100 text-red-700 border border-red-400 text-xs">
          No
        </span>
      ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const field = row.original;

      const handleDelete = async () => {
        if (!confirm("Delete this field?")) return;
        try {
          await api.delete(`/product-fields/${field.id}`);
          toast.success("Field deleted");
          refresh();
        } catch {
          toast.error("Delete failed");
        }
      };

      return (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEdit(field);
              setOpen(true);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>
        </div>
      );
    },
  },
];
