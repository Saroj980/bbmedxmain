"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { BookOpen, Pencil, Trash2, Wallet, FileText, ArrowRightLeft } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { PartyLedger } from "@/types/party-ledger";
import { toTitleCase } from "@/utils/toTitleCase";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Tooltip } from "antd";

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
      cell: ({ row }) => <span className="text-gray-500 font-medium text-xs">{row.original.id}</span>
    },
    {
      id: "code",
      header: "Code",
      cell: ({ row }) => {
        const type = row.original.type;
        const isWalkin = type === 'walkin';
        return (
          <span className={`px-2 py-1 rounded text-xs font-semibold tracking-wider ${isWalkin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
            {row.original.code}
          </span>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Party Name",
      cell: ({ row }) => (
        <span className="font-bold text-gray-800">{row.original.name}</span>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => {
        const type = row.original.type?.toLowerCase() || '';
        let colorClass = 'bg-gray-100 text-gray-700 border-gray-200';
        let label = toTitleCase(type);
        
        if (type === 'customer') colorClass = 'bg-green-50 text-green-700 border-green-200';
        else if (type === 'supplier') colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
        else if (type === 'walkin') colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
        else if (type === 'hospital') colorClass = 'bg-red-50 text-red-700 border-red-200';
        else if (type === 'clinic') colorClass = 'bg-teal-50 text-teal-700 border-teal-200';

        return (
          <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${colorClass}`}>
            {label || "-"}
          </span>
        );
      },
    },
    {
      id: "phone",
      header: "Phone",
      cell: ({ row }) => <span className="text-gray-600 font-medium text-xs">{row.original.phone || "—"}</span>,
    },
    {
      id: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-gray-600 text-xs">{row.original.email || "—"}</span>,
    },
    {
      id: "balance",
      header: "Current Balance",
      cell: ({ row }) => {
        const bal = row.original.account?.current_balance || 0;
        if (bal === 0) return <span className="text-gray-400 font-medium text-xs">NPR 0.00</span>;
        
        // Asset/Expense accounts: DR is positive, CR is negative
        // Liability/Equity/Income: CR is positive, DR is negative
        // However, the backend calculates it natively based on account type, so a positive balance means normal balance.
        // Customer (Asset) -> positive means Receivable (Dr)
        // Supplier (Liability) -> positive means Payable (Cr)
        
        const type = row.original.type;
        const isReceivable = (type === 'customer' || type === 'walkin');
        
        // Simple display logic based on whether it's mostly a debtor or creditor
        const isDr = isReceivable ? bal > 0 : bal < 0;
        const absoluteBal = Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        if (isDr) {
          return <span className="text-green-700 font-bold text-xs bg-green-50 px-2 py-1 rounded">NPR {absoluteBal} <span className="text-[10px]">DR</span></span>;
        } else {
          return <span className="text-orange-700 font-bold text-xs bg-orange-50 px-2 py-1 rounded">NPR {absoluteBal} <span className="text-[10px]">CR</span></span>;
        }
      }
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_active ? (
          <span className="px-2 py-1 bg-green-50 text-green-600 border border-green-200 rounded text-xs font-medium uppercase tracking-wider">
            Active
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded text-xs font-medium uppercase tracking-wider">
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
          if (!confirm("Are you sure you want to delete this party? This action cannot be undone.")) return;
          try {
            await api.delete(`/parties/${item.id}`);
            toast.success("Party deleted successfully");
            refresh();
          } catch {
            toast.error("Failed to delete party. It may have associated transactions.");
          }
        };

        return (
          <div className="flex gap-2 items-center">
            <Tooltip title="View Ledger">
              <button
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/admin/accounting/parties/${item.id}/ledger`)}
              >
                <BookOpen size={16} />
              </button>
            </Tooltip>
            <Tooltip title="Edit Party">
              <button
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                onClick={() => {
                  setEdit(item);
                  setOpen(true);
                }}
              >
                <Pencil size={16} />
              </button>
            </Tooltip>
            <Tooltip title="Delete Party">
              <button
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
              </button>
            </Tooltip>
          </div>
        );
      },
    },
  ];
};
