"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar,
  LayoutGrid,
  FileText,
  Settings,
  Activity
} from "lucide-react";

import StatsCard from "@/components/dashboard/StatsCard";
import InventoryAlerts from "@/components/dashboard/InventoryAlerts";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


import PerformanceMatrix from "@/components/dashboard/PerformanceMatrix";
import FinancialTrend from "@/components/dashboard/FinancialTrend";
import MonthlyComparisonMatrix from "@/components/dashboard/MonthlyComparisonMatrix";
import RecentInvoices from "@/components/dashboard/RecentInvoices";
import { RupeeIcon } from "@/components/icons/RupeeIcon";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [kpis, setKpis] = useState({
    netRevenue: 0,
    stockWorth: 0,
    avgMargin: 0,
    receivables: 0
  });

  const fetchKpis = async () => {
    try {
      const response = await api.get("/dashboard/dashboard-kpis");
      setKpis(response.data);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
    }
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  const formatLargeNumber = (num: number) => {
    if (num >= 100000) return `${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString();
  };
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-1000">
      
      {/* --- FLIGHT DECK HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100i">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <LayoutGrid size={24} />
            </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              ERP <span className="text-emerald-600">Dashboard</span>
            </h1>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-11">
            Business Intelligence • <span className="text-emerald-500">My Pharmacy v2.1</span>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">

          <div className="h-8 w-px bg-slate-200 hidden md:block" />
          <Link href="/dashboard/admin/purchases/create">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 shadow-xl shadow-emerald-200/50 rounded-xl transition-all hover:scale-105 active:scale-95">
              <Package className="mr-2 h-4 w-4" /> New Purchase
            </Button>
          </Link>
          <Link href="/dashboard/admin/sales/create">
            <Button className="bg-slate-900 hover:bg-black text-white px-6 shadow-xl shadow-slate-200 rounded-xl transition-all hover:scale-105 active:scale-95">
              <ShoppingCart className="mr-2 h-4 w-4" /> New Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* --- QUICK OPERATIONS HUB --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <QuickButton icon={Package} label="Products" href="/dashboard/admin/products" color="bg-emerald-50 text-emerald-600" />
        <QuickButton icon={Users} label="Parties" href="/dashboard/admin/accounting/party-ledgers" color="bg-blue-50 text-blue-600" />
        <QuickButton icon={FileText} label="Billing" href="/dashboard/admin/sales/create" color="bg-indigo-50 text-indigo-600" />
        <QuickButton icon={ShoppingCart} label="Purchase" href="/dashboard/admin/purchases/create" color="bg-amber-50 text-amber-600" />
        <QuickButton icon={TrendingUp} label="Vouchers" href="/dashboard/admin/vouchers/all" color="bg-rose-50 text-rose-600" />
        <QuickButton icon={Settings} label="Config" href="/dashboard/admin/settings/system-settings" color="bg-slate-100 text-slate-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-4">
        
        {/* --- PRIMARY INTEL COLUMN (LEFT 8) --- */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          {/* Executive KPI Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              compact
              title="Net Revenue (LTR)"
              value={`रु. ${formatLargeNumber(kpis.netRevenue)}`}
              icon={RupeeIcon}
              trend="+12.5%"
              trendType="up"
              description="Month-to-Date"
              color="emerald"
            />
            <StatsCard 
              compact
              title="Stock Worth"
              value={`रु. ${formatLargeNumber(kpis.stockWorth)}`}
              icon={Package}
              trend="+2.4%"
              trendType="up"
              description="Total Valuation"
              color="blue"
            />
            <StatsCard 
              compact
              title="Avg. Margin"
              value={`${kpis.avgMargin.toFixed(1)}%`}
              icon={TrendingUp}
              trend="+0.6%"
              trendType="up"
              description="Gross Profitability"
              color="orange"
            />
            <StatsCard 
              compact
              title="Receivables"
              value={`रु. ${formatLargeNumber(kpis.receivables)}`}
              icon={FileText}
              trend="Check Risks"
              trendType="neutral"
              description="Customer Credit"
              color="slate"
            />
          </div>

          {/* Business Intelligence Hub (Monthly Comp & Distribution) */}
          <div className="grid grid-cols-1 gap-8">
            <FinancialTrend />
            <MonthlyComparisonMatrix />
            {/* <PerformanceMatrix /> */}
          </div>

          {/* Transaction Activity Feed */}
          <RecentInvoices />
        </div>


        {/* --- SECONDARY OPS COLUMN (RIGHT 4) --- */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          <InventoryAlerts />
          <FinancialOverview />


          
        </div>

      </div>

    </div>

  );
}

function QuickButton({ icon: Icon, label, href, color }: { icon: any, label: string, href: string, color: string }) {
  return (
    <a 
      href={href}
      className="group flex flex-col items-center justify-center p-4 bg-white rounded-2xl hover:shadow-extra-soft transition-all duration-300 border border-slate-50 hover:border-emerald-100"
    >
      <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform mb-2`}>
        <Icon size={20} />
      </div>
      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{label}</span>
    </a>
  );
}

