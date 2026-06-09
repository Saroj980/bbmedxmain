"use client";

import { useEffect, useState } from "react";
import { Package, Search, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { Tag } from "antd";
import dayjs from "dayjs";
import NepaliDate from "nepali-date";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button as UIButton } from "@/components/ui/button";
import { Printer } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Movement {
  date: string;
  stock_in: number;
  stock_out: number;
  quantity: number;
  reference_type: string;
  performed_by: string;
  cost_price: number;
  selling_price: number;
  base_unit_name: string;
  purchase_unit_name: string;
  balance: number;
  mrp: number;
  net_purchase_value: number | null;
  net_sale_value: number | null;
  unit_ratio: number | null;
}

interface BatchGroup {
  batch_id: number;
  batch_no: string;
  totalBalance: number;
  cost_price: number;
  selling_price: number;
  mrp: number;
  unit_id: number;
  base_unit_name: string;
  purchase_unit_name: string;
  unit_ratio: number | null;
  movements: Movement[];
  totalIn: number;
}

interface ProductGroup {
  product_id: number;
  product: string;
  batches: BatchGroup[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function groupMovements(rows: any[]): ProductGroup[] {
  const productMap: Record<number, ProductGroup> = {};

  rows.forEach((r) => {
    if (!productMap[r.product_id]) {
      productMap[r.product_id] = {
        product_id: r.product_id,
        product: r.product,
        batches: [],
      };
    }

    const product = productMap[r.product_id];
    let batch = product.batches.find((b) => b.batch_id === r.batch_id);
    if (!batch) {
      batch = {
        batch_id: r.batch_id,
        batch_no: r.batch_no,
        cost_price: r.cost_price,
        selling_price: r.selling_price,
        mrp: r.mrp,
        unit_id: r.unit_id,
        purchase_unit_name: r.purchase_unit_name,
        base_unit_name: r.base_unit_name,
        unit_ratio: r.unit_ratio,
        movements: [],
        totalIn: 0,
        totalBalance: 0,
      };
      product.batches.push(batch);
    }

    batch.movements.push(r);
    batch.totalIn += Number(r.stock_in || 0) - Number(r.stock_out || 0);
    batch.totalBalance = r.balance ?? batch.totalIn;
  });

  return Object.values(productMap).sort((a, b) =>
    a.product.localeCompare(b.product)
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BatchesPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [search, setSearch] = useState("");
  const [rawData, setRawData] = useState<any[]>([]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports/stock-register");
      const rows = res.data?.data || [];
      setRawData(rows);
      setGroups(groupMovements(rows));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // Live search filter
  const filteredGroups = groups
    .map((p) => ({
      ...p,
      batches: p.batches.filter(
        (b) =>
          p.product.toLowerCase().includes(search.toLowerCase()) ||
          b.batch_no.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((p) => p.batches.length > 0);

  // ─── Financial Summary ────────────────────────────────────────────────────
  const financials = filteredGroups.reduce(
    (acc, p) => {
      p.batches.forEach((b) => {
        const baseCost = Number(b.cost_price || 0);
        const baseSell = Number(b.selling_price || 0);

        const totalInQty = b.movements.reduce((s, m) => s + Number(m.stock_in || 0), 0);
        const totalOutQty = b.movements.reduce((s, m) => s + Number(m.stock_out || 0), 0);
        
        // Estimated totals per user request (converting to base unit price first)
        const estimatedCostSum = b.movements.reduce((s, m) => s + (m.stock_in > 0 ? (m.stock_in * baseCost) : 0), 0);
        const estimatedSaleSum = b.movements.reduce((s, m) => s + (m.stock_out > 0 ? (m.stock_out * baseSell) : 0), 0);

        const balance = Number(b.totalBalance || 0);
        
        acc.totalCostInvested += estimatedCostSum;
        acc.totalSellValue += estimatedSaleSum;
        acc.remainingCostValue += baseCost * balance;
        acc.remainingSellValue += baseSell * balance;
      });
      return acc;
    },
    { totalCostInvested: 0, totalSellValue: 0, remainingCostValue: 0, remainingSellValue: 0 }
  );
  const fmt = (n: number) => `NPR ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handlePrint = () => {
    sessionStorage.setItem("batch_print_data", JSON.stringify(filteredGroups));
    window.open("/dashboard/admin/inventory/batches/print", "_blank");
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Inventory", href: "/dashboard/admin/inventory/stock" },
          { label: "Batches" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <Package size={22} className="text-[#009966]" />
            Batch Management
          </h1>
          <p className="text-gray-500 text-sm">
            Product → Batch → Individual stock entries with cost & sell price.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              placeholder="Search by product or batch no..."
              className="pl-10 pr-4 py-2 w-full bg-white rounded-lg border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#009966]/30 transition shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <UIButton
            onClick={handlePrint}
            className="bg-[#009966] hover:bg-[#008855] text-white rounded-xl px-6 transition-all font-semibold shadow-sm border-none flex items-center gap-2 h-10"
            disabled={filteredGroups.length === 0}
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Print Report</span>
          </UIButton>
        </div>
      </div>

      {/* ─── Financial Summary Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Cost Invested",    value: fmt(financials.totalCostInvested),  color: "blue",   bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-800" },
          { label: "Total Selling Amount",   value: fmt(financials.totalSellValue),     color: "purple", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800" },
          { label: "Est. Value Remaining",   value: fmt(financials.remainingSellValue), color: "amber",  bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-800" },
          { label: "Cost Value Remaining",   value: fmt(financials.remainingCostValue), color: "green",  bg: "bg-green-50",  border: "border-green-200",  text: "text-green-800" },
        ].map((c) => (
          <div key={c.label} className={`${c.bg} ${c.border} border rounded-xl px-4 py-3 shadow-sm`}>
            <p className={`text-[10px] font-black uppercase tracking-wide ${c.text} opacity-70`}>{c.label}</p>
            <p className={`text-base font-black mt-0.5 ${c.text} font-mono`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* 3-Level Table */}

      <div className="rounded-xl overflow-hidden shadow-xl border border-gray-100">
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm bg-white">
            Loading batches…
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm bg-white">
            No batch records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse batch-table">
              <thead>
                <tr>
                  <th className="batch-th">Product</th>
                  <th className="batch-th">Batch No</th>
                  <th className="batch-th">Date</th>
                  <th className="batch-th">Unit</th>
                  <th className="batch-th text-right">Cost Price</th>
                  <th className="batch-th text-right">Sell Price</th>
                  <th className="batch-th text-right">MRP</th>
                  <th className="batch-th text-right bg-green-50/10">Stock IN</th>
                  <th className="batch-th text-right bg-red-50/10">Stock OUT</th>
                  <th className="batch-th text-right">Balance</th>
                  <th className="batch-th text-right bg-green-50/20">Total Cost<br/>(IN)</th>
                  <th className="batch-th text-right bg-red-50/20">Total Sales<br/>(OUT)</th>
                  <th className="batch-th text-right">Est. Value<br/>(Remaining)</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((product) => {
                  // Count total rows for this product (sum of all movement rows)
                  const productRowSpan = product.batches.reduce(
                    (acc, b) => acc + b.movements.length,
                    0
                  );

                  return product.batches.map((batch, bIdx) => {
                    const batchRowSpan = batch.movements.length;

                    return batch.movements.map((mov, mIdx) => {
                      const isIN = mov.stock_in > 0;
                      const isFirstProductRow = bIdx === 0 && mIdx === 0;
                      const isFirstBatchRow = mIdx === 0;
                      
                      const baseCost = Number(batch.cost_price || 0);
                      const baseSell = Number(batch.selling_price || 0);
                      const batchMrp = Number(batch.mrp || 0);

                      const refType =
                        (mov.reference_type || "")
                          .split("\\")
                          .pop()
                          ?.toLowerCase() || "manual";

                      return (
                        <tr
                          key={`${batch.batch_id}-${mIdx}`}
                          className={`batch-row ${isIN ? "hover:bg-green-50/40" : "hover:bg-red-50/30"}`}
                        >
                          {/* ── Product Cell (spans all of this product's rows) ── */}
                          {isFirstProductRow && (
                            <td
                              rowSpan={productRowSpan}
                              className="batch-td product-cell align-top"
                            >
                              <div className="flex items-start gap-2 py-1">
                                <Package
                                  size={14}
                                  className="text-[#009966] shrink-0 mt-0.5"
                                />
                                <div>
                                  <span className="font-black text-gray-800 text-sm leading-tight block">
                                    {product.product}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {product.batches.length}{" "}
                                    {product.batches.length === 1
                                      ? "batch"
                                      : "batches"}
                                  </span>
                                </div>
                              </div>
                            </td>
                          )}

                          {/* ── Batch Cell (spans all movements in this batch) ── */}
                          {isFirstBatchRow && (
                            <td
                              rowSpan={batchRowSpan}
                              className="batch-td batch-cell align-top"
                            >
                              <span className="font-mono font-bold text-blue-700 text-sm block">
                                {batch.batch_no}
                              </span>
                              <span
                                className={`text-[10px] font-bold mt-1 block ${batch.totalBalance <= 0 ? "text-red-500" : "text-blue-600"}`}
                              >
                                Balance: {batch.totalBalance}{" "}
                                {batch.base_unit_name}
                              </span>
                            </td>
                          )}

                          {/* ── Date ── */}
                          <td className="batch-td">
                            <span className="text-[11px] text-gray-800 font-medium block">
                              {new NepaliDate(new Date(mov.date)).format("MMMM DD, YYYY")}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              {dayjs(mov.date).format("MMM DD, YYYY")}
                            </span>
                          </td>

                          {/* ── Unit ── */}
                          <td className="batch-td">
                            <Tag color="blue" className="text-[10px] font-semibold">
                              {batch.purchase_unit_name || batch.base_unit_name || "—"}
                            </Tag>
                          </td>

                          {/* ── Prices ── */}
                          {isFirstBatchRow && (
                            <>
                              <td rowSpan={batchRowSpan} className="batch-td text-right">
                                <span className="text-gray-900 font-medium">{Number(batch.cost_price).toLocaleString()}</span>
                                <div className="text-[10px] text-gray-400">/ {batch.base_unit_name}</div>
                              </td>
                              <td rowSpan={batchRowSpan} className="batch-td text-right">
                                <span className="text-gray-900 font-medium">{Number(batch.selling_price).toLocaleString()}</span>
                                <div className="text-[10px] text-gray-400">/ {batch.base_unit_name}</div>
                              </td>
                              <td rowSpan={batchRowSpan} className="batch-td text-right">
                                <span className="text-gray-900 font-medium">{batchMrp > 0 ? Number(batchMrp).toLocaleString() : '—'}</span>
                                {batchMrp > 0 && <div className="text-[10px] text-gray-400">/ {batch.base_unit_name}</div>}
                              </td>
                            </>
                          )}

                          {/* ── Stock IN ── */}
                          <td className="batch-td text-right bg-green-50/20">
                            {mov.stock_in > 0 ? (
                              <span className="font-mono font-bold text-green-700 block">
                                +{mov.stock_in} <span className="text-[10px] font-normal text-green-500">{batch.base_unit_name}</span>
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>

                          {/* ── Stock OUT ── */}
                          <td className="batch-td text-right bg-red-50/20">
                            {mov.stock_out > 0 ? (
                              <span className="font-mono font-bold text-red-600 block">
                                -{mov.stock_out} <span className="text-[10px] font-normal text-red-400">{batch.base_unit_name}</span>
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>

                          {/* ── Running Balance ── */}
                          <td className="batch-td text-right">
                            <span className={`font-mono font-black text-sm block ${Number(mov.balance) <= 0 ? "text-red-500" : "text-blue-700"}`}>
                              {mov.balance} <span className="text-[10px] text-gray-400 font-normal">{batch.base_unit_name}</span>
                            </span>
                          </td>

                          {/* ── Total Cost IN ── */}
                          <td className="batch-td text-right bg-green-50/30">
                            {mov.stock_in > 0 ? (
                              <span className="font-mono text-[11px] font-bold text-green-800">
                                NPR {Number(mov.stock_in * baseCost).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          {/* ── Total Sales OUT ── */}
                          <td className="batch-td text-right bg-red-50/30">
                            {mov.stock_out > 0 ? (
                              <span className="font-mono text-[11px] font-bold text-red-800">
                                NPR {Number(mov.stock_out * baseSell).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          {/* ── Est. Value Remaining ── */}
                          <td className="batch-td text-right font-black text-gray-700">
                            NPR {Number(mov.balance * baseCost).toLocaleString()}
                          </td>
                        </tr>
                      );
                    });
                  });
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx global>{`
        .batch-table {
          width: 100%;
          border-collapse: collapse;
        }
        .batch-th {
          background-color: #009966 !important;
          color: white !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.05em !important;
          padding: 11px 14px !important;
          border-bottom: 2px solid #008855 !important;
          white-space: nowrap;
        }
        .batch-td {
          padding: 9px 14px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          vertical-align: middle;
          font-size: 12px;
          background: white;
        }
        .product-cell {
          background: linear-gradient(160deg, #f0fdf4 0%, #f8fafc 100%) !important;
          border-right: 3px solid #009966 !important;
          padding-top: 14px !important;
          vertical-align: top !important;
        }
        .batch-cell {
          background: linear-gradient(160deg, #eff6ff 0%, #f8fafc 100%) !important;
          border-right: 2px solid #3b82f6 !important;
          padding-top: 14px !important;
          vertical-align: top !important;
        }
        .batch-row:hover td {
          background-color: #f0fdf4 !important;
          transition: background 0.12s;
        }
        .batch-row:hover .product-cell {
          background: linear-gradient(160deg, #dcfce7 0%, #f0fdf4 100%) !important;
        }
        .batch-row:hover .batch-cell {
          background: linear-gradient(160deg, #dbeafe 0%, #eff6ff 100%) !important;
        }
      `}</style>
    </div>
  );
}
