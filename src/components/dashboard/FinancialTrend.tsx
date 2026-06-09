"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Calendar, Loader2, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

interface TrendDay {
  day: number;
  income: number;
  expense: number;
}

export default function FinancialTrend() {
  const [data, setData] = useState<TrendDay[]>([]);
  const [monthName, setMonthName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<TrendDay | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // State for Nepali Calendar selection
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  const months = [
    { value: 1, label: "Baisakh" }, { value: 2, label: "Jestha" }, { value: 3, label: "Ashadh" },
    { value: 4, label: "Shrawan" }, { value: 5, label: "Bhadra" }, { value: 6, label: "Ashwin" },
    { value: 7, label: "Kartik" }, { value: 8, label: "Mangsir" }, { value: 9, label: "Poush" },
    { value: 10, label: "Magh" }, { value: 11, label: "Falgun" }, { value: 12, label: "Chaitra" }
  ];

  const fetchData = async (year?: number, month?: number) => {
    setLoading(true);
    try {
      const params: any = {};
      if (year || selectedYear) params.year = year || selectedYear;
      if (month || selectedMonth) params.month = month || selectedMonth;

      const response = await api.get("/dashboard/financial-trend", { params });
      setData(response.data.data);
      setMonthName(response.data.month_name);
      
      const [mName, yStr] = response.data.month_name.split(" ");
      if (!year && !selectedYear) setSelectedYear(parseInt(yStr));
      if (!month && !selectedMonth) setSelectedMonth(months.find(m => m.label === mName)?.value || 1);
      
    } catch (error) {
      console.error("Error fetching trend data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1000);
  const chartHeight = 150;
  const chartWidth = 600;

  const getPoints = (type: 'income' | 'expense') => {
    if (data.length === 0) return "";
    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * chartWidth;
      const y = chartHeight - (d[type] / maxVal) * chartHeight;
      return `${x},${y}`;
    }).join(" ");
  };

  return (
    <Card className="border-none shadow-premium bg-white overflow-hidden">
      <CardHeader className="pb-2 border-b border-slate-50 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <TrendingUp size={20} className="text-indigo-500" />
          Financial Flow Trend
        </CardTitle>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold uppercase tracking-tight text-slate-400">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/> Income</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"/> Expense</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
            <select 
              value={selectedMonth} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSelectedMonth(val);
                fetchData(selectedYear, val);
              }}
              className="bg-transparent text-[10px] font-bold text-slate-600 outline-none cursor-pointer px-1"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <div className="w-px h-3 bg-slate-200" />
            <select 
              value={selectedYear} 
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSelectedYear(val);
                fetchData(val, selectedMonth);
              }}
              className="bg-transparent text-[10px] font-bold text-slate-600 outline-none cursor-pointer px-1"
            >
              {[2080, 2081, 2082, 2083, 2084, 2085].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
          
          <button 
            onClick={() => fetchData()} 
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex flex-col gap-6">
        {loading && data.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-xs font-medium">Crunching transaction data...</span>
          </div>
        ) : (
          <div className="relative">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-40 overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Vertical Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                <line 
                  key={`v-${i}`}
                  x1={chartWidth * p} y1="0" 
                  x2={chartWidth * p} y2={chartHeight} 
                  stroke="#f8fafc" 
                  strokeWidth="1" 
                />
              ))}

              {/* Horizontal Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                <line 
                  key={`h-${i}`}
                  x1="0" y1={chartHeight * p} 
                  x2={chartWidth} y2={chartHeight * p} 
                  stroke="#f1f5f9" 
                  strokeWidth="1" 
                />
              ))}

              {/* Expense Area */}
              <path
                d={`M ${getPoints('expense')} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                fill="url(#expenseGradient)"
                className="opacity-10 transition-all duration-1000"
              />

              {/* Income Area */}
              <path
                d={`M ${getPoints('income')} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                fill="url(#incomeGradient)"
                className="opacity-10 transition-all duration-1000"
              />

              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Expense Line */}
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getPoints('expense')}
                className="drop-shadow-sm transition-all duration-1000"
              />

              {/* Income Line */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getPoints('income')}
                className="drop-shadow-sm transition-all duration-1000"
              />

              {/* Hover Zones */}
              {data.map((d, i) => {
                const x = (i / (data.length - 1)) * chartWidth;
                const width = chartWidth / (data.length - 1);
                return (
                  <rect
                    key={`hit-${i}`}
                    x={x - width / 2}
                    y="0"
                    width={width}
                    height={chartHeight}
                    fill="transparent"
                    onMouseEnter={(e) => {
                      setHoveredDay(d);
                      setMousePos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseMove={(e) => {
                      setMousePos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="cursor-crosshair"
                  />
                );
              })}
            </svg>

            {/* Tooltip */}
            {hoveredDay && (
              <div 
                className="fixed z-50 pointer-events-none bg-white/95 backdrop-blur-sm border border-slate-100 shadow-xl rounded-xl p-3 min-w-[140px] transform -translate-x-1/2 -translate-y-[calc(100%+20px)] transition-all duration-200"
                style={{ left: mousePos.x, top: mousePos.y }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Day {hoveredDay.day}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-medium text-slate-500">Income</span>
                    <span className="text-xs font-bold text-emerald-600">रु. {hoveredDay.income.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-medium text-slate-500">Expense</span>
                    <span className="text-xs font-bold text-rose-600">रु. {hoveredDay.expense.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* X-Axis labels */}
            <div className="flex justify-between mt-4 px-1">
              {[1, 7, 14, 21, data.length].map((day, idx) => (
                <span key={day} className="text-[10px] font-bold text-slate-400">
                  Day {day}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex gap-6">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Income</p>
              <p className="text-sm font-bold text-emerald-600">
                रु. {data.reduce((acc, d) => acc + d.income, 0).toLocaleString()}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Expense</p>
              <p className="text-sm font-bold text-rose-600">
                रु. {data.reduce((acc, d) => acc + d.expense, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg flex items-center gap-1">
            <Calendar size={12} />
            {monthName || "Current Month"} (B.S.)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
