"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, ArrowRight, PackageSearch, Loader2, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface ExpiringItem {
  name: string;
  batch: string;
  days: number;
  nepali_expiry: string;
}

interface StockItem {
  name: string;
  stock: number;
  min: number;
}

interface RadarData {
  expiring: ExpiringItem[];
  lowStock: StockItem[];
}

export default function InventoryAlerts() {
  const [data, setData] = useState<RadarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/dashboard/inventory-radar");
      setData(response.data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      console.error("Error fetching radar data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalAlerts = (data?.expiring.length || 0) + (data?.lowStock.length || 0);

  return (
    <Card className="border-none shadow-premium bg-white h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2 border-none">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <PackageSearch size={22} className="text-emerald-500" />
            Inventory Radar
          </CardTitle>
          <div className="flex items-center gap-2">
            {totalAlerts > 0 && (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-full">
                {totalAlerts} Alerts
              </span>
            )}
            <button 
              onClick={fetchData}
              disabled={loading}
              className="text-slate-400 hover:text-emerald-500 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 p-4 space-y-6 flex-grow overflow-y-auto">
        {loading && !data ? (
          <div className="space-y-4 py-8 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin" size={24} />
            <p className="text-xs font-medium">Scanning inventory...</p>
          </div>
        ) : (
          <>
            {/* Expiring Batches */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5 px-1">
                <Clock size={14} />
                Expiring Batches
              </h4>
              <div className="space-y-2">
                {data?.expiring.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic px-2">No batches expiring soon.</p>
                ) : (
                  data?.expiring.map((item, idx) => (
                    <div 
                      key={idx}
                      className="group relative p-3 rounded-xl border border-slate-50 hover:border-amber-100 hover:bg-amber-50/30 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            Batch: {item.batch} • {item.nepali_expiry}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          item.days <= 15 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                        }`}>
                          {item.days <= 0 ? "Expired" : `In ${item.days} days`}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Low Stock Items */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5 px-1">
                <AlertTriangle size={14} />
                Low Stock Items
              </h4>
              <div className="space-y-2">
                {data?.lowStock.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic px-2">Stock levels are healthy.</p>
                ) : (
                  data?.lowStock.map((item, idx) => {
                    const progress = Math.min(100, (item.stock / item.min) * 100);
                    return (
                      <div 
                        key={idx}
                        className="group relative p-3 rounded-xl border border-slate-50 hover:border-rose-100 hover:bg-rose-50/30 transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Current: <span className="font-bold text-slate-600">{item.stock}</span> / Target: {item.min}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-1 bg-rose-100 text-rose-600 rounded-lg">
                            -{Math.max(0, item.min - item.stock)} units
                          </span>
                        </div>
                        {/* Custom Progress Bar */}
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              progress < 25 ? "bg-rose-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>

    </Card>
  );
}
