import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/datatable/DataTable";
import { api } from "@/lib/api";

export default function ActivityTab({ fiscalYear }: { fiscalYear: any }) {
  const [loading, setLoading] = useState(false);
  const [journals, setJournals] = useState<any[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const res = await api.get("/vouchers", {
          params: {
            from: fiscalYear?.ad_start,
            to: fiscalYear?.ad_end
          }
        });
        setJournals(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (fiscalYear) {
      fetchActivities();
    }
  }, [fiscalYear]);

  const columns = [
    { header: "Date", accessorKey: "formatted_date" },
    { header: "Journal No", accessorKey: "journal_no" },
    { header: "Description", accessorKey: "description" },
    { 
      header: "Total Amount", 
      accessorKey: "display_amount",
      cell: ({ getValue, row }: any) => {
        const v = getValue() as number;
        // Fallback to total_debit if display_amount is undefined
        const amount = v !== undefined ? v : row.original.total_debit;
        return <div className="text-right"><span className="font-bold">NPR {Math.abs(amount || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span></div>;
      }
    },
    { 
      header: "Status", 
      id: "status",
      cell: ({ row }: any) => {
        const r = row.original;
        return (
          <div className="text-center">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              r.posted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {r.posted ? 'Posted' : 'Draft'}
            </span>
          </div>
        );
      }
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }: any) => {
        const r = row.original;
        return (
          <div className="text-center">
            <a 
              href={`/dashboard/admin/vouchers/print/${r.id}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-[#009966] text-xs font-bold hover:underline"
            >
              View Voucher
            </a>
          </div>
        );
      }
    }
  ];

  return (
    <div className="p-3 text-xs">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-xs tracking-wide">RECENT ACTIVITY ({fiscalYear?.name})</h3>
        </div>
        <div className="[&_.ant-table-cell]:py-1.5 [&_.ant-table-cell]:px-2 [&_.ant-table-cell]:text-xs">
          <DataTable 
            columns={columns}
            data={journals}
            loading={loading}
            pageSize={20}
          />
        </div>
      </div>
    </div>
  );
}
