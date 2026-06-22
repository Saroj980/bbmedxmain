"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Boxes, Calendar, Package, Search } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Table, Tag, Card, Tabs, Select } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Breadcrumb } from "@/components/ui/breadcrumb";

dayjs.extend(relativeTime);

export default function ExpiryListPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchExpiryData = async () => {
    try {
      setLoading(true);
      // We can fetch all and filter client-side for better UX in this small set
      const res = await api.get("/reports/stock-status");
      const mappedData = (res.data?.data || []).map((item: any, idx: number) => ({
        ...item,
        key: `${item.id || "e"}-${idx}`
      }));
      setData(mappedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryData();
  }, []);

  const filteredData = data.filter((item) => {
    const isExpired = item.expiry_date && dayjs(item.expiry_date).isBefore(dayjs());
    const isNear = item.expiry_date && dayjs(item.expiry_date).isBefore(dayjs().add(90, "day")) && !isExpired;
    
    const matchesSearch = (item.product?.name || "").toLowerCase().includes((search || "").toLowerCase()) || 
                          (item.batch_no || "").toLowerCase().includes((search || "").toLowerCase());
    
    if (filter === "expired") return isExpired && matchesSearch;
    if (filter === "near") return isNear && matchesSearch;
    return (isExpired || isNear) && matchesSearch;
  });

  const columns = [
    {
      title: "Status",
      key: "status_tag",
      width: 120,
      render: (_: any, record: any) => {
        const isExpired = dayjs(record.expiry_date).isBefore(dayjs());
        return isExpired ? (
          <Tag color="error" className="uppercase font-bold">Expired</Tag>
        ) : (
          <Tag color="warning" className="uppercase font-bold">Near Expiry</Tag>
        );
      },
    },
    {
      title: "Product",
      dataIndex: ["product", "name"],
      key: "product_name",
      render: (text: string) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      title: "Batch No",
      dataIndex: "batch_no",
      key: "batch_no",
      render: (text: string) => <Tag color="blue" className="font-mono">{text}</Tag>,
    },
    {
      title: "Expiry Date",
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <span className={dayjs(date).isBefore(dayjs()) ? "text-red-600 font-bold" : "text-orange-600 font-medium"}>
            {dayjs(date).format("MMM DD, YYYY")}
          </span>
          <span className="text-xs text-gray-400">
            ({dayjs(date).fromNow()})
          </span>
        </div>
      ),
    },
    {
      title: "Current Stock",
      dataIndex: "stock_qty",
      key: "stock_qty",
      render: (qty: number) => (
        <span className="font-mono font-bold text-gray-700">{qty}</span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Inventory", href: "/dashboard/admin/inventory/stock" },
          { label: "Expiry Alerts" },
        ]}
      />

      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
             Expiry Alerts
           </h1>
           <p className="text-gray-500 text-sm">Monitor products that are expired or expiring within 90 days.</p>
        </div>

        <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    placeholder="Search product/batch..."
                    className="pl-10 pr-4 py-2 w-full bg-white rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-blue-200 transition shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Select 
                value={filter} 
                onChange={setFilter}
                className="w-32 h-9"
                options={[
                    { label: "All Alerts", value: "all" },
                    { label: "Expired", value: "expired" },
                    { label: "Near Expiry", value: "near" },
                ]}
            />
        </div>
      </div>

      <Card className="shadow-xl border-none overflow-hidden rounded-xl bg-[#f8fafc]">
        <Table
          dataSource={filteredData}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10 }}
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
          padding: 12px 16px !important;
        }
        .professional-stock-table .ant-table-tbody > tr > td {
          padding: 10px 16px !important;
          font-size: 13px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
}
