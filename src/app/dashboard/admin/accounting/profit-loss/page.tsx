"use client";

import { useState, useEffect } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Activity, TrendingUp, TrendingDown, RefreshCw, Printer, FileText
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import NepaliDatePickerBoth from "@/components/common/NepaliDatePickerBoth";

export default function ProfitLossPage() {
  const [loading, setLoading] = useState(true);
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  
  const [selectedFyId, setSelectedFyId] = useState<string>("");
  const [selectedFyDateRange, setSelectedFyDateRange] = useState({ start: "", end: "" });
  
  const [fromDateAD, setFromDateAD] = useState<string>("");
  const [fromDateBS, setFromDateBS] = useState<string>("");
  
  const [toDateAD, setToDateAD] = useState<string>("");
  const [toDateBS, setToDateBS] = useState<string>("");
  
  const [comparePrevFy, setComparePrevFy] = useState(false);
  const [comparePrevPeriod, setComparePrevPeriod] = useState(false);
  
  const [report, setReport] = useState<any>({});
  const [kpis, setKpis] = useState<any>({});
  
  const [systemSettings, setSystemSettings] = useState<any>(null);

  useEffect(() => {
    fetchFiscalYears();
    fetchSystemSettings();
  }, []);

  useEffect(() => {
    if (selectedFyId) {
      const fy = fiscalYears.find((f) => f.id === parseInt(selectedFyId));
      if (fy) {
        const startAD = fy.ad_start.split('T')[0];
        const endAD = fy.ad_end.split('T')[0];
        const startBS = fy.bs_start || "";
        const endBS = fy.bs_end || "";
        
        setSelectedFyDateRange({ start: startAD, end: endAD });
        
        // Auto update dates when FY changes
        setFromDateAD(startAD);
        setFromDateBS(startBS);
        setToDateAD(endAD);
        setToDateBS(endBS);
      }
    }
  }, [selectedFyId, fiscalYears]);

  useEffect(() => {
    if (selectedFyId && toDateAD && fromDateAD) {
      fetchProfitLoss();
    }
  }, [selectedFyId, fromDateAD, toDateAD, comparePrevFy]);

  const fetchFiscalYears = async () => {
    try {
      const res = await api.get("/fiscal-years");
      setFiscalYears(res.data);
      const activeFy = res.data.find((f: any) => f.is_active);
      if (activeFy) {
        setSelectedFyId(activeFy.id.toString());
      } else if (res.data.length > 0) {
        setSelectedFyId(res.data[0].id.toString());
      }
    } catch (err) {
      toast.error("Failed to fetch fiscal years");
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const res = await api.get("/system-settings");
      setSystemSettings(res.data);
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const fetchProfitLoss = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/profit-loss", {
        params: {
          fiscal_year_id: selectedFyId,
          from_date: fromDateAD,
          as_on_date: toDateAD,
          compare_with_previous: comparePrevFy ? 'true' : 'false'
        }
      });
      setReport(res.data.report);
      setKpis(res.data.kpis);
    } catch (err) {
      toast.error("Failed to fetch profit & loss report");
    } finally {
      setLoading(false);
    }
  };

  const formatNPR = (num: number | undefined) => {
    if (num === undefined) return "0.00";
    return Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const renderSection = (title: string, dataKey: string, sectionNumber: string, colorClass: string) => {
    const section = report[dataKey];
    if (!section) return null;

    return (
      <>
        <tr className="bg-gray-50/80 border-b border-gray-100">
          <td colSpan={5} className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider text-sm">
            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs text-white", colorClass)}>
              {sectionNumber}
            </span>
            {title}
          </td>
        </tr>
        {section.items && section.items.map((item: any, idx: number) => (
          <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
            <td className="py-2.5 px-4 pl-12 text-sm text-gray-700">
              <span className="text-gray-400 mr-2">{sectionNumber}.{idx + 1}</span> {item.name}
            </td>
            <td className="py-2.5 px-4 text-sm text-right text-gray-600">
              {formatNPR(item.current)}
            </td>
            {comparePrevFy && (
              <>
                <td className="py-2.5 px-4 text-sm text-right text-gray-500">
                  {formatNPR(item.previous)}
                </td>
                <td className={cn(
                  "py-2.5 px-4 text-sm text-right",
                  item.variance > 0 ? "text-green-600" : item.variance < 0 ? "text-red-600" : "text-gray-500"
                )}>
                  {item.variance > 0 ? "+" : ""}{formatNPR(item.variance)}
                </td>
                <td className={cn(
                  "py-2.5 px-4 text-sm text-right",
                  item.variance_percent > 0 ? "text-green-600" : item.variance_percent < 0 ? "text-red-600" : "text-gray-500"
                )}>
                  {item.variance_percent > 0 ? "+" : ""}{item.variance_percent}%
                </td>
              </>
            )}
          </tr>
        ))}
        {section.items && section.items.length === 0 && (
          <tr>
            <td colSpan={comparePrevFy ? 5 : 2} className="py-2 px-4 pl-12 text-sm text-gray-400 italic">No transactions</td>
          </tr>
        )}
      </>
    );
  };

  const renderTotalRow = (title: string, value: number, prevValue?: number, sectionRef?: string, colorClass = "text-gray-900") => {
    const variance = value - (prevValue || 0);
    const variancePercent = prevValue ? round((variance / Math.abs(prevValue)) * 100, 2) : (value > 0 ? 100 : 0);

    return (
      <tr className="border-b border-gray-200 bg-white">
        <td className="py-3.5 px-4 font-bold text-sm flex items-center gap-2">
          {sectionRef && (
            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs text-white", "bg-blue-600")}>
              {sectionRef}
            </span>
          )}
          <span className={cn("uppercase tracking-wider", colorClass)}>{title}</span>
        </td>
        <td className={cn("py-3.5 px-4 text-sm text-right font-bold", colorClass)}>
          {formatNPR(value)}
        </td>
        {comparePrevFy && (
          <>
            <td className="py-3.5 px-4 text-sm text-right font-medium text-gray-500">
              {formatNPR(prevValue)}
            </td>
            <td className={cn(
              "py-3.5 px-4 text-sm text-right font-medium",
              variance > 0 ? "text-green-600" : variance < 0 ? "text-red-600" : "text-gray-500"
            )}>
              {variance > 0 ? "+" : ""}{formatNPR(variance)}
            </td>
            <td className={cn(
              "py-3.5 px-4 text-sm text-right font-medium",
              variancePercent > 0 ? "text-green-600" : variancePercent < 0 ? "text-red-600" : "text-gray-500"
            )}>
              {variancePercent > 0 ? "+" : ""}{variancePercent}%
            </td>
          </>
        )}
      </tr>
    );
  };

  const round = (num: number, dec: number) => Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-4">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Accounting", href: "/dashboard/admin/accounting" },
            { label: "Profit & Loss" },
          ]}
        />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-[#2F3E46] flex items-center gap-2">
              Profit & Loss Statement <FileText size={24} className="text-[#009966] opacity-80" />
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Analyze your business profitability for the selected period.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => fetchProfitLoss()}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} className="text-gray-500" /> Refresh
            </button>
            <button 
              onClick={() => {
                sessionStorage.setItem("pl_print_report", JSON.stringify(report));
                sessionStorage.setItem("pl_print_kpis", JSON.stringify(kpis));
                sessionStorage.setItem("pl_print_fy", JSON.stringify(fiscalYears.find(f => f.id === parseInt(selectedFyId))));
                sessionStorage.setItem("pl_print_dates", JSON.stringify({ fromDateBS, toDateBS, comparePrevFy }));
                sessionStorage.setItem("pl_print_settings", JSON.stringify(systemSettings));
                window.open("/dashboard/admin/accounting/profit-loss/print", "_blank");
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Printer size={16} className="text-gray-500" /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
            Fiscal Year <span className="text-red-500">*</span>
          </label>
          <select 
            className="w-48 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#009966] text-sm"
            value={selectedFyId}
            onChange={(e) => setSelectedFyId(e.target.value)}
          >
            {fiscalYears.map((fy) => (
              <option key={fy.id} value={fy.id}>{fy.name}</option>
            ))}
          </select>
        </div>

        <div className="w-40">
          <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
            From Date (BS)
          </label>
          <NepaliDatePickerBoth 
            key={`from-${fromDateBS}`} // Re-render if changed externally
            bsValue={fromDateBS}
            onChange={(bs, ad) => {
              setFromDateBS(bs);
              setFromDateAD(ad);
            }}
          />
        </div>

        <div className="w-40">
          <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
            To Date (BS) <span className="text-red-500">*</span>
          </label>
          <NepaliDatePickerBoth 
            key={`to-${toDateBS}`} // Re-render if changed externally
            bsValue={toDateBS}
            onChange={(bs, ad) => {
              setToDateBS(bs);
              setToDateAD(ad);
            }}
          />
        </div>

        <div className="flex items-center gap-4 mb-2 ml-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={comparePrevFy}
              onChange={(e) => setComparePrevFy(e.target.checked)}
              className="rounded border-gray-300 text-[#009966] focus:ring-[#009966] w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">Compare with Previous FY</span>
          </label>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Activity size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {loading ? "..." : `NPR ${formatNPR(report.revenue?.total)}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* COGS */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <TrendingDown size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cost of Goods Sold</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {loading ? "..." : `NPR ${formatNPR(report.cogs?.total)}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gross Profit */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gross Profit</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {loading ? "..." : `NPR ${formatNPR(report.gross_profit?.current)}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingDown size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Expenses</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {loading ? "..." : `NPR ${formatNPR(report.opex?.total + report.other_expense?.total)}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#009966]/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-[#009966]" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Net Profit</p>
              <p className="text-xl font-bold text-[#009966] mt-0.5">
                {loading ? "..." : `NPR ${formatNPR(report.net_profit?.current)}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main P&L Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Particulars</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">
                    Current Period
                    <div className="text-[10px] text-gray-500 font-normal mt-0.5 capitalize tracking-normal">
                      ({fromDateBS || 'Start'} to {toDateBS || 'End'})
                    </div>
                  </th>
                  {comparePrevFy && (
                    <>
                      <th className="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-right">
                        Previous Period
                        <div className="text-[10px] text-gray-500 font-normal mt-0.5 capitalize tracking-normal">
                          (Last FY)
                        </div>
                      </th>
                      <th className="py-3 px-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-right" colSpan={2}>
                        Variance
                        <div className="flex justify-end gap-12 mt-0.5">
                          <span className="text-[10px] text-gray-500 font-normal tracking-normal">Amount (NPR)</span>
                          <span className="text-[10px] text-gray-500 font-normal tracking-normal mr-2">%</span>
                        </div>
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={comparePrevFy ? 5 : 2} className="py-12 text-center text-gray-500">
                      <RefreshCw className="animate-spin mx-auto mb-2 text-gray-400" size={24} />
                      Calculating Statement...
                    </td>
                  </tr>
                ) : report.revenue ? (
                  <>
                    {renderSection("INCOME", "revenue", "I", "bg-green-600")}
                    {renderSection("COST OF GOODS SOLD", "cogs", "II", "bg-orange-500")}
                    {renderTotalRow("GROSS PROFIT ( I - II )", report.gross_profit.current, report.gross_profit.previous, "III", "text-blue-700")}
                    
                    {renderSection("OPERATING EXPENSES", "opex", "IV", "bg-purple-600")}
                    {renderTotalRow("OPERATING PROFIT ( III - IV )", report.operating_profit.current, report.operating_profit.previous, "V", "text-indigo-700")}
                    
                    {renderSection("OTHER INCOME", "other_income", "VI", "bg-teal-500")}
                    {renderSection("OTHER EXPENSES", "other_expense", "VII", "bg-red-500")}
                    
                    {renderTotalRow("NET PROFIT ( V + VI - VII )", report.net_profit.current, report.net_profit.previous, "VIII", "text-[#009966]")}
                  </>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 py-3 px-4 border-t border-gray-200 text-xs text-gray-500">
            Note: Positive values indicate Profit/Income. Negative values indicate Loss/Expense.
          </div>
        </div>

        {/* Right Sidebar Analytics & KPIs */}
        <div className="space-y-6">
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Pharmacy Profit Intelligence</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Bonus Given</p>
                  <p className="text-sm font-semibold text-gray-900">
                    NPR {formatNPR(kpis.total_bonus_given)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Rev Forgone</p>
                  <p className="text-sm font-semibold text-gray-900">
                    NPR {formatNPR(kpis.bonus_revenue_forgone)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Expired Stock Loss</p>
                  <p className="text-sm font-semibold text-gray-900">
                    NPR {formatNPR(kpis.expired_stock_loss)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Damaged Stock Loss</p>
                  <p className="text-sm font-semibold text-gray-900">
                    NPR {formatNPR(kpis.damaged_stock_loss)}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic text-center mt-2">
                All values impact cost and overall profitability.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-100 bg-[#2F3E46] text-white">
            <CardContent className="p-6">
               <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-2">Net Profit Margin</h3>
               <p className="text-4xl font-black text-[#009966]">
                 {loading ? "..." : report.revenue?.total > 0 ? ((report.net_profit?.current / report.revenue?.total) * 100).toFixed(2) + "%" : "0.00%"}
               </p>
               <p className="text-xs text-white/60 mt-2">
                 Percentage of revenue remaining after all expenses are deducted.
               </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
