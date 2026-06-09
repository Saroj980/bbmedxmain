/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, CreditCard, History as HistoryIcon } from "lucide-react";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const purchaseColumns = (
  refresh: () => void,
  onPay: (purchase: any) => void,
  onHistory: (purchaseId: number) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "invoice_no",
    header: "Invoice #",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.invoice_no}</span>
    ),
  },
  {
    id: "supplier",
    header: "Supplier",
    cell: ({ row }) =>
      row.original.supplier?.name ?? "—",
  },
  {
    header: "Particulars",
    id: "particulars",
    cell: ({ row }) => {
      const items = row.original.items || [];
      return (
        <div className="flex flex-col gap-1 max-w-[200px]">
          {items.map((item: any, idx: number) => (
              <div key={item.id} className="text-[11px] leading-relaxed mb-1 last:mb-0">
                <div className="flex items-baseline gap-1">
                  <span className="font-medium text-gray-900 border-b border-gray-100">{item.product?.name}</span>
                  <span className="text-gray-400 text-[10px]">@ {formatNepaliCurrency(item.cost_price)}</span>
                </div>
                <div className="text-gray-500 text-[10px] flex gap-1 flex-wrap items-center mt-0.5">
                  {item.unit_breakdown?.map((ub: any, i: number) => (
                    <span key={i} className="bg-gray-50 px-1 rounded border border-gray-200">
                      <span className="font-bold text-gray-700">{ub.qty}</span>
                      <span className="ml-0.5 uppercase text-[9px] text-gray-500">{ub.unit}</span>
                    </span>
                  ))}
                  {(!item.unit_breakdown || item.unit_breakdown.length === 0) && (
                    <span className="bg-gray-50 px-1 rounded border border-gray-200">
                      <span className="font-bold text-gray-700">{item.quantity}</span>
                      <span className="ml-0.5 uppercase text-[9px] text-gray-500">{item.unit?.name}</span>
                    </span>
                  )}

                  {/* Free / Bonus Quantity */}
                  {item.free_unit_breakdown && item.free_unit_breakdown.length > 0 && (
                    <>
                      <span className="text-gray-300 mx-0.5">+</span>
                      {item.free_unit_breakdown.map((ub: any, i: number) => (
                        <span key={`f_${i}`} className="bg-blue-50 px-1.5 rounded border border-blue-100 flex items-center gap-1" title="Free/Bonus Items">
                          <span className="font-bold text-blue-700">{ub.qty}</span>
                          <span className="uppercase text-[9px] text-blue-600 font-medium">{ub.unit} (Free)</span>
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "invoice_date",
    header: "Date",
    cell: ({ row }) =>
      dayjs(row.original.invoice_date).format("YYYY-MM-DD"),
  },
  {
    accessorKey: "gross_amount",
    header: () => <div className="text-right">Gross</div>,
    cell: ({ row }) => (
        <div className="text-right">
        {formatNepaliCurrency(row.original.gross_amount)}
        </div>
    ),
 },
 {
    accessorKey: "carrier_cost",
    header: () => <div className="text-right">CC</div>,
    cell: ({ row }) => (
        <div className="text-right">
        {formatNepaliCurrency(row.original.carrier_cost || 0)}
        </div>
    ),
 },
 {
    accessorKey: "vat_amount",
    header: () => <div className="text-right">VAT</div>,
    cell: ({ row }) => (
        <div className="text-right">
        {formatNepaliCurrency(row.original.vat_amount)}
        </div>
    ),
    },
    {
    accessorKey: "total_amount",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => (
        <div className="text-right font-semibold text-green-700">
        {formatNepaliCurrency(row.original.total_amount)}
        </div>
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
    cell: ({ row }) => {
      const p = row.original;
      const router = useRouter();

      return (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/dashboard/admin/purchases/${p.id}`)}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <Eye size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPay(p)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <CreditCard size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Record Payment</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onHistory(p.id)}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <HistoryIcon size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Payment History</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      );
    },
  },
];
