import type { ColumnDef } from "@tanstack/react-table";
import type { Account } from "@/types/account";
import { ChevronDown, ChevronRight, Pencil, Plus } from "lucide-react";
import { Tag } from "antd";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";

export const treeAccountColumns = (
  toggleRow: (id: number) => void,
  expanded: Record<number, boolean>,
  onAddChild: (a: Account) => void,
  onEdit: (a: Account) => void
): ColumnDef<Account>[] => [
  {
    accessorKey: "name",
    header: "Account",
    cell: ({ row }) => {
      const acc = row.original;

      return (
        <div
          className="flex items-center gap-1"
          style={{ paddingLeft: acc.depth! * 20 }}
        >
          {acc.hasChildren ? (
            <button onClick={() => toggleRow(acc.id)}>
              {expanded[acc.id] ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}

          <span className="font-medium">
            {acc.code} – {acc.name}
          </span>
          {acc.opening_balance != undefined && acc.opening_balance > 0 && (
              <Tag className="text-xs text-gray-500">
                Opening Balance: { formatNepaliCurrency(acc.opening_balance)}{" "}
                {acc.opening_balance_type?.toUpperCase()}
              </Tag>
            )}
        </div>
      );
    },
  },

  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Tag className="uppercase">
        {row.original.type}
      </Tag>
    ),
  },

  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.is_active;
      return (
        <span
          className={`px-2 py-1 rounded text-xs ${
            active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
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
      const acc = row.original;

      return (
        <div className="flex items-center gap-3">
          <button
            className="text-green-600"
            onClick={() => onAddChild(acc)}
          >
            <Plus size={16} />
          </button>

          {!acc.is_system && (
            <button
              className="text-blue-600"
              onClick={() => onEdit(acc)}
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
      );
    },
  },
];
