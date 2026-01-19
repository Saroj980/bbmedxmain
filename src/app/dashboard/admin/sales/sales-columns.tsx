import dayjs from "dayjs";
import { ColumnDef } from "@tanstack/react-table";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { Eye } from "lucide-react";

export const salesColumns = (): ColumnDef<any>[] => {
  return [
    {
      header: "Invoice #",
      accessorKey: "invoice_no",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {row.original.invoice_no}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "invoice_date",
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {dayjs(row.original.invoice_date).format("YYYY-MM-DD")}
        </span>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customer.name",
      cell: ({ row }) => {
        const customer = row.original.customer;
        const walkinName = row.original.walkin_name;
        const displayName = customer?.name || "Walk-in Customer";

        return (
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {displayName}
              </span>

              {walkinName && walkinName.trim() !== "" && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {walkinName}
                </span>
              )}
            </div>

            {customer?.code && (
              <span className="text-xs text-gray-400">
                {customer.code}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Gross",
      accessorKey: "gross_amount",
      cell: ({ row }) => (
        <span className="text-sm text-right block text-gray-700">
          {formatNepaliCurrency(row.original.gross_amount)}
        </span>
      ),
    },
    {
      header: "Discount",
      accessorKey: "discount_amount",
      cell: ({ row }) => (
        <span className="text-sm text-right block text-red-600">
          {formatNepaliCurrency(row.original.discount_amount || 0)}
        </span>
      ),
    },
    {
      header: "VAT",
      accessorKey: "vat_amount",
      cell: ({ row }) => (
        <span className="text-sm text-right block text-gray-700">
          {formatNepaliCurrency(row.original.vat_amount)}
        </span>
      ),
    },
    {
      header: "Net Total",
      accessorKey: "total_amount",
      cell: ({ row }) => (
        <span className="text-sm text-right block font-semibold text-green-700">
          {formatNepaliCurrency(row.original.total_amount)}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <span
          className={`text-xs font-medium px-2 py-1 rounded
            ${
              row.original.status === "paid"
                ? "bg-green-100 text-green-700"
                : row.original.status === "partial"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
            }
          `}
        >
          {row.original.status.toUpperCase()}
        </span>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <a
            href={`/dashboard/admin/sales/${row.original.id}`}
            className="text-emerald-600 hover:text-emerald-800"
            title="View Sale"
          >
            <Eye size={18} />
          </a>
        </div>
      ),
    },
  ];
};
