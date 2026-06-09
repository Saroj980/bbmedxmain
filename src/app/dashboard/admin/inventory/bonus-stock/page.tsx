"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import NepaliBsDatePicker from "@/components/common/NepaliBsDatePicker";
import { ADToBS } from "bikram-sambat-js";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { Eye, ChevronDown, ChevronRight, Package, AlertTriangle, ShoppingCart, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Columns Definition ---
export const bonusStockColumns = () => [
  {
    accessorKey: "index",
    header: "#",
    cell: ({ row, table }: any) => (
      <span className="text-gray-500 font-medium">
        {row.index + 1 + table.getState().pagination.pageIndex * table.getState().pagination.pageSize}
      </span>
    ),
  },
  {
    accessorKey: "product.name",
    header: "Product & Batch",
    cell: ({ row }: any) => (
      <div>
        <div className="font-semibold text-[#163A5F]">{row.original.product?.name}</div>
        <div className="flex items-center gap-2 mt-0.5">
           <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border">
              Batch: {row.original.batch?.batch_no || "-"}
           </span>
           <span className="text-[11px] text-gray-500">
              Exp: {row.original.batch?.expiry_date ? dayjs(row.original.batch?.expiry_date).format("DD MMM YYYY") : "-"}
           </span>
        </div>
      </div>
    ),
  },
  {
    header: () => <div className="text-center">Paid Qty</div>,
    id: "quantity",
    cell: ({ row }: any) => {
      const ub = row.original.purchased_unit_breakdown;
      if (!ub || ub.length === 0) return <div className="text-center text-gray-700 font-medium">{row.original.quantity || 0}</div>;
      
      return (
        <div className="text-center flex flex-col items-center gap-0.5">
          {ub.map((u: any, i: number) => (
             <span key={i} className="flex items-center gap-1">
                <span className="font-medium text-gray-700">{u.qty}</span>
                <span className="text-[10px] text-gray-500">{u.unit}</span>
             </span>
          ))}
        </div>
      );
    },
  },
  {
    header: () => <div className="text-center text-blue-700">Rcvd Bonus</div>,
    id: "bonus_received",
    cell: ({ row }: any) => {
      const ub = row.original.free_unit_breakdown;
      if (!ub || ub.length === 0) return <div className="text-center text-blue-600 font-bold">{row.original.bonus_received || 0}</div>;
      
      return (
        <div className="text-center flex flex-col items-center gap-0.5">
          {ub.map((u: any, i: number) => (
             <span key={i} className="flex items-center gap-1">
                <span className="font-bold text-blue-600">{u.qty}</span>
                <span className="text-[10px] text-blue-500">{u.unit}</span>
             </span>
          ))}
        </div>
      );
    },
  },
  {
    header: () => <div className="text-center text-green-700">Rem. Bonus</div>,
    id: "bonus_remaining",
    cell: ({ row }: any) => {
      const remaining = row.original.bonus_remaining || 0;
      const ub = row.original.remaining_unit_breakdown;
      const colorClass = remaining > 0 ? "text-green-600" : "text-red-500";
      const unitColorClass = remaining > 0 ? "text-green-500" : "text-red-400";
      
      if (!ub || ub.length === 0) return <div className={cn("text-center font-bold", colorClass)}>{remaining}</div>;
      
      return (
        <div className="text-center flex flex-col items-center gap-0.5">
          {ub.map((u: any, i: number) => (
             <span key={i} className="flex items-center gap-1">
                <span className={cn("font-bold", colorClass)}>{u.qty}</span>
                <span className={cn("text-[10px]", unitColorClass)}>{u.unit}</span>
             </span>
          ))}
        </div>
      );
    },
  },
  {
    header: () => <div className="text-right">Unit Cost</div>,
    id: "landed_cost",
    cell: ({ row }: any) => (
      <div className="text-right text-gray-700 font-medium">
        {row.original.landed_cost > 0 ? formatNepaliCurrency(row.original.landed_cost) : "0.00"}
      </div>
    ),
  },
  {
    header: () => <div className="text-right font-semibold">Total Value</div>,
    id: "bonus_stock_value",
    cell: ({ row }: any) => (
      <div className="text-right font-semibold text-gray-800">
        {formatNepaliCurrency(row.original.bonus_stock_value || 0)}
      </div>
    ),
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.original.status;
      let colorClass = "bg-gray-100 text-gray-700 border-gray-200";
      
      if (status === "Active") colorClass = "bg-green-50 text-green-700 border-green-200";
      else if (status === "Near Expiry") colorClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
      else if (status === "Expired") colorClass = "bg-red-50 text-red-700 border-red-200";
      else if (status === "Fully Consumed") colorClass = "bg-gray-100 text-gray-600 border-gray-200";

      return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass} whitespace-nowrap`}>
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => {
             e.stopPropagation();
             row.toggleExpanded();
          }} 
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md border"
          title="View Details"
        >
          {row.getIsExpanded() ? <ChevronDown size={16} /> : <Eye size={16} />}
        </button>
      </div>
    ),
  },
];

// --- Page Component ---
export default function BonusStockPage() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total_bonus_qty: 0,
    total_bonus_stock_value: 0,
    consumed_bonus_qty: 0,
    near_expiry_bonus_qty: 0,
    expired_bonus_qty: 0,
    available_bonus_batches: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const handleExportExcel = () => {
    if (!data || data.length === 0) return;
    
    const reportTitle = "BONUS STOCK INVENTORY REPORT";
    const reportSubtitle = `Generated On: ${dayjs().format("YYYY-MM-DD hh:mm A")}`;
    const reportStatusFilter = `Status Filter: ${statusFilter}`;

    // Create an Array of Arrays (AOA) for the worksheet
    const wsData = [
      [reportTitle],
      [reportSubtitle],
      [reportStatusFilter],
      [], 
      ["Product", "Batch No.", "Expiry Date", "Purchased Qty", "Bonus Qty Received", "Bonus Qty Remaining", "Landed Cost (Rs.)", "Bonus Stock Value (Rs.)", "Status"]
    ];

    data.forEach((row: any) => {
      const pQty = row.purchased_unit_breakdown ? row.purchased_unit_breakdown.map((u: any) => `${u.qty} ${u.unit}`).join(' + ') : row.quantity || 0;
      const bReceived = row.free_unit_breakdown ? row.free_unit_breakdown.map((u: any) => `${u.qty} ${u.unit}`).join(' + ') : row.bonus_received || 0;
      const bRem = row.remaining_unit_breakdown ? row.remaining_unit_breakdown.map((u: any) => `${u.qty} ${u.unit}`).join(' + ') : row.bonus_remaining || 0;

      wsData.push([
        row.product?.name || "-",
        row.batch?.batch_no || "-",
        row.batch?.expiry_date ? dayjs(row.batch?.expiry_date).format("YYYY-MM-DD") : "-",
        pQty,
        bReceived,
        bRem,
        row.landed_cost || 0,
        row.bonus_stock_value || 0,
        row.status || "-"
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bonus Stock");
    
    const year = dayjs().format("YYYY");
    const timestamp = dayjs().format("YYYYMMDD_HHmmss");
    XLSX.writeFile(workbook, `Bonus Report - ${year} - ${timestamp}.xlsx`);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter && statusFilter !== "All") params.status = statusFilter;

      // Ensure per_page is large or handled via actual pagination
      const res = await api.get("/free-bonuses", { params: { ...params, per_page: 500 } });
      setData(res.data?.items?.data || []);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const columns = useMemo(() => bonusStockColumns(), []);

  // -- Render Expanded Row ---
  const renderExpandedRow = (row: any) => {
    const p = row.purchase || {};
    const u = row.utilization || {};
    
    return (
      <div className="p-4 bg-green-50/30 border-y border-green-100 flex flex-col gap-6">
        <div className="flex items-center gap-10">
           <div className="flex items-center gap-3 bg-white p-3 rounded-lg border shadow-sm">
              <div className="w-10 h-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center">
                 <Package size={20} />
              </div>
              <div>
                 <div className="font-bold text-gray-800 text-sm">{row.product?.name}</div>
                 <div className="text-xs text-gray-500 font-medium">Batch: <span className="text-green-700">{row.batch?.batch_no}</span></div>
              </div>
           </div>

           <div className="flex flex-col gap-1">
             <span className="text-xs text-gray-500 font-medium">Purchase Invoice</span>
             <a 
               href={`/dashboard/admin/purchases/${row.purchase_id}`} 
               target="_blank" 
               rel="noreferrer"
               className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 w-max"
             >
               {p.invoice_no || "View Invoice"}
             </a>
           </div>

           <div className="flex flex-col gap-1">
             <span className="text-xs text-gray-500 font-medium">Supplier</span>
             <a
               href={`/dashboard/admin/purchases/suppliers/${p.supplier_id}`}
               target="_blank"
               rel="noreferrer"
               className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 w-max"
             >
               {p.supplier?.name || "-"}
             </a>
           </div>

           <div className="flex flex-col gap-1">
             <span className="text-xs text-gray-500 font-medium">CC on Goods</span>
             <span className="text-sm font-semibold text-gray-800">{formatNepaliCurrency(row.carrier_cost || 0)}</span>
           </div>

           <div className="flex flex-col gap-1">
             <span className="text-xs text-gray-500 font-medium">Total Inventory Value</span>
             <span className="text-sm font-semibold text-gray-800">{formatNepaliCurrency(row.inventory_value || 0)}</span>
           </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-4 w-full">
           <h4 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Bonus Stock Utilization</h4>
           <div className="grid grid-cols-5 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium">Bonus Received</span>
                <span className="text-lg font-bold text-blue-600">{row.bonus_received}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium">Used in Promotions (Free)</span>
                <span className="text-lg font-bold text-purple-600">{u.used_in_promotions || 0}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium">Used in Cost Recovery</span>
                <span className="text-lg font-bold text-orange-500">{u.used_in_cost_recovery || 0}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium">Used in Adjustments/Wastage</span>
                <span className="text-lg font-bold text-red-500">{u.used_in_adjustments || 0}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium">Remaining Bonus Qty</span>
                <span className="text-lg font-bold text-green-600">{row.bonus_remaining}</span>
              </div>
           </div>
           
           <div className="mt-4 pt-3 border-t text-[11px] text-gray-400 flex items-center gap-1.5">
             <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center">i</div>
             Bonus Stock Value is calculated using Landed Cost (including CC on Goods and CC on Free Goods).
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-700">
             <Package size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#163A5F]">Bonus Stock Inventory</h1>
            <p className="text-sm text-gray-500">View and manage bonus/free products received from suppliers</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
              onClick={handleExportExcel}
              className="bg-[#009966] hover:bg-[#007f56] text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            Export
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-5 gap-4">
         <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2 text-gray-500">
               <Package size={18} />
               <span className="text-xs font-bold uppercase tracking-wider">Total Bonus Stock Qty</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
               {stats.total_bonus_qty.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">Units</div>
         </div>

         <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2 text-blue-500">
               <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Bonus Stock Value</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
               {stats.total_bonus_stock_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-400 mt-1">Rs.</div>
         </div>

         <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2 text-yellow-500">
               <AlertTriangle size={18} />
               <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Near Expiry Bonus Qty</span>
            </div>
            <div className="text-3xl font-bold text-orange-500">
               {stats.near_expiry_bonus_qty.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">Units</div>
         </div>

         <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2 text-purple-500">
               <ShoppingCart size={18} />
               <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Consumed Bonus Qty</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">
               {stats.consumed_bonus_qty.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">Units</div>
         </div>

         <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2 text-green-500">
               <LayoutDashboard size={18} />
               <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Available Bonus Batches</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
               {stats.available_bonus_batches.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">Batches</div>
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex items-end gap-4">
        <div className="flex flex-col gap-1 w-48">
           <label className="text-xs font-medium text-gray-600">Status</label>
           <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500"
           >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Near Expiry">Near Expiry</option>
              <option value="Expired">Expired</option>
              <option value="Fully Consumed">Fully Consumed</option>
           </select>
        </div>
        <button onClick={loadData} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium border">
          Refresh
        </button>
      </div>

      <DataTable
        title="Bonus Stock List"
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No bonus stock records found."
        pageSize={50}
        expandedRowRenderer={renderExpandedRow}
      />
    </div>
  );
}
