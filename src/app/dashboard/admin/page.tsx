"use client";

import {
  Package,
  ShoppingCart,
  AlertTriangle,
  Users,
  Truck,
  FileBarChart,
  Activity,
  DollarSign,
  CalendarDays,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  LucideIcon
} from "lucide-react";

import NprIcon from "@/components/icons/NprIcon";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    // <div className="container mx-auto px-4 py-4">
      <div className="space-y-8 animate-fadeIn">

        {/* PAGE HEADER */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-[#2F3E46]">
              Welcome back 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Here’s what’s happening with your inventory & business today.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg bg-[#009966] text-white font-medium shadow hover:bg-[#008456] transition">
              + New Sale
            </button>
            <button className="px-4 py-2 rounded-lg bg-[#33BBA2] text-white font-medium shadow hover:bg-[#2ca890] transition">
              + New Purchase
            </button>
          </div>
        </header>

        {/* KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          <KpiCard
            icon={Package}
            title="Total Products"
            value="1,245"
            trend="+3.4%"
            trendUp
          />

          <KpiCard
            icon={AlertTriangle}
            title="Low Stock Items"
            value="27"
            highlight="bg-red-100 text-red-700"
          />

          <KpiCard
            icon={NprIcon}
            title="Sales Today"
            value="रु. 54,200"
            trend="+12%"
            trendUp
          />

          <KpiCard
            icon={Users}
            title="Total Customers"
            value="312"
            trend="-1.2%"
            trendUp={false}
          />
        </section>

        {/* CHARTS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Sales Overview (Last 7 Days)"
            subtitle="Sales trend movement"
          />

          <ChartCard
            title="Purchase Overview (Last 7 Days)"
            subtitle="Purchase trend movement"
          />
        </section>

        {/* ALERTS & QUICK LINKS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Alerts */}
          <AlertPanel />

          {/* Quick Actions */}
          <QuickActions />
        </section>
      </div>
    // </div>
  );
}

/* -----------------------------------------------------------
   --- COMPONENTS ---
----------------------------------------------------------- */

function KpiCard({
  icon: Icon,
  title,
  value,
  trend,
  trendUp = true,
  highlight,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  highlight?: string;
}) {
  return (
    <Card
      className={`
        backdrop-blur bg-white/70 shadow-sm border border-gray-200 hover:shadow-md 
        transition-all p-0 overflow-hidden
        ${highlight ? highlight : ""}
      `}
    >
      <CardContent className="p-5 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#009966] to-[#33BBA2] text-white shadow-md">
          <Icon size={26} />
        </div>

        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-2xl font-semibold">{value}</h3>
        </div>

        {trend && (
          <div
            className={`flex items-center text-sm font-semibold ${
              trendUp ? "text-green-600" : "text-red-600"
            }`}
          >
            {trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
interface ChartCardProps {
  title: string;
  subtitle?: string;
}

function ChartCard({ title, subtitle }: ChartCardProps) {
  return (
    <Card className="shadow-sm border border-gray-200 backdrop-blur bg-white/70">
      <CardHeader>
        <CardTitle className="font-heading text-lg">{title}</CardTitle>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="h-48 border border-dashed rounded-lg flex items-center justify-center text-gray-400 text-sm">
          Chart coming soon...
        </div>
      </CardContent>
    </Card>
  );
}

function AlertPanel() {
  return (
    <Card className="shadow-sm border border-gray-200 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-heading">
          <AlertTriangle size={20} className="text-red-500" />
          Alerts & Notifications
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

        {/* Low stock alert */}
        <div className="p-3 rounded-lg bg-red-50 border-l-4 border-red-400">
          <p className="text-sm text-red-800 font-semibold">Low Stock</p>
          <p className="text-xs text-red-700">
            27 items need urgent restocking.
          </p>
        </div>

        {/* Expiry alert */}
        <div className="p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-700 font-semibold">Expiring Soon</p>
          <p className="text-xs text-yellow-600">
            12 medicines are nearing expiry.
          </p>
        </div>

        {/* Due payment */}
        <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-400">
          <p className="text-sm text-blue-800 font-semibold">Pending Payments</p>
          <p className="text-xs text-blue-700">
            ₹ 32,900 pending from customers.
          </p>
        </div>

      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    {
      label: "Create Product",
      icon: Package,
      href: "/products/create",
    },
    {
      label: "Add Sale",
      icon: ShoppingCart,
      href: "/sales/add",
    },
    {
      label: "Add Purchase",
      icon: Truck,
      href: "/purchases/add",
    },
    {
      label: "Stock Overview",
      icon: BarChart3,
      href: "/stock",
    },
    {
      label: "Expiry Returns",
      icon: CalendarDays,
      href: "/expiry",
    },
    {
      label: "Accounting Dashboard",
      icon: FileBarChart,
      href: "/accounting",
    },
  ];

  return (
    <Card className="shadow-sm border bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="font-heading text-lg">Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="p-4 rounded-xl bg-white shadow hover:shadow-lg flex items-center gap-3 border hover:bg-[#E9FFF5] transition"
          >
            <div className="p-3 bg-[#33BBA2] text-white rounded-lg shadow">
              <action.icon size={22} />
            </div>
            <span className="font-medium text-[#2F3E46]">{action.label}</span>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
