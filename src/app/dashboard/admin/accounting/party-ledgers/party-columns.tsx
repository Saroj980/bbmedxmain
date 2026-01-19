"use client";

import type { Product, ProductUnit } from "@/types/product";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { BookOpen, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { PartyLedger } from "@/types/party-ledger";
import { toTitleCase } from "@/utils/toTitleCase";
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

export const partyColumns = (
  router: ReturnType<typeof useRouter>,
  setEdit: (p: PartyLedger) => void,
  setOpen: (v: boolean) => void,
  refresh: () => void
): ColumnDef<PartyLedger>[] => {

  return [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      id: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-zinc-100 text-zinc-700 border border-zinc-300 text-xs">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Party Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => toTitleCase(row.original.type) ?? "-",
    },
    {
      id: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone,
    },
    {
      id: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
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
          if (!confirm("Delete this party?")) return;
          try {
            await api.delete(`/parties/${item.id}`);
            toast.success("Party deleted");
            refresh();
          } catch {
            toast.error("Delete failed");
          }
        };

        return (
          <div className="flex gap-3 items-center">
            {/* 📒 VIEW LEDGER */}
            <button
              title="View Ledger"
              className="text-emerald-600 hover:text-emerald-800"
              onClick={() =>
                router.push(
                  `/dashboard/admin/accounting/parties/${item.id}/ledger`
                )
              }
            >
              <BookOpen size={18} />
            </button>

            {/* ✏️ EDIT */}
            <button
              title="Edit Party"
              className="text-blue-600 hover:text-blue-800"
              onClick={() => {
                setEdit(item);
                setOpen(true);
              }}
            >
              <Pencil size={18} />
            </button>

            {/* 🗑 DELETE */}
            <button
              title="Delete Party"
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
};

