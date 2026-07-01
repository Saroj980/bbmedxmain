"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { returnColumns } from "./return-columns";
import { Card } from "@/components/ui/card";
import NepaliBsDatePicker from "@/components/common/NepaliBsDatePicker";
import FiscalYearSelect from "@/components/common/FiscalYearSelect";

export default function SalesReturnsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [activeFiscalYear, setActiveFiscalYear] = useState<any>(null);
  
  // Date filters display states (Nepali Calendar BS)
  const [bsFrom, setBsFrom] = useState<string | null>(null);
  const [bsTo, setBsTo] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const [filters, setFilters] = useState<{
    from: string | null;
    to: string | null;
    fiscal_year_id: number | null;
  }>({
    from: null,
    to: null,
    fiscal_year_id: null,
  });

  useEffect(() => {
    api.get("/fiscal-years").then(res => {
        const active = res.data.find((f: any) => f.is_active);
        if (active) {
            setActiveFiscalYear(active);
            setBsFrom(active.bs_start);
            setBsTo(active.bs_end);
            setFilters(prev => ({
                ...prev,
                fiscal_year_id: active.id,
                from: active.ad_start,
                to: active.ad_end
            }));
        }
    }).finally(() => {
        setIsReady(true);
    });
  }, []);

  const loadReturns = useCallback(
    async (page = 1, appliedFilters = filters) => {
      setLoading(true);
      try {
        const res = await api.get("/sales-returns", {
          params: {
            page,
            ...appliedFilters,
          },
        });

        setData(res.data.data || []);
        setPagination({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          per_page: res.data.per_page,
          total: res.data.total,
        });
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    if (!isReady) return;
    loadReturns(1, filters);
  }, [filters.from, filters.to, filters.fiscal_year_id, isReady]);

  const columns = useMemo(
    () => returnColumns(router),
    [router]
  );

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
      <div className="print:hidden">
        <div className="mb-4">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard/admin" },
              { label: "Sales History", href: "/dashboard/admin/sales" },
              { label: "Sales Returns" },
            ]}
          />
        </div>
        <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Sales Returns</h1>
            <p className="text-sm text-gray-500">Track and manage credit notes &amp; reversed sales entries</p>
          </div>
          <div>
            <Button
              className="bg-[#009966] hover:bg-[#008055] text-white rounded-xl shadow-md font-bold"
              onClick={() => router.push("/dashboard/admin/sales")}
            >
              Go to Sales
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="p-5 border-none shadow-sm rounded-xl overflow-hidden print:hidden bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              From Date
            </label>
            <NepaliBsDatePicker
              value={bsFrom}
              onChange={(adDate) => {
                setFilters(prev => ({ ...prev, from: adDate }));
              }}
              minDate={activeFiscalYear?.bs_start}
              maxDate={activeFiscalYear?.bs_end}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              To Date
            </label>
            <NepaliBsDatePicker
              value={bsTo}
              onChange={(adDate) => {
                setFilters(prev => ({ ...prev, to: adDate }));
              }}
              minDate={activeFiscalYear?.bs_start}
              maxDate={activeFiscalYear?.bs_end}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Fiscal Year
            </label>
            <FiscalYearSelect
              value={filters.fiscal_year_id}
              onChange={(val, fy) => {
                if (fy) setActiveFiscalYear(fy);
                setBsFrom(fy?.bs_start ?? null);
                setBsTo(fy?.bs_end ?? null);
                setFilters(prev => ({
                  ...prev,
                  fiscal_year_id: val,
                  from: fy?.ad_start ?? prev.from,
                  to: fy?.ad_end ?? prev.to
                }));
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-transparent select-none uppercase tracking-wider">
              Actions
            </label>
            <Button
              variant="outline"
              className="w-full text-xs font-medium border-gray-200 hover:bg-gray-50 h-9"
              onClick={() => {
                setBsFrom(null);
                setBsTo(null);
                setFilters({ from: null, to: null, fiscal_year_id: null });
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <DataTable
        title="Credit Notes / Returns"
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No sales returns found."
        pagination={{
          currentPage: pagination?.current_page,
          pageSize: pagination?.per_page,
          total: pagination?.total,
          onPageChange: (page) => loadReturns(page),
        }}
        getRowClassName={() => "hover:bg-gray-50/50 transition-colors"}
      />
    </div>
  );
}
