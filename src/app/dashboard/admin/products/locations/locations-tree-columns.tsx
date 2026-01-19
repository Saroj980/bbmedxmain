"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Location } from "@/types/location";
import { ChevronRight, ChevronDown, Pencil, Trash2, Plus } from "lucide-react";

export const treeLocationColumns = (
  toggleRow: (id: number) => void,
  expanded: Record<number, boolean>,
  onAddChild: (loc: Location) => void,
  onEdit: (loc: Location) => void,
  onDelete: (loc: Location) => void
): ColumnDef<Location>[] => [
  {
    accessorKey: "name",
    header: "Location",
    cell: ({ row }) => {
      const loc = row.original;

      return (
        <div
          className="flex items-center gap-1"
          style={{ paddingLeft: loc.level * 20 }}
        >
          {loc.hasChildren ? (
            <button onClick={() => toggleRow(loc.id)}>
              {expanded[loc.id] ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}

          <span className="font-medium">{loc.name}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "parent_name",
    header: "Parent",
    cell: ({ row }) =>
      row.original.parent_name ? (
        <span className="text-gray-700">{row.original.parent_name}</span>
      ) : (
        <span className="text-gray-400 italic">Root</span>
      ),
  },

  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.is_active;

      return (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium border ${
            active
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300"
          }`}
        >
          {active ? "Active" : "Inactive"}
        </span>
      );
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const loc = row.original;

      return (
        <div className="flex items-center gap-3">
          <button
            className="text-green-600 hover:text-green-800"
            onClick={() => onAddChild(loc)}
          >
            <Plus size={16} />
          </button>

          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => onEdit(loc)}
          >
            <Pencil size={16} />
          </button>

          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => onDelete(loc)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    },
  },
];
