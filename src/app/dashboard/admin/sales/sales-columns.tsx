import dayjs from "dayjs";
import { ColumnDef } from "@tanstack/react-table";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { Eye, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import NepaliDate from "nepali-date";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const salesColumns = (
  router: any,
  loadSales: () => void,
  setPaySale: (s: any) => void
): ColumnDef<any>[] => {

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
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-gray-900">
            {new NepaliDate(new Date(row.original.invoice_date)).format("MMMM DD, YYYY")}
          </span>
          <span className="text-xs text-gray-400">
            {dayjs(row.original.invoice_date).format("MMM DD, YYYY")}
          </span>
        </div>
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
      header: "Particulars",
      id: "particulars",
      cell: ({ row }) => {
        const items = row.original.items || [];
        return (
          <div className="flex flex-col gap-1 max-w-[200px]">
            {items.map((item: any, idx: number) =>                <div key={item.id} className="text-[11px] leading-relaxed mb-1 last:mb-0">
                  <div className="flex items-baseline gap-1">
                    <span className="font-medium text-gray-900 border-b border-gray-100">{item.product?.name}</span>
                    <span className="text-gray-400 text-[10px]">@ {formatNepaliCurrency(item.selling_price)}</span>
                  </div>
                  <div className="text-gray-500 text-[10px] flex gap-1 items-center flex-wrap">
                    {item.unit_breakdown?.map((ub: any, i: number) => (
                      <span key={i} className="bg-gray-50 px-1 rounded border border-gray-100">
                        <span className="font-bold text-emerald-600">{ub.qty}</span>
                        <span className="ml-0.5 uppercase text-[9px]">{ub.unit}</span>
                      </span>
                    ))}
                    {(!item.unit_breakdown || item.unit_breakdown.length === 0) && (
                        <span>{item.quantity} {item.unit?.name}</span>
                    )}
                    {Number(item.free_qty) > 0 && (
                      <span className="bg-green-50 text-[#009966] px-1 rounded border border-green-100 font-bold italic text-[9px]">
                        + {Number(item.free_qty)} Free
                      </span>
                    )}
                  </div>
                </div>
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status as string;
        const colorMap: Record<string, string> = {
          paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
          partial: "bg-orange-50 text-orange-700 border-orange-100",
          open: "bg-blue-50 text-blue-700 border-blue-100",
          cancelled: "bg-rose-50 text-rose-700 border-rose-100",
        };

        const dotMap: Record<string, string> = {
          paid: "bg-emerald-500",
          partial: "bg-orange-500",
          open: "bg-blue-500",
          cancelled: "bg-rose-500",
        };

        const colorClass = colorMap[status?.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-100";
        const dotClass = dotMap[status?.toLowerCase()] || "bg-gray-500";

        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${colorClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotClass}`}></span>
            {status?.toUpperCase()}
          </div>
        );
      },
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
                  onClick={() => router.push(`/dashboard/admin/sales/${row.original.id}`)}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <Eye size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Invoice Details</p>
              </TooltipContent>
            </Tooltip>

            {row.original.status !== "paid" && row.original.status !== "cancelled" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPaySale(row.original)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <CreditCard size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Receive Payment</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      ),
    },

  ];
};
