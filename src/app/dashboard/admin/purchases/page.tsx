"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import PurchaseForm from "@/components/purchases/PurchaseForm";
import PurchasePaymentDrawer from "@/components/purchases/PurchasePaymentDrawer";
import PurchasePaymentsHistoryModal from "@/components/purchases/PurchasePaymentsHistoryModal";
import { purchaseColumns } from "./purchase-column";
import FiscalYearSelect from "@/components/common/FiscalYearSelect";
import { Printer } from "lucide-react";

import ListingPrintHeader from "@/components/common/ListingPrintHeader";
import NepaliBsDatePicker from "@/components/common/NepaliBsDatePicker";
import StatsCard from "@/components/common/StatsCard";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { Truck, CreditCard, Clock, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCallback } from "react";

export default function PurchasesPage() {
//   const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  
  // Payment States
  const [payPurchase, setPayPurchase] = useState<any>(null);
  const [historyPurchaseId, setHistoryPurchaseId] = useState<number | null>(null);

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
  
  const loadPurchases = useCallback(
    async (page = 1, appliedFilters = filters) => {
      setLoading(true);
      try {
        const res = await api.get("/purchases", {
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

const loadSummary = useCallback(async (appliedFilters = filters) => {
    try {
        const res = await api.get("/purchases/summary", {
            params: appliedFilters,
        });
        setSummary(res.data);
    } catch (err) {
        console.error("Failed to load summary", err);
    }
}, [filters]);


//   const loadPurchases = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get("/purchases");
//       setData(res.data || []);
//     } finally {
//       setLoading(false);
//     }
//   };

  useEffect(() => {
    if (!isReady) return;
    loadPurchases(1, filters);
    loadSummary(filters);
  }, [filters.from, filters.to, filters.fiscal_year_id, isReady]); // Consistent with Sales page fix

  const columns = useMemo(
    () => purchaseColumns(
      loadPurchases,
      (p) => setPayPurchase({ ...p, payable: p.total_amount - (p.paid_amount || 0) }), // Approximated. We'll let the drawer refetch to be exact if needed, but passing what we have.
      (id) => setHistoryPurchaseId(id)
    ),
    [loadPurchases]
  );


  return (
    <div className="space-y-6">
      <div className="hidden print:block">
        <ListingPrintHeader
          title="Purchase Invoices Report"
          systemSettings={systemSettings}
          filters={filters}
        />
      </div>
      <div className="print:hidden">
        <div className="mb-4">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard/admin" },
              { label: "Purchase History" },
            ]}
          />
        </div>
        <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Purchase History</h1>
            <p className="text-sm text-gray-500">Track and manage your purchase invoices</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                  const params = new URLSearchParams();
                  if (filters.from) params.set("from", filters.from);
                  if (filters.to) params.set("to", filters.to);
                  if (filters.fiscal_year_id) params.set("fiscal_year_id", filters.fiscal_year_id.toString());
                  window.open(`/dashboard/admin/purchases/report?${params.toString()}`, "_blank");
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
              New Purchase
            </Button>
          </div>
        </div>
      </div>
      {/* ---------------- Stats Section ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <StatsCard 
          icon={Truck} 
          title="Total Purchases" 
          value={String(summary?.total_count || 0)} 
          bgGradient="from-blue-600 to-blue-400"
        />
        <StatsCard 
          icon={CreditCard} 
          title="Total Bill" 
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
                  setBsFrom(bsFrom); // display stays; picker controls its own display
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
                  setBsTo(bsTo);
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
                  // Update BS display
                  setBsFrom(fy?.bs_start ?? null);
                  setBsTo(fy?.bs_end ?? null);
                  // Update AD filters for API
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

      <DataTable
        title="Purchase Invoices"
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No purchases found."
        pagination={{
            currentPage: pagination?.current_page,
            pageSize: pagination?.per_page,
            total: pagination?.total,
            onPageChange: (page) => loadPurchases(page),
        }}
        getRowClassName={(row) => {
          if (row.status === 'paid') return 'bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors';
          if (row.status === 'partial') return 'bg-orange-50/20 hover:bg-orange-50/40 transition-colors';
          return 'hover:bg-gray-50/50 transition-colors';
        }}
      />


      <PurchaseForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={loadPurchases}
      />

      {/* Payment Drawer */}
      <PurchasePaymentDrawer
        open={!!payPurchase}
        onClose={() => setPayPurchase(null)}
        purchase={payPurchase}
        outstandingAmount={payPurchase?.outstanding_amount}
        onSuccess={() => {
          setPayPurchase(null);
          loadPurchases(pagination?.current_page || 1);
        }}
      />

      {/* Payment History Modal */}
      <PurchasePaymentsHistoryModal
        open={!!historyPurchaseId}
        onClose={() => setHistoryPurchaseId(null)}
        purchaseId={historyPurchaseId}
      />
    </div>
  );
}
