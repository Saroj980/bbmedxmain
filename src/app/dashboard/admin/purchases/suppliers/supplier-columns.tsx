import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";

export const supplierColumns = (onEdit: (party: any) => void) => [
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
        <button
          onClick={() => onEdit(row.original)}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
        >
          Edit
        </button>
      </div>
    ),
  },
];
