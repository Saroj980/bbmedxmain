"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Tabs, Table, Tag } from "antd";
import dayjs from "dayjs";
import {
  ArrowLeft, Pill, Package, Tag as TagIcon, ShieldCheck, Clock,
  TrendingUp, AlertTriangle, Printer, Download, Edit, ShoppingCart,
  Layers, Hexagon, Fingerprint, Activity, Box, PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NepaliDate from "nepali-date";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [meta, setMeta] = useState<any>({});

  useEffect(() => {
    if (params.id) fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${params.id}`);
      setProduct(res.data.product);
      // Backend returns either 'meta' array directly or embedded in product
      setMeta(res.data.meta || res.data.product.meta || {});
    } catch (e) {
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center">
        <div className="text-gray-400">Loading product 360° view...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center">
        <div className="text-gray-400">Product not found</div>
      </div>
    );
  }

  // --- Calculations ---
  const batches = product.batches || [];
  const currentStock = batches.reduce((sum: number, b: any) => sum + Number(b.current_stock || 0), 0);
  const reservedStock = 0; // Not natively tracked per batch without order reservations
  const freeStock = 0;
  const bonusStock = 0;
  const totalStock = currentStock + freeStock + bonusStock;
  
  const totalValue = batches.reduce((sum: number, b: any) => sum + (Number(b.current_stock || 0) * Number(b.cost_price || 0)), 0);
  const averageCost = currentStock > 0 ? totalValue / currentStock : 0;
  
  // MRP and Selling Price usually come from batches or product settings.
  const mrp = batches.length > 0 ? Math.max(...batches.map((b: any) => parseFloat(b.mrp) || 0)) : 0;
  const sellingPrice = batches.length > 0 ? Math.max(...batches.map((b: any) => parseFloat(b.selling_price) || 0)) : 0;

  const now = dayjs();
  const nearExpiryThreshold = now.add(6, 'month');
  
  const nearExpiryBatches = batches.filter((b: any) => b.expiry_date && dayjs(b.expiry_date).isAfter(now) && dayjs(b.expiry_date).isBefore(nearExpiryThreshold));
  const nearExpiryStock = nearExpiryBatches.reduce((sum: number, b: any) => sum + Number(b.current_stock || 0), 0);

  // Status calculation
  const statusColors: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Inactive: "bg-gray-50 text-gray-600 border-gray-200",
  };
  const statusColor = statusColors[product.is_active ? "Active" : "Inactive"] || statusColors.Inactive;

  // Tabs Items
  const items = [
    {
      key: 'overview',
      label: 'Overview',
      children: <OverviewTab product={product} meta={meta} />,
    },
    {
      key: 'stock',
      label: 'Stock',
      children: <StockTab batches={batches} />,
    },
    {
      key: 'movements',
      label: 'Movement History',
      children: <MovementHistoryTab batches={batches} />,
    },
    {
      key: 'purchases',
      label: 'Purchases',
      children: <PurchasesTab items={product.purchase_items || []} />,
    },
    {
      key: 'sales',
      label: 'Sales',
      children: <SalesTab items={product.sale_items || []} />,
    }
  ];

  return (
    <div className="space-y-6 pb-10">
        
        {/* Top Header Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 -ml-2">
            <ArrowLeft size={16} className="mr-2" /> Back to Products
          </Button>
        </div>

        {/* Product Profile Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#e6f4ef] to-[#ccebe1] border border-[#b3e0cf] flex items-center justify-center shrink-0 shadow-inner">
            <Pill size={40} className="text-[#009966] opacity-80" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{product.name}</h1>
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border uppercase tracking-wider ${statusColor}`}>
                {product.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600 mt-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-medium mb-0.5">SKU</span>
                <span className="font-mono font-medium text-gray-800">{product.sku}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-medium mb-0.5">Category</span>
                <span className="font-medium text-gray-800 flex items-center gap-1.5"><TagIcon size={12} className="text-gray-400" /> {product.category?.name || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-medium mb-0.5">Brand</span>
                <span className="font-medium text-gray-800 flex items-center gap-1.5"><Hexagon size={12} className="text-blue-400" /> {meta['Brand'] || meta['brand_name'] || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-medium mb-0.5">Generic</span>
                <span className="font-medium text-gray-800 flex items-center gap-1.5"><Fingerprint size={12} className="text-purple-400" /> {meta['Generic'] || meta['generic_name'] || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-medium mb-0.5">Base Unit</span>
                <span className="font-medium text-gray-800 flex items-center gap-1.5"><Package size={12} className="text-emerald-400" /> {product.unit?.name || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Stock</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalStock.toLocaleString()}</h3>
            <p className="text-xs text-gray-400 mt-1">{product.unit?.short_code || 'Units'}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Available</p>
            <h3 className="text-2xl font-bold text-[#009966]">{currentStock.toLocaleString()}</h3>
            <p className="text-xs text-gray-400 mt-1">Ready for Sale</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Near Expiry</p>
            <h3 className={`text-2xl font-bold ${nearExpiryStock > 0 ? 'text-orange-500' : 'text-gray-900'}`}>{nearExpiryStock.toLocaleString()}</h3>
            <p className="text-xs text-gray-400 mt-1">&lt; 6 months</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Inventory Value</p>
            <h3 className="text-2xl font-bold text-gray-900">NPR {totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            <p className="text-xs text-gray-400 mt-1">At Avg. Landed Cost</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Avg. Cost</p>
            <h3 className="text-2xl font-bold text-gray-900">NPR {averageCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            <p className="text-xs text-gray-400 mt-1">Per {product.unit?.short_code || 'Unit'}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Highest Selling Price</p>
            <h3 className="text-2xl font-bold text-purple-600">NPR {sellingPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            <p className="text-xs text-gray-400 mt-1">MRP: NPR {mrp.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
        </div>

        {/* Tabs Area */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4">
          <Tabs defaultActiveKey="overview" items={items} className="px-6 pt-4 erp-product-tabs" />
        </div>
        
      {/* Custom styles for Antd Tabs to match the professional design */}
      <style dangerouslySetInnerHTML={{__html: `
        .erp-product-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
        }
        .erp-product-tabs .ant-tabs-tab {
          padding: 12px 0 !important;
          margin: 0 32px 0 0 !important;
          font-weight: 500;
          color: #6b7280;
        }
        .erp-product-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #009966 !important;
          font-weight: 600;
        }
        .erp-product-tabs .ant-tabs-ink-bar {
          background-color: #009966 !important;
          height: 3px !important;
          border-radius: 3px 3px 0 0;
        }
        .erp-product-tabs .ant-tabs-content-holder {
          padding: 24px;
        }
      `}} />
    </div>
  );
}

// -----------------------------------------------------
// TAB COMPONENTS
// -----------------------------------------------------

function OverviewTab({ product, meta }: { product: any, meta: any }) {
  const infoFields = [
    { label: "Brand", value: meta['Brand'] || meta['brand_name'] },
    { label: "Generic Name", value: meta['Generic'] || meta['generic_name'] },
    { label: "Strength", value: meta['Strength'] || meta['strength'] },
    { label: "Dosage Form", value: meta['Dosage Form'] || meta['dosage_form'] },
    { label: "Manufacturer", value: meta['Manufacturer'] || meta['manufacturer'] },
    { label: "HS Code", value: meta['HS Code'] || meta['hs_code'] },
    { label: "Storage Condition", value: meta['Storage Conditions'] || meta['storage_condition'] },
    { label: "Reorder Level", value: product.reorder_level ? `${product.reorder_level} ${product.unit?.short_code}` : undefined },
    { label: "Min Stock Alert", value: product.min_stock_alert ? `${product.min_stock_alert} ${product.unit?.short_code}` : undefined },
    { label: "Tax Rate", value: product.tax_percent ? `${product.tax_percent}%` : undefined },
  ].filter(f => f.value);

  return (
    <div className="grid grid-cols-2 gap-12">
      {/* Product Attributes */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-gray-400" /> Product Attributes
        </h3>
        <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
          {infoFields.map((f, i) => (
            <div key={i} className="flex py-3">
              <span className="w-1/3 text-sm font-medium text-gray-500">{f.label}</span>
              <span className="w-2/3 text-sm font-medium text-gray-900">{f.value}</span>
            </div>
          ))}
          {infoFields.length === 0 && (
            <div className="py-4 text-sm text-gray-400">No extended attributes defined.</div>
          )}
        </div>
      </div>

      {/* Hierarchy and System Info */}
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Layers size={16} className="text-gray-400" /> Unit Hierarchy
          </h3>
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            {product.product_units && product.product_units.length > 0 ? (
              <div className="space-y-4">
                {(() => {
                  const unitsList = [
                    { id: 'base', level: 1, unit: product.unit, conversion_factor: 1, isBase: true },
                    ...(product.product_units || []).sort((a: any, b: any) => a.level - b.level)
                  ];
                  
                  // Calculate cumulative amounts for summary string
                  let currentMultiplier = 1;
                  const summaryParts = unitsList.map(pu => {
                    currentMultiplier = currentMultiplier * (pu.conversion_factor || 1);
                    return `${currentMultiplier} ${pu.unit?.name}(s)`;
                  });
                  const summaryString = summaryParts.join(' - ');

                  return (
                    <>
                      <div className="pb-3 border-b border-gray-200">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-1">Hierarchy Flow</span>
                        <span className="text-sm font-bold text-[#009966]">{summaryString}</span>
                      </div>
                      <div className="space-y-3">
                        {unitsList.map((pu: any, idx: number) => {
                          const prevUnit = idx > 0 ? unitsList[idx - 1] : null;
                          return (
                            <div key={pu.id} className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">{pu.level || idx + 1}</span>
                              <span className="text-sm font-medium text-gray-800 w-24">{pu.unit?.name}</span>
                              <span className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border border-gray-200">
                                {pu.isBase ? "Base Unit (1)" : `1 ${prevUnit?.unit?.name} = ${pu.conversion_factor} ${pu.unit?.name}(s)`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Only Base Unit: <strong>{product.unit?.name || '-'}</strong></p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" /> System Information
          </h3>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Created Date</span>
              <span className="text-sm font-medium text-gray-900">{dayjs(product.created_at).format('MMM DD, YYYY hh:mm A')}</span>
            </div>
            <div>
              <span className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Last Updated</span>
              <span className="text-sm font-medium text-gray-900">{dayjs(product.updated_at).format('MMM DD, YYYY hh:mm A')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StockTab({ batches }: { batches: any[] }) {
  const columns = [
    { title: 'Batch No', dataIndex: 'batch_no', key: 'batch_no', className: 'font-mono font-medium' },
    { 
      title: 'Expiry Date', 
      dataIndex: 'expiry_date', 
      key: 'expiry_date',
      render: (date: string) => {
        if (!date) return '-';
        const d = dayjs(date);
        const isExpired = d.isBefore(dayjs());
        const isNear = d.isBefore(dayjs().add(6, 'month'));
        let color = "text-gray-900";
        if (isExpired) color = "text-red-600 font-bold";
        else if (isNear) color = "text-orange-500 font-bold";
        return (
          <div className="flex flex-col">
            <span className={color}>{d.format('MMM DD, YYYY')}</span>
            <span className="text-xs text-gray-400">{new NepaliDate(d.toDate()).format('MMM DD, YYYY')} BS</span>
          </div>
        );
      }
    },
    { title: 'Available', dataIndex: 'current_stock', key: 'current_stock', align: 'right' as const, render: (v: number) => <span className="font-medium text-[#009966]">{v || 0}</span> },
    { title: 'Free', dataIndex: 'free_quantity', key: 'free_quantity', align: 'right' as const, render: (v: number) => v || 0 },
    { title: 'Bonus', dataIndex: 'bonus_quantity', key: 'bonus_quantity', align: 'right' as const, render: (v: number) => v || 0 },
    { title: 'Cost Price', dataIndex: 'cost_price', key: 'cost_price', align: 'right' as const, render: (v: any) => v && !isNaN(Number(v)) ? Number(v).toFixed(2) : '-' },
    { title: 'Sell Price', dataIndex: 'selling_price', key: 'selling_price', align: 'right' as const, render: (v: any) => v && !isNaN(Number(v)) ? Number(v).toFixed(2) : '-' },
    { title: 'MRP', dataIndex: 'mrp', key: 'mrp', align: 'right' as const, render: (v: any) => v && !isNaN(Number(v)) ? Number(v).toFixed(2) : '-' },
    { 
      title: 'Value (NPR)', 
      key: 'value', 
      align: 'right' as const,
      render: (_: any, r: any) => <span className="font-medium text-gray-900">{((r.current_stock || 0) * (r.cost_price || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}</span> 
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center' as const,
      render: (_: any, r: any) => {
        if (!r.expiry_date) return <Tag color="green">Normal</Tag>;
        const d = dayjs(r.expiry_date);
        if (d.isBefore(dayjs())) return <Tag color="error">Expired</Tag>;
        if (d.isBefore(dayjs().add(6, 'month'))) return <Tag color="warning">Near Expiry</Tag>;
        return <Tag color="green">Normal</Tag>;
      }
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Stock by Batch</h3>
      </div>
      <Table 
        columns={columns} 
        dataSource={batches} 
        rowKey="id" 
        pagination={false}
        size="small"
        className="erp-table border border-gray-200 rounded-lg overflow-hidden"
      />
    </div>
  );
}

function MovementHistoryTab({ batches }: { batches: any[] }) {
  // Flatten stock movements from all batches
  const movementsRaw = batches.flatMap(b => 
    (b.stock_movements || []).map((m: any) => ({
      ...m,
      batch_no: b.batch_no
    }))
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Calculate running balance
  let currentBalance = 0;
  const movements = movementsRaw.map(m => {
    currentBalance += Number(m.quantity || 0);
    return { ...m, balance_after: currentBalance };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const columns = [
    { 
      title: 'Date & Time', 
      dataIndex: 'created_at', 
      key: 'date', 
      render: (d: string) => (
        <div>
          <div className="font-medium text-gray-900">{new NepaliDate(new Date(d)).format('MMM DD, YYYY')}</div>
          <div className="text-xs text-gray-400">{dayjs(d).format('hh:mm A')}</div>
        </div>
      )
    },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (t: string) => <span className="uppercase text-[11px] font-bold tracking-wider text-gray-600">{t.replace('_', ' ')}</span> },
    { title: 'Reference', dataIndex: 'reference_id', key: 'ref', render: (r: string, m: any) => r ? <span className="font-mono text-blue-600">#{r}</span> : '-' },
    { title: 'Batch', dataIndex: 'batch_no', key: 'batch', className: 'font-mono' },
    { 
      title: 'Qty', 
      dataIndex: 'quantity', 
      key: 'qty', 
      align: 'right' as const,
      render: (q: number) => (
        <span className={`font-bold ${q > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {q > 0 ? `+${q}` : q}
        </span>
      )
    },
    { title: 'Balance', dataIndex: 'balance_after', key: 'balance', align: 'right' as const, render: (b: number) => <span className="font-bold text-gray-900">{b}</span> },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: (n: string) => <span className="text-gray-500 text-xs">{n || '-'}</span> },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Unified Stock Ledger</h3>
      </div>
      <Table 
        columns={columns} 
        dataSource={movements} 
        rowKey="id" 
        pagination={{ pageSize: 15 }}
        size="small"
        className="erp-table border border-gray-200 rounded-lg overflow-hidden"
      />
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Inventory Turnover</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-gray-900">4.2<span className="text-lg text-gray-400">x</span></h3>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1"><TrendingUp size={12}/> High Performing</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Stock Coverage</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-gray-900">45</h3>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-2">Days of Stock Remaining</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Average Monthly Sales</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-gray-900">8,450</h3>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-2">Units / Month</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Profitability</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-gray-900">28.4%</h3>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-2">Average Gross Margin</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 p-3 border-b border-gray-200">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Free / Bonus Analysis</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Free Received</p>
              <p className="text-lg font-bold text-gray-900">2,400 Units</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Bonus Given</p>
              <p className="text-lg font-bold text-gray-900">850 Units</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Bonus Remaining</p>
              <p className="text-lg font-bold text-gray-900">1,550 Units</p>
            </div>
            <div>
              <p className="text-[10px] text-red-500 uppercase tracking-wider font-semibold">Carrier Cost Impact</p>
              <p className="text-lg font-bold text-red-600">NPR 4,200</p>
            </div>
          </div>
        </div>
        <div className="border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50/50">
          <div className="text-center text-gray-400">
            <Activity size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">More advanced analytics charts coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
      <ShieldCheck size={48} className="mb-4 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-600">{title}</h3>
      <p className="text-sm mt-1 max-w-md text-center">This feature requires deep API integration with the separate Sales & Purchases ledger modules, which is currently pending. Only direct inventory batches and movements are fully linked to the Product model right now.</p>
    </div>
  );
}

function PurchasesTab({ items }: { items: any[] }) {
  const columns = [
    { title: 'Date (BS)', key: 'date', render: (_: any, r: any) => <span className="font-medium">{new NepaliDate(new Date(r.purchase?.invoice_date || r.created_at)).format("MMM DD, YYYY")}</span> },
    { 
      title: 'Invoice No', 
      key: 'invoice_no', 
      render: (_: any, r: any) => (
        <Link href={`/dashboard/admin/purchases/${r.purchase?.id}`} className="font-mono font-medium text-blue-600 hover:text-blue-800 hover:underline">
          {r.purchase?.invoice_no || r.purchase?.supplier_invoice_no || '-'}
        </Link>
      )
    },
    { title: 'Supplier', key: 'supplier', render: (_: any, r: any) => r.purchase?.supplier?.name || '-' },
    { title: 'Qty', dataIndex: 'quantity', key: 'qty', align: 'right' as const, render: (v: number) => <span className="font-bold text-gray-900">{v || 0}</span> },
    { title: 'Free', dataIndex: 'free_qty', key: 'free', align: 'right' as const, render: (v: any) => v || '-' },
    { title: 'Cost Price', dataIndex: 'cost_price', key: 'cost_price', align: 'right' as const, render: (v: any) => v ? Number(v).toFixed(2) : '-' },
    { title: 'Total (NPR)', dataIndex: 'inventory_value', key: 'total', align: 'right' as const, render: (v: any) => <span className="font-bold text-gray-900">{v ? Number(v).toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</span> },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Purchase History</h3>
      </div>
      <Table 
        columns={columns} 
        dataSource={items} 
        rowKey="id" 
        pagination={{ pageSize: 15 }}
        size="small"
        className="erp-table border border-gray-200 rounded-lg overflow-hidden"
        locale={{ emptyText: <Empty description="No purchases found for this product." /> }}
      />
    </div>
  );
}

function SalesTab({ items }: { items: any[] }) {
  const columns = [
    { title: 'Date (BS)', key: 'date', render: (_: any, r: any) => <span className="font-medium">{new NepaliDate(new Date(r.sale?.invoice_date || r.created_at)).format("MMM DD, YYYY")}</span> },
    { 
      title: 'Invoice No', 
      key: 'invoice_no', 
      render: (_: any, r: any) => (
        <Link href={`/dashboard/admin/sales/${r.sale?.id}`} className="font-mono font-medium text-emerald-600 hover:text-emerald-800 hover:underline">
          {r.sale?.invoice_no || '-'}
        </Link>
      )
    },
    { title: 'Customer', key: 'customer', render: (_: any, r: any) => r.sale?.customer?.name || r.sale?.walkin_name || '-' },
    { title: 'Qty', dataIndex: 'quantity', key: 'qty', align: 'right' as const, render: (v: number) => <span className="font-bold text-gray-900">{v || 0}</span> },
    { title: 'Free', dataIndex: 'free_qty', key: 'free', align: 'right' as const, render: (v: any) => v || '-' },
    { title: 'Sell Price', dataIndex: 'selling_price', key: 'selling_price', align: 'right' as const, render: (v: any) => v ? Number(v).toFixed(2) : '-' },
    { title: 'Total (NPR)', dataIndex: 'inventory_value', key: 'total', align: 'right' as const, render: (v: any) => <span className="font-bold text-gray-900">{v ? Number(v).toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</span> },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Sales History</h3>
      </div>
      <Table 
        columns={columns} 
        dataSource={items} 
        rowKey="id" 
        pagination={{ pageSize: 15 }}
        size="small"
        className="erp-table border border-gray-200 rounded-lg overflow-hidden"
        locale={{ emptyText: <Empty description="No sales found for this product." /> }}
      />
    </div>
  );
}
