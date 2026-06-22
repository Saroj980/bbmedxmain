/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Location } from "@/types/location";
import { Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const locationColumns = (
  setEdit: (item: Location | null) => void,
  setOpen: (v: boolean) => void,
  refresh: () => void
): ColumnDef<Location>[] => [
  {
    id: "sno",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
    size: 60,
  },

  {
    accessorKey: "name",
    header: "Location Name",
    cell: ({ row }) => {
      const level = row.original.level ?? 0;

      return (
        <div
          className="font-medium text-[#2F3E46]"
          style={{ paddingLeft: `${level * 20}px` }} // indent by level
        >
          {row.original.name}
        </div>
      );
    },
  },

  {
    accessorKey: "parent_name",
    header: "Parent",
    cell: ({ row }) =>
      row.original.parent_name ? (
        <span>{row.original.parent_name}</span>
      ) : (
        <span className="text-gray-400 italic">Root</span>
      ),
  },

  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 border text-xs ${
          row.original.is_active
            ? "bg-green-100 text-green-700 border-green-400"
            : "bg-red-100 text-red-700 border-red-400"
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
      const item = row.original;

      const deleteItem = async () => {
        if (!confirm("Delete this location?")) return;

        try {
          await api.delete(`/locations/${item.id}`);
          toast.success("Location deleted");
          refresh();
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Delete failed");
        }
      };

      return (
        <div className="flex gap-3 items-center">
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
            onClick={deleteItem}
          >
            <Trash2 size={18} />
          </button>
        </div>
      );
    },
  },
];
