import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Eye } from "lucide-react";

export const supplierColumns = (onEdit: (party: any) => void, router: any) => [
  {
    header: "Supplier Name",
    accessorKey: "name",
    id: "name",
    cell: ({ row }: any) => <div className="font-semibold text-gray-800">{row.original.name}</div>,
  },
  {
    header: "Phone",
    accessorKey: "phone",
    id: "phone",
    cell: ({ row }: any) => row.original.phone || "-",
  },
  {
    header: "Email",
    accessorKey: "email",
    id: "email",
    cell: ({ row }: any) => row.original.email || "-",
  },
  {
    header: "Address",
    accessorKey: "address",
    id: "address",
    cell: ({ row }: any) => row.original.address || "-",
  },
  {
    header: "PAN No",
    accessorKey: "pan_no",
    id: "pan_no",
    cell: ({ row }: any) => row.original.pan_no || "-",
  },
  {
    header: "VAT Registered",
    accessorKey: "is_vat_registered",
    id: "is_vat_registered",
    cell: ({ row }: any) =>
      row.original.is_vat_registered ? (
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium uppercase tracking-wider">
          Yes
        </span>
      ) : (
        <span className="px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-200 rounded text-xs font-medium uppercase tracking-wider">
          No
        </span>
      ),
  },
  {
    header: () => <div className="text-right">Current Balance</div>,
    id: "balance",
    accessorKey: "account.current_balance",
    cell: ({ row }: any) => {
      const bal = row.original.account?.current_balance || 0;
      return (
        <div className={`text-right font-medium ${bal < 0 ? "text-green-600" : bal > 0 ? "text-red-600" : "text-gray-700"}`}>
          {formatNepaliCurrency(Math.abs(bal))} {bal < 0 ? "Cr" : bal > 0 ? "Dr" : ""}
        </div>
      );
    },
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => router.push(`/dashboard/admin/accounting/parties/${row.original.id}/ledger`)}
                className="w-8 h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              >
                <Eye size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Ledger</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onEdit(row.original)}
                className="w-8 h-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              >
                <Pencil size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Supplier</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
  },
];
