"use client";

import { useEffect, useState } from "react";
import { FileText, Eye, Download, MoreVertical, ArrowUpRight, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Transaction {
  numeric_id: number;
  id: string;
  client: string;
  date: string;
  nepali_date: string;
  amount: string;
  status: string;
  type: string;
}

export default function RecentInvoices() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/dashboard/recent-activities");
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-emerald-100 text-emerald-600";
      case "Pending": return "bg-amber-100 text-amber-600";
      case "Received": return "bg-blue-100 text-blue-600";
      case "Overdue": return "bg-rose-100 text-rose-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <Card className="border-none shadow-premium bg-white overflow-hidden">
      <CardHeader className="pb-2 border-none flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <FileText size={20} className="text-indigo-500" />
          Recent Transaction Activity
        </CardTitle>
        <Button 
          onClick={() => window.location.href = '/dashboard/admin/vouchers/all'}
          variant="ghost" 
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
        >
          View All Transactions <ArrowUpRight size={14} className="ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 max-h-[400px] overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 sticky top-0 bg-white z-10">
                <th className="text-left py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Reference</th>
                <th className="text-left py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Party / Client</th>
                <th className="text-left py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Date</th>
                <th className="text-right py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Amount</th>
                <th className="text-center py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Status</th>
                <th className="text-center py-3 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="animate-spin inline-block mr-2 text-slate-400" size={20} />
                    <span className="text-xs font-medium text-slate-400">Synchronizing transactions...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs font-medium text-slate-400">
                    No recent transaction activity found.
                  </td>
                </tr>
              ) : (
                transactions.map((inv, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-0">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">{inv.id}</span>
                        <span className="text-[10px] font-medium text-slate-400">{inv.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-slate-700">{inv.client}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{inv.nepali_date}</span>
                        <span className="text-[9px] font-medium text-slate-400">{inv.date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-xs font-black text-slate-900">{inv.amount}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${getStatusColor(inv.status)}`}>
                          {inv.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => window.open(`/dashboard/admin/vouchers/print/${inv.numeric_id}`, '_blank')}
                          className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-indigo-600 transition-all"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50/30 flex justify-center">
          <p className="text-[10px] font-medium text-slate-400 italic">Showing last 10 payment and receipt activities</p>
        </div>
      </CardContent>
    </Card>
  );
}
