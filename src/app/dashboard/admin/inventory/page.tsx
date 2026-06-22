"use client";

import { 
  Layers, 
  Package, 
  AlertTriangle, 
  Calendar, 
  ArrowRight, 
  History, 
  TrendingUp, 
  Box,
  ClipboardList,
  RotateCcw,
  Search
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import InventoryAlerts from "@/components/dashboard/InventoryAlerts";

export default function InventoryDashboard() {
  const quickLinks = [
    { label: "Stock Status", href: "/dashboard/admin/inventory/stock", icon: Layers, color: "bg-blue-50 text-blue-600", description: "Real-time stock levels" },
    { label: "Batch Management", href: "/dashboard/admin/inventory/batches", icon: Box, color: "bg-emerald-50 text-emerald-600", description: "Track specific batches" },
    { label: "Expiry List", href: "/dashboard/admin/inventory/expiry", icon: Calendar, color: "bg-amber-50 text-amber-600", description: "Check near-expiry items" },
    { label: "Stock Register", href: "/dashboard/admin/inventory/stock-register", icon: ClipboardList, color: "bg-indigo-50 text-indigo-600", description: "Movement history" },
    { label: "Expiry Returns", href: "/dashboard/admin/inventory/expiry-return", icon: RotateCcw, color: "bg-rose-50 text-rose-600", description: "Manage returns" },
    { label: "Movement Logs", href: "/dashboard/admin/stock/stock-in-out", icon: History, color: "bg-slate-50 text-slate-600", description: "In/Out activity" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Inventory Hub" },
        ]}
      />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#163A5F] text-white shadow-lg shadow-slate-200">
              <Layers size={24} />
            </div>
            Inventory <span className="text-[#163A5F]">Intelligence Hub</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-12">
            Central command for stock monitoring, batch tracking, and expiry management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#163A5F]/10 transition-all"
            />
          </div>
          <Button className="bg-[#163A5F] hover:bg-[#1E4C75] text-white px-6 rounded-xl shadow-lg shadow-slate-200 transition-all hover:scale-105 active:scale-95">
            <Package className="mr-2 h-4 w-4" /> Stock In/Out
          </Button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total SKUs" 
          value="1,245" 
          trend="+12 New" 
          color="blue" 
          icon={Box} 
        />
        <StatCard 
          title="Stock Valuation" 
          value="रु. 42.80L" 
          trend="+2.4% vs LY" 
          color="emerald" 
          icon={TrendingUp} 
        />
        <StatCard 
          title="Critical Shortage" 
          value="18 Items" 
          trend="Needs Restock" 
          color="rose" 
          icon={AlertTriangle} 
        />
        <StatCard 
          title="Near Expiry" 
          value="24 Batches" 
          trend="Check Returns" 
          color="amber" 
          icon={Calendar} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Quick Navigation & Deep Insights */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Quick Access Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Inventory Modules</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {quickLinks.map((link, idx) => (
                <Link 
                  key={idx} 
                  href={link.href}
                  className="group p-5 bg-white rounded-2xl border border-slate-50 hover:border-[#163A5F]/20 hover:shadow-premium transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <link.icon size={24} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#163A5F] transition-colors">{link.label}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{link.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Stock Distribution / Placeholder for Chart */}
          <Card className="border-none shadow-premium bg-white overflow-hidden">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-500" />
                Inventory Turnover Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex items-center justify-center bg-slate-50/50 min-h-[300px]">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <TrendingUp size={32} />
                </div>
                <p className="text-sm font-bold text-slate-500">Visualization Engine Loading...</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">This chart will display monthly turnover rates and category-wise stock velocity.</p>
                <Button variant="outline" className="mt-4 rounded-xl text-xs font-bold">Configure Analysis</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Alerts & Radar */}
        <div className="xl:col-span-4 space-y-8">
          <InventoryAlerts />
          
          {/* Quick Action Card */}
          <Card className="border-none shadow-premium bg-slate-900 text-white overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="p-2 rounded-xl bg-white/10 text-white">
                  <ClipboardList size={24} />
                </div>
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold">Stock Reconciliation</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Last physical audit was 12 days ago. Schedule a new reconciliation for the <span className="text-emerald-400 font-bold">Surgical</span> category.
              </p>
              <Button className="w-full mt-6 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl flex items-center justify-center group">
                Start Audit <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, trend, color, icon: Icon }: { title: string, value: string, trend: string, color: string, icon: any }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500 text-blue-500 shadow-blue-100",
    emerald: "bg-emerald-500 text-emerald-500 shadow-emerald-100",
    rose: "bg-rose-500 text-rose-500 shadow-rose-100",
    amber: "bg-amber-500 text-amber-500 shadow-amber-100",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-50 shadow-soft hover:shadow-premium transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl bg-slate-50 ${colors[color].split(' ')[1]}`}>
          <Icon size={20} />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-50 ${colors[color].split(' ')[1]}`}>
          {trend}
        </span>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <h2 className="text-2xl font-black text-slate-900 mt-1">{value}</h2>
    </div>
  );
}
