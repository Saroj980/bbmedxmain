"use client";

import { useState, useEffect } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building, TrendingUp, TrendingDown, RefreshCw, Printer, FileText, Anchor, Activity, Scale, Briefcase, Info, Lock
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import NepaliDatePickerBoth from "@/components/common/NepaliDatePickerBoth";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function BalanceSheetPage() {
  const [loading, setLoading] = useState(true);
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  
  const [selectedFyId, setSelectedFyId] = useState<string>("");
  
  const [asOnDateAD, setAsOnDateAD] = useState<string>("");
  const [asOnDateBS, setAsOnDateBS] = useState<string>("");
  
  const [comparePrevFy, setComparePrevFy] = useState(false);
  
  const [report, setReport] = useState<any>({});
  
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
        const endBS = fy.bs_end || "";
        
        // Auto update dates when FY changes
        const today = new Date().toISOString().split('T')[0];
        if (today >= startAD && today <= endAD) {
          // Keep current date if within FY
          // We don't have bs today easily, so we just stick to end date for simplicity, 
          // or user can use the date picker. Let's just set to FY end for safety on FY change.
          setAsOnDateAD(endAD);
          setAsOnDateBS(endBS);
        } else {
          setAsOnDateAD(endAD);
          setAsOnDateBS(endBS);
        }
      }
    }
  }, [selectedFyId, fiscalYears]);

  useEffect(() => {
    if (selectedFyId && asOnDateAD) {
      fetchBalanceSheet();
    }
  }, [selectedFyId, asOnDateAD, comparePrevFy]);

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

  const fetchBalanceSheet = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/balance-sheet", {
        params: {
          fiscal_year_id: selectedFyId,
          as_on_date: asOnDateAD,
          compare_with_previous: comparePrevFy ? 'true' : 'false'
        }
      });
      setReport(res.data.report);
    } catch (err) {
      toast.error("Failed to fetch balance sheet report");
    } finally {
      setLoading(false);
    }
  };

  const formatNPR = (num: number | undefined) => {
    if (num === undefined) return "0.00";
    return Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const renderSection = (title: string, dataKey: string, sectionRef: string, colorClass: string, isAssets: boolean) => {
    const parentSection = isAssets ? report?.assets : report?.liabilities;
    if (!parentSection) return null;
    
    const section = parentSection[dataKey];
    if (!section) return null;

    return (
      <>
        <tr className="bg-gray-50/80 border-b border-gray-100">
          <td colSpan={5} className="py-2.5 px-4 font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider text-xs">
            {sectionRef}. {title}
          </td>
        </tr>
        {section.items && section.items.map((item: any, idx: number) => (
          <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
            <td className="py-2 px-4 pl-8 text-[13px] text-gray-700">
              <span className="text-gray-400 mr-2">{sectionRef}.{idx + 1}</span> {item.name}
            </td>
            <td className="py-2 px-4 text-[13px] text-right font-medium text-gray-800">
              {formatNPR(item.current)}
            </td>
            {comparePrevFy && (
              <>
                <td className="py-2 px-4 text-[13px] text-right text-gray-500">
                  {formatNPR(item.previous)}
                </td>
                <td className={cn(
                  "py-2 px-4 text-[13px] text-right",
                  item.variance > 0 ? "text-green-600" : item.variance < 0 ? "text-red-600" : "text-gray-500"
                )}>
                  {item.variance > 0 ? "+" : ""}{formatNPR(item.variance)}
                </td>
                <td className={cn(
                  "py-2 px-4 text-[13px] text-right",
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
            <td colSpan={comparePrevFy ? 5 : 2} className="py-2 px-4 pl-12 text-sm text-gray-400 italic">No accounts</td>
          </tr>
        )}
        <tr className="border-b border-gray-100 bg-gray-50/30">
          <td className="py-2 px-4 pl-8 font-bold text-[13px] text-gray-700">
            Total {title}
          </td>
          <td className="py-2 px-4 text-[13px] text-right font-bold text-gray-900">
            {formatNPR(section.total)}
          </td>
          {comparePrevFy && (
            <>
              <td className="py-2 px-4 text-[13px] text-right font-medium text-gray-500">
                {formatNPR(section.total_prev)}
              </td>
              <td className="py-2 px-4 text-[13px] text-right text-gray-500">-</td>
              <td className="py-2 px-4 text-[13px] text-right text-gray-500">-</td>
            </>
          )}
        </tr>
      </>
    );
  };

  const renderEquitySection = () => {
    const section = report?.equity;
    if (!section) return null;

    return (
      <>
        <tr className="bg-gray-50/80 border-b border-gray-100">
          <td colSpan={5} className="py-2.5 px-4 font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider text-xs">
            III. EQUITY
          </td>
        </tr>
        {section.items && section.items.map((item: any, idx: number) => (
          <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
            <td className="py-2 px-4 pl-8 text-[13px] text-gray-700">
              <span className="text-gray-400 mr-2">3.{idx + 1}</span> {item.name}
            </td>
            <td className="py-2 px-4 text-[13px] text-right font-medium text-gray-800">
              {formatNPR(item.current)}
            </td>
            {comparePrevFy && (
              <>
                <td className="py-2 px-4 text-[13px] text-right text-gray-500">
                  {formatNPR(item.previous)}
                </td>
                <td className={cn(
                  "py-2 px-4 text-[13px] text-right",
                  item.variance > 0 ? "text-green-600" : item.variance < 0 ? "text-red-600" : "text-gray-500"
                )}>
                  {item.variance > 0 ? "+" : ""}{formatNPR(item.variance)}
                </td>
                <td className={cn(
                  "py-2 px-4 text-[13px] text-right",
                  item.variance_percent > 0 ? "text-green-600" : item.variance_percent < 0 ? "text-red-600" : "text-gray-500"
                )}>
                  {item.variance_percent > 0 ? "+" : ""}{item.variance_percent}%
                </td>
              </>
            )}
          </tr>
        ))}
        <tr className="border-b border-gray-100 bg-gray-50/30">
          <td className="py-2 px-4 pl-8 font-bold text-[13px] text-gray-700">
            Total Equity
          </td>
          <td className="py-2 px-4 text-[13px] text-right font-bold text-gray-900">
            {formatNPR(section.total)}
          </td>
          {comparePrevFy && (
            <>
              <td className="py-2 px-4 text-[13px] text-right font-medium text-gray-500">
                {formatNPR(section.total_prev)}
              </td>
              <td className="py-2 px-4 text-[13px] text-right text-gray-500">-</td>
              <td className="py-2 px-4 text-[13px] text-right text-gray-500">-</td>
            </>
          )}
        </tr>
      </>
    );
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Data for Charts
  const getAssetData = () => {
    if (!report?.kpis) return [];
    return [
      { name: 'Cash & Bank', value: report.kpis.cash_and_bank },
      { name: 'Receivables', value: report.kpis.accounts_receivable },
      { name: 'Inventory', value: report.kpis.inventory_value },
      { name: 'Fixed Assets', value: report.kpis.fixed_assets },
    ].filter(i => i.value > 0);
  };

  const getLiabilityData = () => {
    if (!report?.kpis) return [];
    return [
      { name: 'Accounts Payable', value: report.kpis.accounts_payable },
      { name: 'Taxes Payable', value: report.kpis.taxes_payable },
      { name: 'Short-term Loans', value: report.kpis.short_term_loans },
      { name: 'Long-term Loans', value: report.kpis.long_term_loans },
    ].filter(i => i.value > 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-4">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Accounting", href: "/dashboard/admin/accounting" },
            { label: "Balance Sheet" },
          ]}
        />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-[#2F3E46] flex items-center gap-2">
              Balance Sheet <Scale size={24} className="text-[#009966] opacity-80" />
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Statement of financial position as of the selected date.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => fetchBalanceSheet()}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} className="text-gray-500" /> Refresh
            </button>
            <button 
              onClick={() => {
                sessionStorage.setItem("bs_print_report", JSON.stringify(report));
                sessionStorage.setItem("bs_print_fy", JSON.stringify(fiscalYears.find(f => f.id === parseInt(selectedFyId))));
                sessionStorage.setItem("bs_print_dates", JSON.stringify({ asOnDateBS, comparePrevFy }));
                sessionStorage.setItem("bs_print_settings", JSON.stringify(systemSettings));
                window.open("/dashboard/admin/accounting/balance-sheet/print", "_blank");
              }}
              className="flex items-center gap-2 px-3 py-2 bg-[#009966] border border-[#009966] text-white rounded-md text-sm font-medium hover:bg-[#008255] transition-colors"
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Validation Banner */}
      {!loading && report?.totals?.difference !== 0 && report?.totals?.difference !== undefined && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="bg-red-100 p-2 rounded-full mt-0.5">
            <Info size={16} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-red-800 font-bold text-sm uppercase tracking-wide">Out of Balance Warning</h3>
            <p className="text-red-600 text-sm mt-1">
              Total Assets and (Total Liabilities + Equity) do not match. The difference is <strong>NPR {formatNPR(report.totals.difference)}</strong>. 
              This typically indicates incomplete double-entry journals or missing opening balances.
            </p>
          </div>
        </div>
      )}

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
            As On Date (BS) <span className="text-red-500">*</span>
          </label>
          <NepaliDatePickerBoth 
            key={`as-on-${asOnDateBS}`} // Re-render if changed externally
            bsValue={asOnDateBS}
            onChange={(bs, ad) => {
              setAsOnDateBS(bs);
              setAsOnDateAD(ad);
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
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Building size={20} className="text-[#009966]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Total Assets</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">
                {loading ? "..." : `NPR ${formatNPR(report?.totals?.total_assets)}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <Lock size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Total Liabilities</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">
                {loading ? "..." : `NPR ${formatNPR(report?.liabilities?.total)}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Anchor size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Total Equity</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">
                {loading ? "..." : `NPR ${formatNPR(report?.equity?.total)}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Briefcase size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Net Worth</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">
                {loading ? "..." : `NPR ${formatNPR(report?.totals?.net_worth)}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-100 bg-[#2F3E46] text-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Working Capital</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {loading ? "..." : `NPR ${formatNPR(report?.totals?.working_capital)}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ASSETS TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#E6F5EE] border-b border-gray-200 px-4 py-3 flex items-center gap-2">
            <Building size={18} className="text-[#009966]" />
            <h2 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Assets</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase">Particulars</th>
                  <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase text-right">Amount (NPR)</th>
                  {comparePrevFy && (
                    <>
                      <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase text-right">Prev (NPR)</th>
                      <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase text-right">Var</th>
                      <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase text-right">%</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={comparePrevFy ? 5 : 2} className="py-12 text-center text-gray-500">
                      <RefreshCw className="animate-spin mx-auto mb-2 text-gray-400" size={24} />
                    </td>
                  </tr>
                ) : (
                  <>
                    {renderSection("CURRENT ASSETS", "current", "I", "text-blue-600", true)}
                    {renderSection("NON-CURRENT ASSETS", "non_current", "II", "text-purple-600", true)}
                  </>
                )}
              </tbody>
              {!loading && report?.totals && (
                <tfoot className="bg-[#F0FDF4] border-t-2 border-[#009966]/20">
                  <tr>
                    <td className="py-3 px-4 font-bold text-gray-900 uppercase tracking-wider text-sm">Total Assets</td>
                    <td className="py-3 px-4 font-bold text-[#009966] text-right text-base">
                      {formatNPR(report.totals.total_assets)}
                    </td>
                    {comparePrevFy && (
                      <>
                        <td className="py-3 px-4 font-bold text-gray-500 text-right text-sm">
                          {formatNPR(report.assets.total_prev)}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-500 text-right text-sm">-</td>
                        <td className="py-3 px-4 font-bold text-gray-500 text-right text-sm">-</td>
                      </>
                    )}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* LIABILITIES & EQUITY TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-purple-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
            <Lock size={18} className="text-purple-600" />
            <h2 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Liabilities & Equity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase">Particulars</th>
                  <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase text-right">Amount (NPR)</th>
                  {comparePrevFy && (
                    <>
                      <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase text-right">Prev (NPR)</th>
                      <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase text-right">Var</th>
                      <th className="py-2.5 px-4 text-xs font-bold text-gray-600 uppercase text-right">%</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={comparePrevFy ? 5 : 2} className="py-12 text-center text-gray-500">
                      <RefreshCw className="animate-spin mx-auto mb-2 text-gray-400" size={24} />
                    </td>
                  </tr>
                ) : (
                  <>
                    {renderSection("CURRENT LIABILITIES", "current", "I", "text-red-600", false)}
                    {renderSection("NON-CURRENT LIABILITIES", "non_current", "II", "text-orange-600", false)}
                    {renderEquitySection()}
                  </>
                )}
              </tbody>
              {!loading && report?.totals && (
                <tfoot className="bg-[#F0FDF4] border-t-2 border-[#009966]/20">
                  <tr>
                    <td className="py-3 px-4 font-bold text-gray-900 uppercase tracking-wider text-sm">Total Liab. & Equity</td>
                    <td className={cn(
                      "py-3 px-4 font-bold text-right text-base",
                      report.totals.difference === 0 ? "text-[#009966]" : "text-red-600"
                    )}>
                      {formatNPR(report.totals.total_liabilities_equity)}
                    </td>
                    {comparePrevFy && (
                      <>
                        <td className="py-3 px-4 font-bold text-gray-500 text-right text-sm">
                          {formatNPR(report.liabilities.total_prev + report.equity.total_prev)}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-500 text-right text-sm">-</td>
                        <td className="py-3 px-4 font-bold text-gray-500 text-right text-sm">-</td>
                      </>
                    )}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Financial Analysis Section */}
      {!loading && report?.kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Key Ratios</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Ratio</span>
                  <span className="text-sm font-bold text-gray-900">{report.kpis.current_ratio} : 1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quick Ratio</span>
                  <span className="text-sm font-bold text-gray-900">{report.kpis.quick_ratio} : 1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Debt to Equity</span>
                  <span className="text-sm font-bold text-gray-900">{report.kpis.debt_to_equity} : 1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Return on Assets (ROA)</span>
                  <span className="text-sm font-bold text-[#009966]">{report.kpis.return_on_assets}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Return on Equity (ROE)</span>
                  <span className="text-sm font-bold text-[#009966]">{report.kpis.return_on_equity}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-5 h-[240px]">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">Assets Composition</h3>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getAssetData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getAssetData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `NPR ${formatNPR(value)}`} />
                    <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-5 h-[240px]">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">Liabilities Composition</h3>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getLiabilityData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getLiabilityData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `NPR ${formatNPR(value)}`} />
                    <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
