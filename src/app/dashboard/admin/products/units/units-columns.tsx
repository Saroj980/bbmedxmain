"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Unit } from "@/types/unit";
import { Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const columns = (
  setEditUnit: (u: Unit) => void,
  setOpenForm: (v: boolean) => void
): ColumnDef<Unit>[] => [
  {
    id: "serial",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
    // size: 60,
  },

  // 🔹 ID Column
  {
    accessorKey: "id",
    header: "Ref ID",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-700">{row.original.id}</span>
    ),
    // size: 80,
  },
  {
    accessorKey: "name",
    header: "Unit Name",
    cell: ({ row }) => (
      <span className="font-medium text-[#2F3E46]">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "short_code",
    header: "Short Code",
    cell: ({ row }) => <span className="text-gray-600">{row.original.short_code}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const unit = row.original;

      const handleDelete = async () => {
        if (!confirm("Delete this unit?")) return;

        try {
          await api.delete(`/units/${unit.id}`);
          toast.success("Unit deleted");
          window.location.reload();
        } catch {
          toast.error("Failed to delete");
        }
      };

      return (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditUnit(unit);
              setOpenForm(true);
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
