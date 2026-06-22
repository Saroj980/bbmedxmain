"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Table, Tag, Card, DatePicker, Select } from "antd";
import { Search, TrendingUp, TrendingDown, Printer, ArrowUpDown } from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import dayjs from "dayjs";

import { ADToBS, BSToAD } from "bikram-sambat-js";
import NepaliBsDatePicker from "@/components/common/NepaliBsDatePicker";
const { Option } = Select;
export default function StockRegisterPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  
  const [from, setFrom] = useState<string>(() => {
    try {
      const currentBS = ADToBS(dayjs().format("YYYY-MM-DD"));
      const startBS = currentBS.substring(0, 7) + "-01";
      return BSToAD(startBS);
    } catch {
      return dayjs().startOf('month').format("YYYY-MM-DD");
    }
  });

  const [to, setTo] = useState<string>(() => dayjs().format("YYYY-MM-DD"));

  const fetchRegister = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (typeFilter) params.type = typeFilter;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get("/reports/stock-register", { params });
      setData(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, from, to]);

  useEffect(() => {
    fetchRegister();
  }, [fetchRegister]);

  const filtered = data.filter((r) =>
    (r.product || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.batch_no || "").toLowerCase().includes(search.toLowerCase())
  );

  const totals = filtered.reduce(
    (acc, r) => ({ in: acc.in + Number(r.stock_in || 0), out: acc.out + Number(r.stock_out || 0) }),
    { in: 0, out: 0 }
  );

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (d: string) => (
        <span className="text-xs text-gray-500">{dayjs(d).format("MMM DD, YYYY")}</span>
      ),
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (t: string) => <span className="font-semibold text-gray-800">{t}</span>,
    },
    {
      title: "Batch No",
      dataIndex: "batch_no",
      key: "batch_no",
      render: (t: string) => <span className="font-mono text-blue-600 text-xs font-bold">{t}</span>,
    },
    {
      title: "Type",
      dataIndex: "reference_type",
      key: "type",
      render: (t: string, r: any) => {
        // Extract class name from PHP namespace e.g. "App\Models\Sale" → "sale"
        const raw = (t || r.type || "").split("\\").pop()?.toLowerCase() || "manual";
        const label = raw === "purchase" ? "Purchase" : raw === "sale" ? "Sale" : raw === "return" ? "Return" : raw.charAt(0).toUpperCase() + raw.slice(1);
        const color = raw === "purchase" ? "green" : raw === "sale" ? "red" : raw === "return" ? "orange" : "default";
        return <Tag color={color} className="text-xs font-bold uppercase">{label}</Tag>;
      },
    },
    {
      title: "Stock IN",
      dataIndex: "stock_in",
      key: "stock_in",
      className: "text-right",
      render: (v: number, r: any) =>
        v > 0 ? (
          <span className="flex items-center justify-end gap-1 text-green-700 font-bold font-mono">
            <TrendingUp size={12} /> +{v}
            <span className="text-[10px] font-normal text-green-600">{r.base_unit_name}</span>
          </span>
        ) : (
          <span className="text-gray-300 text-center block">—</span>
        ),
    },
    {
      title: "Stock OUT",
      dataIndex: "stock_out",
      key: "stock_out",
      className: "text-right",
      render: (v: number, r: any) =>
        v > 0 ? (
          <span className="flex items-center justify-end gap-1 text-red-600 font-bold font-mono">
            <TrendingDown size={12} /> -{v}
            <span className="text-[10px] font-normal text-red-400">{r.base_unit_name}</span>
          </span>
        ) : (
          <span className="text-gray-300 text-center block">—</span>
        ),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      className: "text-right",
      render: (v: number, r: any) => (
        <span className={`font-mono font-black ${v <= 0 ? "text-red-500" : "text-blue-700"}`}>
          {v} <span className="text-[10px] font-normal opacity-60">{r.base_unit_name}</span>
        </span>
      ),
    },
    {
      title: "By",
      dataIndex: "performed_by",
      key: "performed_by",
      render: (t: string) => <span className="text-xs text-gray-500 italic">{t || "System"}</span>,
    },
  ];

  const handlePrint = () => {
    sessionStorage.setItem("stock_register_data", JSON.stringify(filtered));
    sessionStorage.setItem("stock_register_filters", JSON.stringify({
      type: typeFilter,
      from: from || "",
      to: to || "",
    }));
    window.open("/dashboard/admin/inventory/stock-register/print", "_blank");
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Inventory", href: "/dashboard/admin/inventory/stock" },
          { label: "Stock Register" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <ArrowUpDown size={22} className="text-[#009966]" />
            Stock Register
          </h1>
          <p className="text-gray-500 text-sm">Complete real-time log of all stock movements (IN &amp; OUT)</p>
        </div>

        <UIButton
          onClick={handlePrint}
          className="bg-[#009966] hover:bg-[#008855] text-white rounded-xl px-6 font-semibold shadow-sm border-none flex items-center gap-2 h-10"
          disabled={filtered.length === 0}
        >
          <Printer size={18} />
          <span className="hidden sm:inline">Print Report</span>
        </UIButton>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product or batch..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#009966]/30"
          />
        </div>

        <div className="flex items-center gap-2">
           <NepaliBsDatePicker 
            value={from ? ADToBS(from) : ""}
            onChange={(adDate) => setFrom(adDate || "")}
           />
           <span className="text-gray-400 font-bold">to</span>
           <NepaliBsDatePicker 
            value={to ? ADToBS(to) : ""}
            onChange={(adDate) => setTo(adDate || "")}
           />
        </div>

        <Select
          value={typeFilter || undefined}
          placeholder="Movement Type"
          allowClear
          onChange={(v) => setTypeFilter(v || "")}
          className="min-w-[150px]"
        >
          <Option value="purchase">Purchase (IN)</Option>
          <Option value="sale">Sale (OUT)</Option>
          <Option value="return">Return</Option>
          <Option value="adjustment">Adjustment</Option>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Total Records</p>
          <p className="text-2xl font-black text-gray-800">{filtered.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 shadow-sm p-4">
          <p className="text-xs text-green-700 uppercase tracking-wide font-bold">Total IN</p>
          <p className="text-2xl font-black text-green-700">+{totals.in}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 shadow-sm p-4">
          <p className="text-xs text-red-700 uppercase tracking-wide font-bold">Total OUT</p>
          <p className="text-2xl font-black text-red-600">-{totals.out}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 shadow-sm p-4">
          <p className="text-xs text-blue-700 uppercase tracking-wide font-bold">Net Balance</p>
          <p className={`text-2xl font-black ${totals.in - totals.out >= 0 ? "text-blue-700" : "text-red-600"}`}>
            {totals.in - totals.out}
          </p>
        </div>
      </div>

      <Card className="shadow-xl border-none overflow-hidden rounded-xl bg-[#f8fafc]">
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey={(r) => `${r.batch_no}-${r.date}-${r.stock_in}-${r.stock_out}`}
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="small"
          rowClassName={(r) =>
            r.stock_in > 0 ? "bg-green-50/30" : r.stock_out > 0 ? "bg-red-50/30" : ""
          }
          className="professional-stock-table"
        />
      </Card>

      <style jsx global>{`
        .professional-stock-table .ant-table-thead > tr > th {
          background-color: #009966 !important;
          color: white !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 0.05em !important;
          border-bottom: 2px solid #008855 !important;
          padding: 10px 12px !important;
        }
        .professional-stock-table .ant-table-tbody > tr > td {
          padding: 8px 12px !important;
          font-size: 12px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
}
