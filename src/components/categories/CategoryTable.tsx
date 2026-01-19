"use client";

import type { Category } from "@/types/category";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const categoryColumns = (
  setEdit: (c: Category) => void,
  setOpen: (v: boolean) => void
): ColumnDef<Category>[] => [
  { id: "sno", header: "S.No", cell: ({ row }) => row.index + 1, size: 50 },

  {
    accessorKey: "id",
    header: "Ref ID",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-700">{row.original.id}</span>
    ),
  },

  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  
  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },

  {
    accessorKey: "parent_name",
    header: "Parent Category",
    cell: ({ row }) =>
      row.original.parent_name ? (
        <span>{row.original.parent_name}</span>
      ) : (
        <span className="text-gray-400 italic">None</span>
      ),
  },

  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded text-xs ${
          row.original.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {row.original.is_active ? "Active" : "Inactive"}
      </span>
    ),
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const cat = row.original;

      const deleteCategory = async () => {
        if (!confirm("Delete category?")) return;

        try {
          await api.delete(`/categories/${cat.id}`);
          toast.success("Category deleted");
          window.location.reload();
        } catch {
          toast.error("Delete failed");
        }
      };

      return (
        <div className="flex gap-3">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => {
              setEdit(cat);
              setOpen(true);
            }}
          >
            <Pencil size={18} />
          </button>

          <button
            className="text-red-600 hover:text-red-800"
            onClick={deleteCategory}
          >
            <Trash2 size={18} />
          </button>
        </div>
      );
    },
  },
];
