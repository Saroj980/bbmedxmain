"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export default function MonthlyComparisonMatrix() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/dashboard/fiscal-comparison");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching fiscal comparison:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1000);

  const getProfitTrend = () => {
    if (data.length < 2) return null;
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    const lastProfit = last.income - last.expense;
    const prevProfit = prev.income - prev.expense;
    
    if (prevProfit === 0) return { val: 0, up: true };
    const diff = ((lastProfit - prevProfit) / Math.abs(prevProfit)) * 100;
    return { val: Math.abs(diff).toFixed(1), up: diff >= 0 };
  };

  const trend = getProfitTrend();

  return (
    <Card className="border-none shadow-premium bg-white h-full flex flex-col">
      <CardHeader className="pb-2 border-none flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <BarChart3 size={20} className="text-emerald-500" />
          Monthly Comparison Matrix
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expense</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex-1 flex flex-col gap-6">
        {loading ? (
          <div className="h-60 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-sm font-medium">Analyzing fiscal data...</span>
          </div>
        ) : (
          <>
            <div className="h-80 flex items-end justify-between gap-1 px-1 pt-24">
              {data.map((item: any, idx) => {
                const incHeight = maxVal > 0 ? (item.income / maxVal) * 100 : 0;
                const expHeight = maxVal > 0 ? (item.expense / maxVal) * 100 : 0;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-2 rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-2xl border border-white/10">
                      <p className="font-bold border-b border-white/10 pb-1 mb-1 text-center">{item.year}/{item.month}</p>
                      <div className="space-y-1 mt-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-emerald-400 font-bold">Income:</span>
                          <span className="font-black">{formatNepaliCurrency(item.income)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-rose-400 font-bold">Expense:</span>
                          <span className="font-black">{formatNepaliCurrency(item.expense)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end gap-1 w-full justify-center h-full relative">
                      {/* Expense Bar Group */}
                      <div className="flex flex-col items-center group/exp" style={{ height: `${expHeight}%` }}>
                        {item.expense > 0 && (
                          <div className="absolute -translate-y-full mb-1 flex flex-col items-center">
                             <span className="text-[8px] font-black text-rose-600 whitespace-nowrap mb-1">
                              {item.expense >= 1000 ? (item.expense / 1000).toFixed(1) + 'k' : item.expense.toFixed(0)}
                            </span>
                          </div>
                        )}
                        <div 
                          className="w-5 h-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-lg shadow-[0_-2px_10px_rgba(244,63,94,0.2)] transition-all duration-500 group-hover/exp:brightness-110 origin-bottom"
                          style={{ minHeight: '3px' }}
                        ></div>
                      </div>

                      {/* Income Bar Group */}
                      <div className="flex flex-col items-center group/inc" style={{ height: `${incHeight}%` }}>
                        {item.income > 0 && (
                          <div className="absolute -translate-y-full mb-1 flex flex-col items-center">
                            <span className="text-[8px] font-black text-emerald-600 whitespace-nowrap mb-1">
                              {item.income >= 1000 ? (item.income / 1000).toFixed(1) + 'k' : item.income.toFixed(0)}
                            </span>
                          </div>
                        )}
                        <div 
                          className="w-5 h-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg shadow-[0_-2px_10px_rgba(16,185,129,0.2)] transition-all duration-500 group-hover/inc:brightness-110 origin-bottom"
                          style={{ minHeight: '3px' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col items-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                        {item.year}/{item.month.substring(0, 3)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 pt-4 border-t border-slate-50 flex items-center justify-between">
              {trend && (
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-full ${trend.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trend.up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <span className={`text-xs font-bold ${trend.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Profit Trend {trend.up ? 'Up' : 'Down'} {trend.val}%
                  </span>
                </div>
              )}
              <span className="text-[10px] font-medium text-slate-400 italic">
                * Units in रु. based on active fiscal year
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
