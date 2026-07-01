import dayjs from "dayjs";
import { ColumnDef } from "@tanstack/react-table";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import NepaliDate from "nepali-date";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const returnColumns = (
  router: any
): ColumnDef<any>[] => {
  return [
    {
      header: "Debit Note #",
      accessorKey: "return_no",
      cell: ({ row }) => (
        <span className="text-sm font-black text-gray-900">
          {row.original.return_no}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "return_date",
      cell: ({ row }) => (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-gray-900">
            {new NepaliDate(new Date(row.original.return_date)).format("MMMM DD, YYYY")}
          </span>
          <span className="text-xs text-gray-400">
            {dayjs(row.original.return_date).format("MMM DD, YYYY")}
          </span>
        </div>
      ),
    },
    {
      header: "Purchase Invoice #",
      accessorKey: "purchase.invoice_no",
      cell: ({ row }) => (
        <span 
          className="text-sm font-semibold text-emerald-600 hover:underline cursor-pointer" 
          onClick={() => router.push(`/dashboard/admin/purchases/${row.original.purchase_id}`)}
        >
          {row.original.purchase?.invoice_no}
        </span>
      ),
    },
    {
      header: "Supplier",
      accessorKey: "supplier.name",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {row.original.supplier?.name}
        </span>
      ),
    },
    {
      header: "Particulars",
      id: "particulars",
      cell: ({ row }) => {
        const items = row.original.items || [];
        return (
          <div className="flex flex-col gap-1 max-w-[200px]">
            {items.map((item: any) => (
              <div key={item.id} className="text-[11px] leading-relaxed mb-1 last:mb-0">
                <span className="font-medium text-gray-900">{item.product?.name}</span>
                <div className="text-gray-500 text-[10px] flex gap-1 flex-wrap">
                  <span className="bg-orange-50 text-orange-700 px-1 rounded border border-orange-100 font-bold">
                    {Number(item.quantity) > 0 && `${Math.round(Number(item.quantity))} ${item.unit?.name}`}
                    {Number(item.free_qty) > 0 && ` + ${Math.round(Number(item.free_qty))} Free`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      header: "Remarks",
      accessorKey: "remarks",
      cell: ({ row }) => (
        <span className="text-[11px] text-gray-500 italic max-w-[150px] truncate block">
          {row.original.remarks || "—"}
        </span>
      ),
    },
    {
      header: "Gross",
      accessorKey: "gross_amount",
      cell: ({ row }) => (
        <span className="text-sm text-right block text-gray-900">
          {formatNepaliCurrency(row.original.gross_amount)}
        </span>
      ),
    },
    {
      header: "Discount",
      accessorKey: "discount_amount",
      cell: ({ row }) => (
        <span className="text-sm text-right block text-red-600">
          {formatNepaliCurrency(row.original.discount_amount)}
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
        <span className="text-sm text-right block font-semibold text-emerald-700">
          {formatNepaliCurrency(row.original.total_amount)}
        </span>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/dashboard/admin/purchases/${row.original.purchase_id}`)}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <Eye size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Original Purchase</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
};
