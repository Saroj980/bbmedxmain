"use client";

import { useEffect, useMemo, useState } from "react";
import { DatePicker, Select, ConfigProvider } from "antd";
import dayjs from "dayjs";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ADToBS, BSToAD } from "bikram-sambat-js";
import NepaliBsDatePicker from "@/components/common/NepaliBsDatePicker";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity, 
  Filter, 
  Calendar, 
  Package, 
  User, 
  Printer,
  ChevronRight,
  ArrowLeft,
  Search,
  RefreshCw,
  Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Row = {
  id: number;
  created_at: string;
  type: string;
  quantity: number;
  product_id: number;
  batch_id: number;
  product?: { name: string; base_unit?: { name: string } };
  batch?: { batch_no: string };
  location?: { name: string };
  performer?: { name: string };
};

export default function StockRegisterPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState<string | null>(null);

  const [from, setFrom] = useState<string>(() => {
    try {
      const currentBS = ADToBS(dayjs().format("YYYY-MM-DD"));
      const startBS = currentBS.substring(0, 7) + "-01";
      return BSToAD(startBS);
    } catch {
      return dayjs().startOf('month').format("YYYY-MM-DD");
    }
  });

  const [to, setTo] = useState<string>(() => dayjs().format("YYYY-MM-DD"));

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (type) params.type = type;
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await api.get("/stock/movements", { params });
      setRows(res.data?.data ?? []);
    } catch (error) {
      console.error("Failed to fetch stock movements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- CALCULATIONS ---------------- */
  const { filteredRows, summary } = useMemo(() => {
    if (!rows.length) return { filteredRows: [], summary: { totalIn: 0, totalOut: 0, net: 0 } };

    // 1️⃣ Sort ASC for running calculation
    const sortedAsc = [...rows].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const balanceMap: Record<string, number> = {};
    let totalIn = 0;
    let totalOut = 0;

    const calculated = sortedAsc.map(r => {
      const key = `${r.product_id}-${r.batch_id}`;
      const qty = Number(r.quantity || 0);
      
      if (qty > 0) totalIn += qty;
      else totalOut += Math.abs(qty);

      if (!balanceMap[key]) balanceMap[key] = 0;
      balanceMap[key] += qty;

      return { ...r, balance: balanceMap[key] };
    });

    return {
      filteredRows: calculated.reverse(),
      summary: { totalIn, totalOut, net: totalIn - totalOut }
    };
  }, [rows]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 print:p-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* ================= BREADCRUMB ================= */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 print:hidden">
        <button onClick={() => window.history.back()} className="hover:text-[#009966] flex items-center gap-1 transition-colors border-none bg-transparent p-0 cursor-pointer">
          <ArrowLeft size={16} /> Dashboard
        </button>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="font-semibold text-gray-900">Stock Register</span>
      </div>

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             <Activity className="text-[#009966]" size={28} />
             Stock In / Out Register
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Batch-wise stock movement with real-time running balance
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <Button 
            variant="outline" 
            onClick={fetchData}
            disabled={loading}
            className="rounded-xl border-gray-200 hover:border-[#009966] group h-10 px-4"
          >
            <RefreshCw size={18} className={`mr-2 text-gray-400 group-hover:text-[#009966] ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="rounded-xl border-gray-200 hover:border-[#009966] group h-10 px-4"
          >
            <Printer size={18} className="mr-2 text-gray-400 group-hover:text-[#009966]" />
            Print Report
          </Button>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <ArrowUpRight size={80} className="text-green-600" />
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-2xl text-green-600">
                <ArrowUpRight size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Stock In</p>
                <p className="text-2xl font-black text-gray-900">{summary.totalIn.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6 relative">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <ArrowDownLeft size={80} className="text-red-600" />
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-red-50 p-3 rounded-2xl text-red-600">
                <ArrowDownLeft size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Stock Out</p>
                <p className="text-2xl font-black text-gray-900">{summary.totalOut.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gray-900 overflow-hidden group">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Activity size={80} className="text-white" />
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-2xl text-white">
                <RefreshCw size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Net Movement</p>
                <p className={`text-2xl font-black ${summary.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {summary.net > 0 ? '+' : ''}{summary.net.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 print:hidden">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-gray-400 mr-2">
            <Filter size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
          </div>

          <ConfigProvider
            theme={{
              token: {
                borderRadius: 12,
                colorPrimary: '#009966',
              },
            }}
          >
            <Select
              allowClear
              placeholder="All Movements"
              className="w-44 h-11"
              onChange={(v) => setType(v)}
              options={[
                { value: "purchase", label: "Stock In (Purchase)" },
                { value: "sale", label: "Stock Out (Sale)" },
                { value: "adjustment", label: "Adjustment" },
              ]}
            />

            <div className="flex items-center gap-2">
               <NepaliBsDatePicker 
                value={from ? ADToBS(from) : ""}
                onChange={(adDate) => setFrom(adDate || "")}
               />
               <span className="text-gray-300 font-bold">to</span>
               <NepaliBsDatePicker 
                value={to ? ADToBS(to) : ""}
                onChange={(adDate) => setTo(adDate || "")}
               />
            </div>

            <Button 
              onClick={fetchData}
              className="bg-[#009966] hover:bg-[#008055] text-white rounded-xl h-11 px-8 font-bold shadow-md shadow-green-100 ml-auto"
            >
              <Search size={18} className="mr-2" />
              Analyze Stock
            </Button>
          </ConfigProvider>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="px-6 py-5 text-left font-black">Timeline</th>
                <th className="px-6 py-5 text-left font-black">Item Details</th>
                <th className="px-4 py-5 text-center font-black">Batch No.</th>
                <th className="px-4 py-5 text-right font-black">Stock IN</th>
                <th className="px-4 py-5 text-right font-black">Stock OUT</th>
                <th className="px-6 py-5 text-right font-black">Balance</th>
                <th className="px-6 py-5 text-left font-black">Performer</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-6 border-b border-gray-50">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                       <Box size={48} className="mb-4 opacity-20" />
                       <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">No stock movements found</p>
                       <p className="text-[10px] mt-1 text-gray-400 italic">Try adjusting your filters or date range</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-[13px]">
                        {(() => {
                           try { return ADToBS(dayjs(r.created_at).format("YYYY-MM-DD")); } 
                           catch { return dayjs(r.created_at).format("YYYY-MM-DD"); }
                        })()}
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium">
                        {dayjs(r.created_at).format("YYYY-MM-DD")}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold tracking-tighter uppercase mt-0.5">
                         {dayjs(r.created_at).format("hh:mm A")}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-50 p-2 rounded-lg text-gray-400 group-hover:bg-[#E6F5F0] group-hover:text-[#009966] transition-colors">
                           <Package size={16} />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 leading-tight">{r.product?.name || "Unknown Product"}</p>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md mt-1 inline-block tracking-widest
                            ${r.type === 'purchase' ? 'bg-green-100 text-green-700' : 
                              r.type === 'sale' ? 'bg-blue-100 text-blue-700' : 
                              'bg-orange-100 text-orange-700'}
                          `}>
                            {r.type}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[11px] font-black tracking-tight">
                        {r.batch?.batch_no || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      {r.quantity > 0 ? (
                        <span className="text-green-600 font-black text-[13px] flex items-center justify-end">
                           <ArrowUpRight size={12} className="mr-0.5" />
                           {r.quantity}
                        </span>
                      ) : "—"}
                    </td>

                    <td className="px-4 py-4 text-right">
                      {r.quantity < 0 ? (
                        <span className="text-red-500 font-black text-[13px] flex items-center justify-end">
                           <ArrowDownLeft size={12} className="mr-0.5" />
                           {Math.abs(r.quantity)}
                        </span>
                      ) : "—"}
                    </td>

                    <td className="px-6 py-4 text-right">
                       <p className="font-black text-gray-900 text-[13px] tracking-tight">{r.balance}</p>
                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                          {r.product?.base_unit?.name || "Units"}
                       </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                        <User size={14} className="text-gray-400" />
                        {r.performer?.name || "System"}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 italic">
                        {r.location?.name || "Main Warehouse"}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* ================= FOOTER ================= */}
      <div className="text-center text-[10px] text-gray-400 mt-8 print:block hidden">
        <p>This is a computer-generated Stock Register Report. Powered by BBMedx.</p>
        <p>Report Date: {dayjs().format("YYYY-MM-DD HH:mm:ss")}</p>
      </div>

    </div>
  );
}
