"use client";

import { useState, useEffect } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, ArrowDown, ArrowUp, Scale, CheckCircle, 
  XCircle, Filter, Download, Printer, RefreshCw, ChevronRight, ChevronDown 
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TrialBalancePage() {
  const [loading, setLoading] = useState(true);
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [selectedFyId, setSelectedFyId] = useState<string>("");
  const [selectedFyDateRange, setSelectedFyDateRange] = useState({ start: "", end: "" });
  const [asOnDate, setAsOnDate] = useState<string>("");
  const [showZeroBalance, setShowZeroBalance] = useState(false);
  const [search, setSearch] = useState("");
  const [accountType, setAccountType] = useState("all");
  
  const [data, setData] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({});
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchFiscalYears();
  }, []);

  useEffect(() => {
    if (selectedFyId) {
      const fy = fiscalYears.find((f) => f.id === parseInt(selectedFyId));
      if (fy) {
        // Adjust dates to simple YYYY-MM-DD
        const start = fy.ad_start.split('T')[0];
        const end = fy.ad_end.split('T')[0];
        setSelectedFyDateRange({ start, end });
        
        // Reset as on date to FY end if outside range, else keep current or use end
        const today = new Date().toISOString().split('T')[0];
        if (today >= start && today <= end) {
          setAsOnDate(today);
        } else {
          setAsOnDate(end);
        }
      }
    }
  }, [selectedFyId, fiscalYears]);

  useEffect(() => {
    if (selectedFyId && asOnDate) {
      fetchTrialBalance();
    }
  }, [selectedFyId, asOnDate]);

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

  const fetchTrialBalance = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/trial-balance", {
        params: {
          fiscal_year_id: selectedFyId,
          as_on_date: asOnDate,
        }
      });
      setData(buildTree(res.data.data));
      setTotals(res.data.totals);
    } catch (err) {
      toast.error("Failed to fetch trial balance");
    } finally {
      setLoading(false);
    }
  };

  // Turn flat data into tree structure
  const buildTree = (items: any[]) => {
    const map = new Map<number, any>();
    const roots: any[] = [];
    
    // Create map of clones
    items.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });
    
    // Build hierarchy
    items.forEach((item) => {
      if (item.parent_id && map.has(item.parent_id)) {
        map.get(item.parent_id).children.push(map.get(item.id));
      } else {
        roots.push(map.get(item.id));
      }
    });

    // Calculate rollups
    const calculateRollups = (node: any) => {
      if (node.children.length === 0) return node;

      // Deep clone original values for self to avoid double accumulating on re-renders
      let r_op_dr = node.opening_dr || 0;
      let r_op_cr = node.opening_cr || 0;
      let r_p_dr = node.period_dr || 0;
      let r_p_cr = node.period_cr || 0;
      let r_c_dr = node.closing_dr || 0;
      let r_c_cr = node.closing_cr || 0;

      node.children.forEach((child: any) => {
        calculateRollups(child);
        r_op_dr += child.opening_dr;
        r_op_cr += child.opening_cr;
        r_p_dr += child.period_dr;
        r_p_cr += child.period_cr;
        r_c_dr += child.closing_dr;
        r_c_cr += child.closing_cr;
      });

      node.opening_dr = r_op_dr;
      node.opening_cr = r_op_cr;
      node.period_dr = r_p_dr;
      node.period_cr = r_p_cr;
      node.closing_dr = r_c_dr;
      node.closing_cr = r_c_cr;

      return node;
    };

    roots.forEach(root => calculateRollups(root));

    return roots;
  };

  const toggleNode = (id: number) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Recursive render logic
  const renderRows = (nodes: any[], depth = 0): React.ReactNode[] => {
    let rows: React.ReactNode[] = [];
    
    nodes.forEach((node) => {
      // Check if this node or any of its descendants match the filters
      const hasVisibleDescendants = (n: any): boolean => {
        const nIsZero = n.opening_dr === 0 && n.opening_cr === 0 && 
                        n.period_dr === 0 && n.period_cr === 0 && 
                        n.closing_dr === 0 && n.closing_cr === 0;
        const nTypeMatch = accountType === "all" || n.type === accountType;
        const nSearchMatch = search === "" || 
                             n.name.toLowerCase().includes(search.toLowerCase()) || 
                             n.code.toLowerCase().includes(search.toLowerCase());
        const nSelfVisible = !((!showZeroBalance && nIsZero) || !nTypeMatch || !nSearchMatch);
        
        if (nSelfVisible) return true;
        return n.children.some((child: any) => hasVisibleDescendants(child));
      };

      if (hasVisibleDescendants(node)) {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id) || search !== ""; // Auto-expand on search

        // Determine if node ITSELF matches the filter (for highlighting or direct display if it had no children)
        // Even if the parent doesn't match search, if it has visible descendants, we render it so the tree isn't broken.
        
        rows.push(
          <tr 
            key={node.id} 
            className={cn(
              "border-b border-gray-100 hover:bg-gray-50/50 transition-colors",
              depth === 0 ? "font-medium bg-gray-50/30" : ""
            )}
          >
            <td className="py-3 px-4 text-sm text-gray-700">
              <div 
                className="flex items-center" 
                style={{ paddingLeft: `${depth * 1.5}rem` }}
              >
                {hasChildren ? (
                  <button 
                    onClick={() => toggleNode(node.id)}
                    className="mr-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                ) : (
                  <span className="w-6 inline-block"></span> // Placeholder
                )}
                {node.code}
              </div>
            </td>
            <td className="py-3 px-4 text-sm text-gray-800">{node.name}</td>
            <td className="py-3 px-4 text-sm text-gray-500 capitalize">{node.category || "-"}</td>
            <td className="py-3 px-4 text-sm text-gray-500 capitalize">{node.type}</td>
            
            <td className="py-3 px-4 text-sm text-right text-gray-600">
              {node.opening_dr > 0 ? node.opening_dr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
            </td>
            <td className="py-3 px-4 text-sm text-right text-gray-600">
              {node.opening_cr > 0 ? node.opening_cr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
            </td>
            
            <td className="py-3 px-4 text-sm text-right text-gray-600">
              {node.period_dr > 0 ? node.period_dr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
            </td>
            <td className="py-3 px-4 text-sm text-right text-gray-600">
              {node.period_cr > 0 ? node.period_cr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
            </td>
            
            <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
              {node.closing_dr > 0 ? node.closing_dr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
            </td>
            <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
              {node.closing_cr > 0 ? node.closing_cr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
            </td>
          </tr>
        );

        if (hasChildren && isExpanded) {
          rows = rows.concat(renderRows(node.children, depth + 1));
        }
      }
    });

    return rows;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-4">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Accounting", href: "/dashboard/admin/accounting" },
            { label: "Trial Balance" },
          ]}
        />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-[#2F3E46]">Trial Balance</h1>
            <p className="text-sm text-gray-500 mt-1">
              View account balances as of a selected date within a fiscal year.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => fetchTrialBalance()}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} className="text-gray-500" /> Refresh
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Printer size={16} className="text-gray-500" /> Print
            </button>
            {/* <button className="flex items-center gap-2 px-3 py-2 bg-[#009966] text-white rounded-md text-sm font-medium hover:bg-[#008255] transition-colors">
              <Download size={16} /> Export PDF
            </button> */}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#E6F5EE] flex items-center justify-center">
              <BookOpen size={20} className="text-[#009966]" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Accounts</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {loading ? "..." : (totals.total_accounts || 0)} 
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <ArrowDown size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Debit</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {loading ? "..." : `NPR ${(totals.closing_dr || 0).toLocaleString()}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <ArrowUp size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Credit</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {loading ? "..." : `NPR ${(totals.closing_cr || 0).toLocaleString()}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Scale size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Difference</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {loading ? "..." : `NPR ${(totals.difference || 0).toLocaleString()}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "shadow-sm border border-gray-100 relative overflow-hidden",
          totals.difference === 0 ? "bg-green-50/50" : "bg-red-50/50"
        )}>
          {totals.difference === 0 ? (
            <div className="absolute top-0 right-0 w-1 h-full bg-[#009966]"></div>
          ) : (
            <div className="absolute top-0 right-0 w-1 h-full bg-red-500"></div>
          )}
          
          <CardContent className="p-4 flex items-center gap-4 h-full">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              totals.difference === 0 ? "bg-[#009966] text-white" : "bg-red-500 text-white"
            )}>
              {totals.difference === 0 ? <CheckCircle size={20} /> : <XCircle size={20} />}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
              <p className={cn(
                "text-lg font-bold mt-0.5",
                totals.difference === 0 ? "text-[#009966]" : "text-red-600"
              )}>
                {loading ? "..." : (totals.difference === 0 ? "Balanced" : "Out of Balance")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
        
        <div className="w-full md:w-64">
          <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
            Search Account
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#009966] text-sm"
            placeholder="Name or Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
            Fiscal Year
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

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
            As On Date
          </label>
          <input
            type="date"
            className="w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#009966] text-sm"
            value={asOnDate}
            min={selectedFyDateRange.start}
            max={selectedFyDateRange.end}
            onChange={(e) => setAsOnDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
            Account Type
          </label>
          <select 
            className="w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#009966] text-sm capitalize"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="flex items-center gap-2 mb-2 ml-4">
          <input 
            type="checkbox" 
            id="zeroBalance"
            checked={showZeroBalance}
            onChange={(e) => setShowZeroBalance(e.target.checked)}
            className="rounded border-gray-300 text-[#009966] focus:ring-[#009966]"
          />
          <label htmlFor="zeroBalance" className="text-sm font-medium text-gray-700 cursor-pointer">
            Show Zero Balance
          </label>
        </div>

      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider" colSpan={4}>Account Details</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center border-l border-gray-200" colSpan={2}>Opening Balance</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center border-l border-gray-200" colSpan={2}>Period Activity</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center border-l border-gray-200" colSpan={2}>Closing Balance</th>
              </tr>
              <tr className="bg-white border-b border-gray-200 text-xs font-medium text-gray-500">
                <th className="py-2 px-4 w-32">Account Code</th>
                <th className="py-2 px-4">Account Name</th>
                <th className="py-2 px-4">Account Group</th>
                <th className="py-2 px-4">Type</th>
                <th className="py-2 px-4 text-right border-l border-gray-200">Debit (NPR)</th>
                <th className="py-2 px-4 text-right">Credit (NPR)</th>
                <th className="py-2 px-4 text-right border-l border-gray-200">Debit (NPR)</th>
                <th className="py-2 px-4 text-right">Credit (NPR)</th>
                <th className="py-2 px-4 text-right border-l border-gray-200">Debit (NPR)</th>
                <th className="py-2 px-4 text-right">Credit (NPR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    <RefreshCw className="animate-spin mx-auto mb-2 text-gray-400" size={24} />
                    Calculating Trial Balance...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                renderRows(data)
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    No account data found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
            {!loading && data.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan={4} className="py-4 px-4 text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Total
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right border-l border-gray-200">
                    {(totals.opening_dr || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right">
                    {(totals.opening_cr || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right border-l border-gray-200">
                    {(totals.period_dr || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right">
                    {(totals.period_cr || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right border-l border-gray-200">
                    {(totals.closing_dr || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right">
                    {(totals.closing_cr || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        
        {/* Footer info */}
        <div className="bg-white py-3 px-4 border-t border-gray-200 flex justify-between items-center text-sm">
          <span className="text-gray-500">
            {totals.difference === 0 ? (
              <span className="text-[#009966] font-medium flex items-center gap-1">
                <CheckCircle size={14} /> Trial Balance is Balanced
              </span>
            ) : (
              <span className="text-red-600 font-medium flex items-center gap-1">
                <XCircle size={14} /> Difference: NPR {(totals.difference || 0).toLocaleString()}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
