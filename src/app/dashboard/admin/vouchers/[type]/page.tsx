"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/datatable/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Printer, Eye, Plus } from "lucide-react";
import dayjs from "dayjs";
import { adToBs } from "@/utils/adToBs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { toTitleCase } from "@/utils/toTitleCase";
import { Button } from "@/components/ui/button";
import VoucherForm from "@/components/vouchers/VoucherForm";

export default function VouchersPage() {
  const params = useParams<{ type: string }>();
  const type = params.type || "all";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const loadVouchers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/vouchers", {
        params: { page, type },
      });
      setData(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        per_page: res.data.per_page,
        total: res.data.total,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, [type]);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: "journal_date",
        header: "Date",
        cell: ({ row }) => {
          const rawDate = row.original.journal_date;
          const createdAt = row.original.created_at;
          const adDateStr = dayjs(rawDate).format("YYYY-MM-DD");
          const timeStr = dayjs(createdAt).format("hh:mm A");
          const bsDateStr = adToBs(rawDate);

          return (
            <div>
              <div className="font-medium whitespace-nowrap">
                {adDateStr} <span className="text-gray-400 text-[10px]">(AD)</span> <span className="text-[#009966] font-bold uppercase text-[10px]">{timeStr}</span>
              </div>
              {bsDateStr && <div className="text-gray-500 text-[10px]">{bsDateStr} (BS)</div>}
            </div>
          );
        },
      },
      {
        accessorKey: "journal_no",
        header: "Voucher No",
        cell: ({ row }) => {
            const isReversed = row.original.is_reversed;
            return (
                <div className="flex items-center gap-2">
                    <span className={`font-medium ${isReversed ? 'text-gray-400 line-through italic' : 'text-[#009966]'}`}>
                        {row.original.journal_no}
                    </span>
                </div>
            );
        },
      },
      {
        accessorKey: "voucher_type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.original.voucher_type;
            const isReversed = row.original.is_reversed;
            const isReversal = row.original.is_reversal;

            let bgColor = "bg-gray-100";
            let textColor = "text-gray-700";
            let label = type;

            const colorMap: Record<string, { bg: string, text: string }> = {
                'Receipt': { bg: 'bg-[#EEFAF4]', text: 'text-[#009966]' },
                'Sale': { bg: 'bg-[#EEFAF4]', text: 'text-[#009966]' },
                'Credit Note': { bg: 'bg-[#EEFAF4]', text: 'text-[#009966]' },
                'Opening Balance': { bg: 'bg-[#EEFAF4]', text: 'text-[#009966]' },
                'Payment': { bg: 'bg-red-50', text: 'text-red-600' },
                'Purchase': { bg: 'bg-red-50', text: 'text-red-600' },
                'Debit Note': { bg: 'bg-red-50', text: 'text-red-600' },
                'Journal': { bg: 'bg-blue-50', text: 'text-blue-600' },
                'Contra': { bg: 'bg-amber-50', text: 'text-amber-600' },
                'Reversal': { bg: 'bg-red-100', text: 'text-red-700' },
            };

            if (isReversed) {
                bgColor = "bg-red-100";
                textColor = "text-red-700";
                label = "REVERSED " + type;
            } else if (isReversal) {
                bgColor = "bg-red-100";
                textColor = "text-red-700";
                label = "REVERSAL";
            } else if (colorMap[type]) {
                bgColor = colorMap[type].bg;
                textColor = colorMap[type].text;
            }

            return (
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border border-current opacity-90 ${bgColor} ${textColor}`}>
                    {label}
                </span>
            );
        }
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "created_by",
        header: "Created By",
        cell: ({ row }) => row.original.creator?.name || "System",
      },
      {
        accessorKey: "total_amount",
        header: "Amount",
        cell: ({ row }) => {
          const isReversed = row.original.is_reversed;
          
          let displayAmount = row.original.total_debit || 0;
          
          // Hide COGS (5100) and Inventory (1310) for Sales Vouchers to show the actual sales total
          if (row.original.journal_no?.startsWith("SAL-") && row.original.entries) {
            const displayEntries = row.original.entries.filter((e: any) => {
              const code = e.account?.code;
              return code !== "5100" && code !== "1310";
            });
            displayAmount = displayEntries.reduce((sum: number, e: any) => sum + Number(e.debit || 0), 0);
          }

          return (
            <span className={`font-semibold ${isReversed ? 'text-gray-400 line-through' : 'text-[#009966]'}`}>
                {formatNepaliCurrency(displayAmount)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex gap-3 text-center items-center">
              <a
                href={`/dashboard/admin/vouchers/print/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#009966]"
                title="Print Voucher"
              >
                <Printer size={18} />
              </a>
            </div>
          );
        },
      },
    ],
    []
  );

  const getPageTitle = () => {
    if (type === "all") return "All Vouchers";
    return `${toTitleCase(type)} Vouchers`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Accounting" },
            { label: "Vouchers" },
            { label: getPageTitle() },
          ]}
        />

        <Button
          className="bg-[#009966] text-white"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} className="mr-2" />
          New {toTitleCase(type)}
        </Button>
      </div>

      <DataTable
        title={getPageTitle()}
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage={`No ${type} vouchers found.`}
        pagination={{
          currentPage: pagination?.current_page,
          pageSize: pagination?.per_page,
          total: pagination?.total,
          onPageChange: (page) => loadVouchers(page),
        }}
        getRowClassName={(row) => {
          if (row.is_reversed || row.is_reversal) return 'bg-red-100 hover:bg-red-200 border-l-4 border-l-red-500';
          return 'bg-[#F1FAF6] hover:bg-[#E8F5EF]';
        }}
      />

      <VoucherForm
        open={showForm}
        onClose={() => setShowForm(false)}
        refresh={() => loadVouchers(1)}
        type={type === 'all' ? 'journal' : type}
      />
    </div>
  );
}
