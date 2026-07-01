"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Printer, 
  RotateCcw, 
  Search, 
  Filter,
  Package,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Banknote
} from "lucide-react";
import { api } from "@/lib/api";
import { Table, Tag, Button, Card, Tooltip } from "antd";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function StockStatusPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [asOfDate, setAsOfDate] = useState("");

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await api.get("/stock/status");
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // Data Transformation for Grouping
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      (item.product_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.sku || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.category_name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const metrics = useMemo(() => {
    let totalValue = 0;
    let lowStock = 0;
    let okStock = 0;
    const catValues: Record<string, number> = {};

    filteredData.forEach(item => {
      totalValue += Number(item.est_value) || 0;
      if (item.status === 'Alert') lowStock += 1;
      else okStock += 1;

      const catName = item.category_name || "Uncategorized";
      catValues[catName] = (catValues[catName] || 0) + (Number(item.est_value) || 0);
    });

    const topCategories = Object.entries(catValues)
      .map(([name, val]) => ({ name, val }))
      .sort((a, b) => b.val - a.val)
      .slice(0, 4);

    return { 
      totalValue, 
      totalItems: filteredData.length, 
      lowStock, 
      okStock, 
      topCategories 
    };
  }, [filteredData]);

  const transformedData = useMemo(() => {
    const grouped: any[] = [];
    const categories = Array.from(new Set(filteredData.map(i => i.category_name)));

    categories.forEach((cat, cIdx) => {
      // Add Category Header
      grouped.push({
        key: `cat-${cIdx}`,
        product_name: cat,
        isCategory: true
      });

      // Add Products
      filteredData
        .filter(i => i.category_name === cat)
        .forEach((prod, pIdx) => {
          grouped.push({
            ...prod,
            key: `prod-${prod.product_id}-${pIdx}`
          });
        });
    });

    return grouped;
  }, [filteredData]);

  const columns = [
    {
      title: "#",
      key: "sn",
      width: 60,
      render: (_: any, record: any, index: number) => {
        if (record.isCategory) return null;
        return <span className="text-gray-500">{index + 1}</span>;
      },
    },
    {
      title: "Category / Product Name",
      dataIndex: "product_name",
      key: "product_name",
      render: (text: string, record: any) => {
        if (record.isCategory) {
          return <span className="font-bold text-primary flex items-center gap-1">{text}</span>;
        }
        return <span className="pl-6 font-medium">{text}</span>;
      },
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (text: string, record: any) => record.isCategory ? null : (text || "-"),
    },
    {
      title: "For Sale",
      dataIndex: "for_sale_qty",
      key: "for_sale_qty",
      render: (v: number, record: any) => record.isCategory ? null : (
        <span className="text-green-600 font-semibold">{v.toFixed(2)} {record.base_unit_name || 'Pcs'}</span>
      ),
    },
    {
      title: "Internal Use",
      dataIndex: "internal_use_qty",
      key: "internal_use_qty",
      render: (v: number, record: any) => record.isCategory ? null : (
        <span className="text-red-500">{v.toFixed(2)} {record.base_unit_name || 'Pcs'}</span>
      ),
    },
    {
      title: "Total Stock",
      dataIndex: "total_base_qty",
      key: "total_base_qty",
      render: (v: number, record: any) => record.isCategory ? null : (
        <span className="font-bold">{v.toFixed(2)} {record.base_unit_name || 'Pcs'}</span>
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "unit_price",
      key: "unit_price",
      render: (v: number, record: any) => record.isCategory ? null : (
         v > 0 ? (
           <div className="flex flex-col">
              <span className="font-semibold">{formatNepaliCurrency(v)}</span>
              <span className="text-[10px] text-gray-400 font-normal">(Cost)</span>
           </div>
         ) : "-"
      ),
    },
    {
      title: "Est. Value (NPR)",
      dataIndex: "est_value",
      key: "est_value",
      render: (v: number, record: any) => record.isCategory ? null : (
        <span className="font-bold text-primary">{formatNepaliCurrency(v)}</span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: any) => {
        if (record.isCategory) return null;
        return record.status === 'OK' ? (
          <Tag color="success" className="rounded-md flex items-center gap-1 w-fit">
            <CheckCircle size={12} /> OK
          </Tag>
        ) : (
          <Tag color="error" className="rounded-md flex items-center gap-1 w-fit">
            <AlertCircle size={12} /> Low
          </Tag>
        );
      },
    },
  ];

  const handlePrint = () => {
    // Pass the transformed/grouped data to the new print window via sessionStorage
    sessionStorage.setItem("stock_print_data", JSON.stringify(transformedData));
    window.open("/dashboard/admin/inventory/stock/print", "_blank");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Inventory", href: "/dashboard/admin/inventory/stock" },
          { label: "Stock Status" },
        ]}
      />

      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
             Stock Status
           </h1>
           <p className="text-gray-500 text-sm">Real-time inventory levels across all units.</p>
        </div>

        {/* Professional Filter Bar */}
        <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-md border border-gray-200">
              <span className="text-xs font-bold text-gray-600">As Of (BS):</span>
              <input 
                type="text" 
                placeholder="YYYY-MM-DD" 
                className="bg-transparent text-sm w-24 outline-none border-none placeholder:text-gray-300" 
                value={asOfDate}
                onChange={e => setAsOfDate(e.target.value)}
              />
           </div>
           
           <Button type="primary" icon={<Filter size={14} />} className="bg-[#009966] hover:bg-[#008855] border-none font-bold">
              Filter
           </Button>

           <div className="h-6 w-[1.5px] bg-gray-200 mx-1" />

           <div className="relative w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                placeholder="Search Stock..."
                className="pl-8 pr-4 py-1.5 w-full bg-gray-50 rounded-md border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-blue-200 transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>

           <Tooltip title="Print Report">
              <Button 
                shape="default" 
                icon={<Printer size={16} />} 
                onClick={handlePrint}
                className="text-blue-600 border-blue-200 hover:text-blue-700 hover:border-blue-400 bg-blue-50/50"
              />
           </Tooltip>

           <Tooltip title="Refresh Data">
              <Button 
                shape="default" 
                icon={<RotateCcw size={16} />} 
                onClick={fetchStock}
                className="text-gray-400 border-gray-200"
              />
           </Tooltip>
        </div>
      </div>

      {/* Metrics Dashboard */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
          {/* Total Value */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-500/20 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-blue-100 font-medium text-sm">Total Valuation</span>
              <div className="p-2 bg-white/20 rounded-lg"><Banknote size={18} /></div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold">{formatNepaliCurrency(metrics.totalValue)}</h3>
              <p className="text-blue-100 text-[11px] mt-1">Total estimated stock value</p>
            </div>
          </div>

          {/* Unique Items */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-medium text-sm">Unique Items</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Package size={18} /></div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-800">{metrics.totalItems}</h3>
              <p className="text-gray-400 text-[11px] mt-1">Total SKUs in stock</p>
            </div>
          </div>

           {/* Healthy Stock */}
           <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-gray-500 font-medium text-sm">Healthy Stock</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={18} /></div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-800">{metrics.okStock}</h3>
              <p className="text-gray-400 text-[11px] mt-1">Items above minimum level</p>
            </div>
          </div>

           {/* Low Stock Alerts */}
           <div className="bg-white rounded-xl p-5 border border-red-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-red-500 font-medium text-sm">Low Stock Alerts</span>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={18} /></div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-red-600">{metrics.lowStock}</h3>
              <p className="text-red-400 text-[11px] mt-1">Items requiring restock</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown Insight */}
      {!loading && metrics.topCategories.length > 0 && (
        <Card className="shadow-sm border border-gray-100 rounded-xl bg-white mb-2 !p-5">
           <div className="flex items-center gap-2 mb-4">
             <BarChart2 size={18} className="text-gray-400" />
             <h3 className="font-semibold text-gray-700">Top Categories by Valuation</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
             {metrics.topCategories.map((cat, idx) => {
               const percentage = metrics.totalValue > 0 ? (cat.val / metrics.totalValue) * 100 : 0;
               return (
                 <div key={idx} className="space-y-1">
                   <div className="flex justify-between text-xs font-medium">
                     <span className="text-gray-600 truncate mr-2" title={cat.name}>{cat.name}</span>
                     <span className="text-gray-800 shrink-0">{formatNepaliCurrency(cat.val)}</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                     <div 
                       className="bg-[#009966] h-1.5 rounded-full" 
                       style={{ width: `${percentage}%` }}
                     />
                   </div>
                   <div className="text-[10px] text-gray-400 text-right">{percentage.toFixed(1)}%</div>
                 </div>
               );
             })}
           </div>
        </Card>
      )}

      {/* Main Table Card */}
      <Card className="shadow-xl border-none overflow-hidden rounded-xl bg-[#f8fafc]">
        <Table
          dataSource={transformedData}
          columns={columns}
          rowKey="key"
          loading={loading}
          pagination={false}
          className="professional-stock-table"
          rowClassName={(record) => record.isCategory ? 'category-row bg-white' : 'product-row hover:bg-white'}
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
        .professional-stock-table .ant-table-tbody > tr.category-row > td {
          border-bottom: 2px solid #e2e8f0 !important;
          background-color: #f8fafc !important;
        }
        .professional-stock-table .ant-table-tbody > tr.product-row > td {
          padding: 8px 16px !important;
          font-size: 13px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .professional-stock-table .ant-table-tbody > tr:hover > td {
          background-color: rgba(0, 153, 102, 0.02) !important;
        }
      `}</style>
    </div>
  );
}
