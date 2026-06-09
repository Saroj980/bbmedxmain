"use client";

import { TrendingUp, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Package } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PerformanceMatrix() {
  const monthlyData = [
    { month: "Magh", sales: 85, purchase: 65 },
    { month: "Falgun", sales: 92, purchase: 80 },
    { month: "Chaitra", sales: 78, purchase: 95 }, // Stock heavy month
    { month: "Baishakh", sales: 110, purchase: 70 }, // High profit month
  ];

  const categories = [
    { name: "Antibiotics", value: 45, color: "bg-emerald-500", capital: "रु. 12.5L" },
    { name: "Surgical", value: 25, color: "bg-blue-500", capital: "रु. 8.2L" },
    { name: "General Wellness", value: 20, color: "bg-amber-500", capital: "रु. 5.4L" },
    { name: "Others", value: 10, color: "bg-slate-400", capital: "रु. 2.1L" },
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Monthly Sales vs Purchase Matrix */}
      <Card className="border-none shadow-premium bg-white overflow-hidden">
        <CardHeader className="pb-2 border-b border-slate-50 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <BarChart3 size={20} className="text-indigo-500" />
            Monthly Comparison Matrix
          </CardTitle>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"/> Sales</div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-rose-500"/> Purchase</div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-stretch justify-between h-48 gap-4 mb-4">
            {monthlyData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end items-center gap-3">
                <div className="w-full flex items-end justify-center gap-1.5 h-full relative">
                  {/* Purchase Bar */}
                  <div 
                    className="w-full max-w-[20px] bg-rose-500 rounded-t-lg transition-all duration-1000 relative group shadow-lg shadow-rose-100"
                    style={{ height: `${Math.min(data.purchase, 100)}%`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[8px] px-1 py-0.5 rounded font-black z-10 shadow-sm">
                      {data.purchase}k
                    </div>
                  </div>
                  {/* Sales Bar */}
                  <div 
                    className="w-full max-w-[20px] bg-emerald-500 rounded-t-lg transition-all duration-1000 relative group shadow-lg shadow-emerald-100"
                    style={{ height: `${Math.min(data.sales, 100)}%`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[8px] px-1 py-0.5 rounded font-black z-10 shadow-sm">
                      {data.sales}k
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{data.month}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <TrendingUp size={16} />
              <span>Profit Trend Up +14.2%</span>
            </div>
            <div className="text-[10px] font-medium text-slate-400">
              * Units in रु. '000s
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capital Distribution Matrix */}
      <Card className="border-none shadow-premium bg-white overflow-hidden">
        <CardHeader className="pb-2 border-b border-slate-50">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <PieChart size={20} className="text-amber-500" />
            Capital Weight Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-5">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                    <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-900">{cat.capital} <span className="text-slate-400 font-medium font-mono">({cat.value}%)</span></span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${cat.color} rounded-full transition-all duration-1000`} 
                    style={{ width: `${cat.value}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white shadow-sm text-indigo-500">
                <Package size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">BI Insight</p>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-0.5">
                  Over <span className="text-indigo-600 font-bold">45% of capital</span> is currently locked in Antibiotics. Turnover in this category is slowing. 
                  <span className="ml-1 text-indigo-500 cursor-pointer hover:underline">Optimize reorder levels?</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
