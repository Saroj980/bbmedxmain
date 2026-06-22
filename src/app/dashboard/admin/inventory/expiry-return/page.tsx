"use client";

import { useEffect, useState } from "react";
import { Package, Search, Undo2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Table, Tag, Card, Button, Tooltip } from "antd";
import dayjs from "dayjs";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function ExpiryReturnPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const fetchExpiredItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports/stock-status");
      const allData = res.data?.data || [];
      const expiredOnly = allData
        .filter((item: any) => item.expiry_date && dayjs(item.expiry_date).isBefore(dayjs()) && item.stock_qty > 0)
        .map((item: any, idx: number) => ({
          ...item,
          key: `${item.id || "r"}-${idx}`
        }));
      setData(expiredOnly);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiredItems();
  }, []);

  const filteredData = data.filter((item) =>
    (item.product?.name || "").toLowerCase().includes((search || "").toLowerCase()) ||
    (item.batch_no || "").toLowerCase().includes((search || "").toLowerCase())
  );

  const columns = [
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
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Expired At",
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (date: string) => (
        <span className="text-red-600 font-medium">
          {dayjs(date).format("MMM DD, YYYY")}
        </span>
      ),
    },
    {
      title: "Returnable Qty",
      dataIndex: "stock_qty",
      key: "stock_qty",
      render: (qty: number) => <span className="font-mono font-bold text-gray-700">{qty}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Tooltip title="Process return to supplier">
          <Button 
            type="primary" 
            size="small" 
            icon={<ArrowRight size={14} />}
            style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
            className="flex items-center gap-1"
          >
            Process Return
          </Button>
        </Tooltip>
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
          { label: "Expiry Return" },
        ]}
      />

      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
             Expiry Return
           </h1>
           <p className="text-gray-500 text-sm">Manage and process returns for items that have passed their expiry date.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            placeholder="Search expired items..."
            className="pl-10 pr-4 py-2 w-full bg-white rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-blue-200 transition shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-xl border-none overflow-hidden rounded-xl bg-[#f8fafc]">
        <Table
          dataSource={filteredData}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 12 }}
          className="professional-stock-table"
        />
      </Card>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 mt-4">
        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
           <Package size={20} />
        </div>
        <div>
          <h4 className="font-semibold text-blue-800">Return Workflow</h4>
          <p className="text-sm text-blue-700">
            Select items above to initiate a return voucher. This will generate a credit note for the supplier and adjust your stock accordingly.
          </p>
        </div>
      </div>

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
