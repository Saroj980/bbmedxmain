import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@/types/category";
import { ChevronRight, ChevronDown, Pencil, Trash2, Plus, Box } from "lucide-react";
import { Tag, Tooltip, Popconfirm } from "antd";

export const treeCategoryColumns = (
  toggleRow: (id: number) => void,
  expanded: Record<number, boolean>,
  onAddChild: (c: Category) => void,
  onEdit: (c: Category) => void,
  onDelete: (c: Category) => void,
  onViewProducts: (c: Category) => void
): ColumnDef<Category>[] => [
  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => {
      const cat = row.original;

      return (
        <div
          className="flex items-center gap-1"
          style={{ paddingLeft: cat.depth! * 20 }}
        >
          {cat.hasChildren ? (
            <button onClick={() => toggleRow(cat.id)}>
              {expanded[cat.id] ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}

          <span className="font-medium">{cat.id} - {cat.name}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "code",
    header: "Category Code",
    cell: ({ row }) => {
      const cat = row.original;

      return (
        <div
          className="flex items-center gap-1"
          style={{ paddingLeft: cat.depth! * 20 }}
        >
         <Tag
            color={cat.is_active ? "var(--primary)" : "text-danger"}
            className="uppercase font-medium tracking-wide"
          >
            {cat.code}
          </Tag>
        </div>
      );
    },
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
          className={`px-2 py-1 rounded-md text-xs font-medium ${
            active
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
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
      const cat = row.original;

      return (
        <div className="flex items-center gap-3">
          <Tooltip title="Add Subcategory">
            <button
              className="text-green-600 hover:text-green-800 cursor-pointer"
              onClick={() => onAddChild(cat)}
            >
              <Plus size={16} />
            </button>
          </Tooltip>

          <Tooltip title="Edit Category">
            <button
              className="text-blue-600 hover:text-blue-800 cursor-pointer"
              onClick={() => onEdit(cat)}
            >
              <Pencil size={16} />
            </button>
          </Tooltip>

          <Tooltip title="Delete Category">
            <button 
              className="text-red-600 hover:text-red-800 cursor-pointer"
              onClick={() => onDelete(cat)}
            >
              <Trash2 size={16} />
            </button>
          </Tooltip>
        </div>
      );
    },
  },
];
