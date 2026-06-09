"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import SaleForm from "@/components/sales/SaleForm";
import SalePaymentDrawer from "@/components/sales/SalePaymentDrawer";
import { salesColumns } from "./sales-columns";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import FiscalYearSelect from "@/components/common/FiscalYearSelect";
import { Printer } from "lucide-react";
import ListingPrintHeader from "@/components/common/ListingPrintHeader";
import NepaliBsDatePicker from "@/components/common/NepaliBsDatePicker";
import { Card } from "@/components/ui/card";
import StatsCard from "@/components/common/StatsCard";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { ShoppingBag, CreditCard, Clock, Tag } from "lucide-react";


export default function SalesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setOpenForm(true);
      // Remove query param from URL without refreshing so it doesn't re-open on normal refresh
      router.replace("/dashboard/admin/sales", { scroll: false });
    }
  }, [searchParams, router]);

  const [paySale, setPaySale] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [activeFiscalYear, setActiveFiscalYear] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  // Separate BS display values for the picker (value prop is BS)
  const [bsFrom, setBsFrom] = useState<string | null>(null);
  const [bsTo, setBsTo] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    api.get("/system-settings").then((res) => setSystemSettings(res.data));
    api.get("/fiscal-years").then(res => {
        const active = res.data.find((f: any) => f.is_active);
        if (active) {
            setActiveFiscalYear(active);
            // BS for picker display
            setBsFrom(active.bs_start);
            setBsTo(active.bs_end);
            // AD for API filters
            setFilters(prev => {
                if (
                    prev.fiscal_year_id === active.id && 
                    prev.from === active.ad_start && 
                    prev.to === active.ad_end
                ) {
                    return prev;
                }
                return {
                    ...prev,
                    fiscal_year_id: active.id,
                    from: active.ad_start,
                    to: active.ad_end
                };
            });
        }
    }).finally(() => {
        setIsReady(true);
    });
  }, []);

  /* ---------------- Filters ---------------- */
  const [filters, setFilters] = useState<{
    from: string | null;
    to: string | null;
    fiscal_year_id: number | null;
  }>({
    from: null,
    to: null,
    fiscal_year_id: null,
  });

  /* ---------------- Load Sales ---------------- */
  const loadSales = useCallback(
    async (page = 1, appliedFilters = filters) => {
      setLoading(true);
      try {
        const res = await api.get("/sales", {
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

  /* ---------------- Summary ---------------- */
  const loadSummary = useCallback(
    async (appliedFilters = filters) => {
      try {
        const res = await api.get("/sales/summary", {
          params: appliedFilters,
        });
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to load summary", err);
      }
    },
    [filters]
  );

  /* ---------------- Initial + Filter Reload ---------------- */
  useEffect(() => {
    if (!isReady) return;
    loadSales(1, filters);
    loadSummary(filters);
  }, [filters.from, filters.to, filters.fiscal_year_id, isReady]);

  /* ---------------- Columns ---------------- */
  const columns = useMemo(
    () => salesColumns(router, loadSales, setPaySale),
    [router, loadSales, setPaySale]
  );


  return (
    <div className="space-y-6">
      <div className="hidden print:block">
        <ListingPrintHeader
          title="Sales Invoices Report"
          systemSettings={systemSettings}
          filters={filters}
        />
      </div>

      <div className="print:hidden">
        <div className="mb-4">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard/admin" },
              { label: "Sales History" },
            ]}
          />
        </div>
        <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Sales History</h1>
            <p className="text-sm text-gray-500">Track and manage your sales invoices</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                  const params = new URLSearchParams();
                  if (filters.from) params.set("from", filters.from);
                  if (filters.to) params.set("to", filters.to);
                  if (filters.fiscal_year_id) params.set("fiscal_year_id", filters.fiscal_year_id.toString());
                  window.open(`/dashboard/admin/sales/report?${params.toString()}`, "_blank");
              }}
              className="hidden md:flex shadow-sm"
            >
              <Printer size={16} className="mr-2" />
              Print Report
            </Button>

            <Button
              className="bg-[#009966] text-white shadow-sm hover:bg-[#008456]"
              onClick={() => setOpenForm(true)}
            >
              <Plus size={16} className="mr-2" />
              New Sale
            </Button>
          </div>
        </div>
      </div>

      {/* ---------------- Stats Section ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <StatsCard 
          icon={ShoppingBag} 
          title="Total Invoices" 
          value={String(summary?.total_count || 0)} 
          bgGradient="from-blue-600 to-blue-400"
        />
        <StatsCard 
          icon={CreditCard} 
          title="Total Sales" 
          value={formatNepaliCurrency(summary?.total_amount || 0)} 
          bgGradient="from-emerald-600 to-emerald-400"
        />
        <StatsCard 
          icon={Tag} 
          title="Total Discount" 
          value={formatNepaliCurrency(summary?.discount_amount || 0)} 
          bgGradient="from-orange-600 to-orange-400"
        />
        <StatsCard 
          icon={Clock} 
          title="Due Amount" 
          value={formatNepaliCurrency((summary?.total_amount || 0) - (summary?.paid_amount || 0))} 
          bgGradient="from-rose-600 to-rose-400"
        />
      </div>

      {/* ---------------- Filters ---------------- */}
      <Card className="p-0 border-none shadow-sm rounded-xl overflow-hidden print:hidden">
        <div className="bg-white p-5 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* From Date */}
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

            {/* To Date */}
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

            {/* Fiscal Year */}
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

            {/* Clear button with label for alignment */}
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
        </div>
      </Card>

      {/* ---------------- Table ---------------- */}
      <DataTable
        title="Sales Invoices"
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No sales found."
        pagination={{
          currentPage: pagination?.current_page,
          pageSize: pagination?.per_page,
          total: pagination?.total,
          onPageChange: (page) => loadSales(page),
        }}
        getRowClassName={(row) => {
          if (row.status === 'paid') return 'bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors';
          if (row.status === 'partial') return 'bg-orange-50/20 hover:bg-orange-50/40 transition-colors';
          return 'hover:bg-gray-50/50 transition-colors';
        }}
      />

      {/* ---------------- Sale Form ---------------- */}
      <SaleForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={() => loadSales(1)}
      />

      {/* Payment Drawer */}
      <SalePaymentDrawer
        open={!!paySale}
        onClose={() => setPaySale(null)}
        sale={paySale}
        outstandingAmount={(paySale?.total_amount || 0) - (paySale?.paid_amount || 0)}
        onSuccess={() => {
          setPaySale(null);
          loadSales(pagination?.current_page || 1);
        }}
      />
    </div>
  );
}
