"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Location } from "@/types/location";
import { ChevronRight, ChevronDown, Pencil, Trash2, Plus, Box } from "lucide-react";
import { Tooltip } from "antd";

export const treeLocationColumns = (
  toggleRow: (id: number) => void,
  expanded: Record<number, boolean>,
  onAddChild: (loc: Location) => void,
  onEdit: (loc: Location) => void,
  onDelete: (loc: Location) => void,
  onViewProducts: (loc: Location) => void
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
    accessorKey: "products_count",
    header: "Products",
    cell: ({ row }) => {
      const count = row.original.products_count || 0;
      return (
        <button 
          onClick={() => onViewProducts(row.original)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-gray-200 hover:border-emerald-200 cursor-pointer"
        >
          <Box size={14} />
          {count} {count === 1 ? 'Product' : 'Products'}
        </button>
      );
    }
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
          <Tooltip title="Add Sublocation">
            <button
              className="text-green-600 hover:text-green-800 cursor-pointer"
              onClick={() => onAddChild(loc)}
            >
              <Plus size={16} />
            </button>
          </Tooltip>

          <Tooltip title="Edit Location">
            <button
              className="text-blue-600 hover:text-blue-800 cursor-pointer"
              onClick={() => onEdit(loc)}
            >
              <Pencil size={16} />
            </button>
          </Tooltip>

          <Tooltip title="Delete Location">
            <button
              className="text-red-600 hover:text-red-800 cursor-pointer"
              onClick={() => onDelete(loc)}
            >
              <Trash2 size={16} />
            </button>
          </Tooltip>
        </div>
      );
    },
  },
];
