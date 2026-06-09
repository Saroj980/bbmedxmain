"use client";

import React, { useEffect, useState } from "react";
import { Tag } from "antd";
import dayjs from "dayjs";
import { Package } from "lucide-react";
import NepaliDate from "nepali-date";
import PrintHeader from "@/components/common/PrintHeader";

interface Movement {
  date: string;
  stock_in: number;
  stock_out: number;
  quantity: number;
  reference_type: string;
  performed_by: string;
  balance: number;
  net_purchase_value: number | null;
  net_sale_value: number | null;
  unit_ratio: number | null;
}

interface BatchGroup {
  batch_id: number;
  batch_no: string;
  cost_price: number;
  selling_price: number;
  purchase_unit_name: string;
  base_unit_name: string;
  movements: Movement[];
  totalIn: number;
  totalBalance: number;
  unit_ratio: number | null;
}

interface ProductGroup {
  product_id: number;
  product: string;
  batches: BatchGroup[];
}

interface Props {
  data: ProductGroup[];
}

export default function BatchPrintView({ data }: Props) {
  const [mounted, setMounted] = useState(false);
  const [systemSettings, setSystemSettings] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const fetchSettings = async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get("/system-settings");
        setSystemSettings(res.data);
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    fetchSettings();
  }, []);

  // Summary stats
  const safeData = data || [];
  const totalBatches = safeData.reduce((a, p) => a + (p.batches?.length || 0), 0);
  const totalProducts = safeData.length;

  // Financial Summary
  const financials = safeData.reduce(
    (acc, p) => {
      (p.batches || []).forEach((b) => {
        const ratio = Number(b.unit_ratio || 1);
        const baseCost = Number(b.cost_price || 0) / ratio;
        const baseSell = Number(b.selling_price || 0) / ratio;

        const totalInQty = (b.movements || []).reduce((s, m) => s + Number(m.stock_in || 0), 0);
        const totalOutQty = (b.movements || []).reduce((s, m) => s + Number(m.stock_out || 0), 0);
        
        const estimatedCostSum = (b.movements || []).reduce((s, m) => s + (m.stock_in > 0 ? (m.stock_in * baseCost) : 0), 0);
        const estimatedSaleSum = (b.movements || []).reduce((s, m) => s + (m.stock_out > 0 ? (m.stock_out * baseSell) : 0), 0);

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

  return (
    <div className="bg-white p-2 sm:p-4 print:p-0 text-black w-full" id="batch-report">
      <PrintHeader systemSettings={systemSettings} title="Batch Status Report" />

      {/* ── Metadata ── */}
      <table className="w-full mb-3 border-collapse text-[10px]">
        <tbody>
          <tr>
            <td className="w-[15%] font-bold py-0.5">Report Date:</td>
            <td className="w-[35%] border-b border-gray-100 py-0.5 font-semibold text-slate-800">
              {mounted ? dayjs().format("MMMM DD, YYYY") : ""}
            </td>
            <td className="w-[15%] font-bold py-0.5 text-right pr-4">Printed On:</td>
            <td className="w-[35%] border-b border-gray-100 py-0.5 text-right italic text-gray-500">
              {mounted ? dayjs().format("hh:mm A") : ""}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Summary Chips ── */}
      {/* <div className="flex gap-3 mb-3">
        <div className="bg-green-50 border border-green-200 rounded px-3 py-1.5 text-center">
          <p className="text-[9px] uppercase font-black text-green-700">Total Products</p>
          <p className="text-base font-black text-green-700">{totalProducts}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1.5 text-center">
          <p className="text-[9px] uppercase font-black text-blue-700">Total Batches</p>
          <p className="text-base font-black text-blue-700">{totalBatches}</p>
        </div>
      </div> */}

      {/* ── 3-Level Table ── */}
      <table className="w-full border-collapse print-batch-table">
        <thead>
          <tr>
            <th className="pbth w-[13%]">Product</th>
            <th className="pbth w-[9%]">Batch No</th>
            <th className="pbth w-[12%]">Date</th>
            <th className="pbth w-[5%]">Unit</th>
            <th className="pbth w-[9%] text-right">Cost Price</th>
            <th className="pbth w-[9%] text-right">Sell Price</th>
            <th className="pbth w-[7%] text-right">Stock IN</th>
            <th className="pbth w-[7%] text-right">Stock OUT</th>
            <th className="pbth w-[7%] text-right">Balance</th>
            <th className="pbth w-[8%] text-right bg-green-50/20">Cost<br/>(IN)</th>
            <th className="pbth w-[8%] text-right bg-red-50/20">Sales<br/>(OUT)</th>
            <th className="pbth w-[8%] text-right">Est. Value<br/>(Rem)</th>
          </tr>
        </thead>
        <tbody>
          {safeData.map((product, pIdx) => {
            const batches = product.batches || [];
            const productRowSpan = batches.reduce(
              (acc, b) => acc + Math.max((b.movements || []).length, 1),
              0
            );

            return batches.map((batch, bIdx) => {
              const movements = batch.movements || [];
              const batchRowSpan = Math.max(movements.length, 1);
              const rows = movements.length > 0 ? movements : [null];

              return rows.map((mov: any, mIdx: number) => {
                const isIN = mov?.stock_in > 0;
                const isFirstProduct = bIdx === 0 && mIdx === 0;
                const isFirstBatch = mIdx === 0;

                const ratio = Number(batch.unit_ratio || 1);
                const baseCost = Number(batch.cost_price || 0) / ratio;
                const baseSell = Number(batch.selling_price || 0) / ratio;

                return (
                  <tr
                    key={`${batch.batch_id}-${mIdx}`}
                    className={mov?.stock_in > 0 ? "print-row-in" : mov?.stock_out > 0 ? "print-row-out" : ""}
                  >
                    {/* Product */}
                    {isFirstProduct && (
                      <td rowSpan={productRowSpan} className="pbtd product-col align-top">
                        <div className="flex items-center gap-1 pt-0.5">
                          <Package size={10} className="text-[#009966] shrink-0" />
                          <span className="font-black text-[11px] text-gray-800 leading-tight">{product.product}</span>
                        </div>
                        <div className="text-[8px] text-gray-400 pl-3.5 mt-0.5">
                          {batches.length} {batches.length === 1 ? "batch" : "batches"}
                        </div>
                      </td>
                    )}

                    {/* Batch No */}
                    {isFirstBatch && (
                      <td rowSpan={batchRowSpan} className="pbtd batch-col align-top">
                        <span className="font-mono font-bold text-blue-700 text-[10px] block">{batch.batch_no}</span>
                        <span className={`text-[8px] font-bold mt-0.5 block ${batch.totalBalance <= 0 ? "text-red-500" : "text-blue-600"}`}>
                          Bal: {batch.totalBalance} {batch.base_unit_name}
                        </span>
                      </td>
                    )}

                    {/* Date */}
                    <td className="pbtd">
                      {mov ? (
                        <>
                          <span className="text-[10px] text-gray-800 font-medium block">
                            {new NepaliDate(new Date(mov.date)).format("MMMM DD, YYYY")}
                          </span>
                          <span className="text-[8px] text-gray-400">
                            {dayjs(mov.date).format("MMM DD, YYYY")}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Unit */}
                    <td className="pbtd">
                      <Tag color="blue" className="text-[9px] font-semibold">
                        {batch.purchase_unit_name || batch.base_unit_name || "—"}
                      </Tag>
                    </td>

                    {/* Cost Price */}
                    <td className="pbtd text-right">
                      <span className="font-mono text-[10px] text-gray-700">
                        {Number(batch.cost_price || 0).toLocaleString()}
                      </span>
                      <div className="text-[8px] text-gray-400">/ {batch.purchase_unit_name || "unit"}</div>
                      {ratio > 1 && (
                        <div className="text-[7.5px] text-emerald-600 italic border-t border-emerald-50 mt-1 pt-1">
                          {baseCost.toFixed(2)} / {batch.base_unit_name}
                        </div>
                      )}
                    </td>

                    {/* Sell Price */}
                    <td className="pbtd text-right">
                      <span className="font-mono font-bold text-[10px] text-[#009966]">
                        {Number(batch.selling_price || 0).toLocaleString()}
                      </span>
                      <div className="text-[8px] text-gray-400">/ {batch.purchase_unit_name || "unit"}</div>
                      {ratio > 1 && (
                        <div className="text-[7.5px] text-blue-600 italic border-t border-blue-50 mt-1 pt-1">
                          {baseSell.toFixed(2)} / {batch.base_unit_name}
                        </div>
                      )}
                    </td>

                    {/* Stock IN */}
                    <td className="pbtd text-right">
                      {mov?.stock_in > 0 ? (
                        <span className="font-mono font-bold text-[10px] text-green-700 block">
                          +{mov.stock_in} <span className="text-[8px] font-normal">{batch.base_unit_name}</span>
                        </span>
                      ) : (
                        <span className="text-gray-300 text-[10px]">—</span>
                      )}
                    </td>

                    {/* Stock OUT */}
                    <td className="pbtd text-right">
                      {mov?.stock_out > 0 ? (
                        <span className="font-mono font-bold text-[10px] text-red-600 block">
                          -{mov.stock_out} <span className="text-[8px] font-normal">{batch.base_unit_name}</span>
                        </span>
                      ) : (
                        <span className="text-gray-300 text-[10px]">—</span>
                      )}
                    </td>

                    {/* Balance */}
                    <td className="pbtd text-right">
                      {mov ? (
                        <span className={`font-mono font-black text-[10px] block ${Number(mov.balance) <= 0 ? "text-red-500" : "text-blue-700"}`}>
                          {mov.balance} <span className="text-[8px] text-gray-400 font-normal">{batch.base_unit_name}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">—</span>
                      )}
                    </td>

                    {/* ── Total Cost IN ── */}
                    <td className="pbtd text-right bg-green-50/30">
                      {mov?.stock_in > 0 ? (
                        <span className="font-mono text-[9px] font-bold text-green-800">
                          {Number(mov.stock_in * baseCost).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* ── Total Sales OUT ── */}
                    <td className="pbtd text-right bg-red-50/30">
                      {mov?.stock_out > 0 ? (
                        <span className="font-mono text-[9px] font-bold text-red-800">
                          {Number(mov.stock_out * baseSell).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* ── Est Value Remaining ── */}
                    <td className="pbtd text-right">
                      {mov ? (
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-[8.5px] font-bold text-gray-700 leading-tight">
                            {Number(mov.balance * baseCost).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              });
            });
          })}
        </tbody>
      </table>

      {/* ── Financial Footer ── */}
      <div className="mt-4 border-2 border-gray-800 p-3 bg-gray-50 flex gap-6 justify-between items-center text-[10px]">
        <div className="flex-1 border-r border-gray-300 pr-4">
          <p className="uppercase font-black text-gray-500 mb-0.5 tracking-wider">Total Cost Invested</p>
          <p className="font-mono font-bold text-base text-gray-900">{fmt(financials.totalCostInvested)}</p>
        </div>
        <div className="flex-1 border-r border-gray-300 px-4">
          <p className="uppercase font-black text-gray-500 mb-0.5 tracking-wider">Total Selling Amount</p>
          <p className="font-mono font-bold text-base text-gray-900">{fmt(financials.totalSellValue)}</p>
        </div>
        <div className="flex-1 border-r border-gray-300 px-4">
          <p className="uppercase font-black text-gray-500 mb-0.5 tracking-wider">Cost Value Remaining</p>
          <p className="font-mono font-bold text-base text-gray-900">{fmt(financials.remainingCostValue)}</p>
        </div>
        <div className="flex-1 pl-4">
          <p className="uppercase font-black text-gray-500 mb-0.5 tracking-wider">Est. Value Remaining</p>
          <p className="font-mono font-bold text-base text-gray-900">{fmt(financials.remainingSellValue)}</p>
        </div>
      </div>

      {/* ── Signatures ── */}
      <div className="mt-8 flex justify-between gap-12 px-4 pt-12">
        {["Prepared By", "Checked By", "Approved By"].map((label) => (
          <div key={label} className="flex-1 text-center pt-2 border-t border-gray-800">
            <p className="text-[10px] font-black uppercase tracking-tighter">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="mt-5 text-[9px] text-gray-400 flex justify-between border-t border-gray-100 pt-2 italic">
        <div>{mounted ? `Printed: ${dayjs().format("YYYY-MM-DD hh:mm:ss A")}` : ""}</div>
        <div className="font-bold text-gray-500">System: BBMedX</div>
      </div>

      <style jsx global>{`
        @media print {
          body { font-family: 'Poppins', sans-serif; -webkit-print-color-adjust: exact; }
          @page { margin: 8mm !important; size: A4 landscape; }
        }
        .print-batch-table { width: 100%; border-collapse: collapse; }
        .pbth {
          background-color: #f8fafc !important;
          color: #1e293b !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 9px !important;
          padding: 7px 10px !important;
          border-bottom: 2px solid #000 !important;
          border-top: 1px solid #cbd5e1 !important;
          white-space: nowrap;
        }
        .pbtd {
          padding: 6px 10px !important;
          font-size: 10px !important;
          border-bottom: 1px solid #e2e8f0 !important;
          vertical-align: middle;
          background: white;
        }
        .product-col {
          background: linear-gradient(160deg, #f0fdf4 0%, #f8fafc 100%) !important;
          border-right: 3px solid #009966 !important;
          vertical-align: top !important;
          padding-top: 10px !important;
        }
        .batch-col {
          background: linear-gradient(160deg, #eff6ff 0%, #f8fafc 100%) !important;
          border-right: 2px solid #3b82f6 !important;
          vertical-align: top !important;
          padding-top: 10px !important;
        }
        .print-row-in td { background-color: #f0fdf4 !important; }
        .print-row-out td { background-color: #fff5f5 !important; }
        .print-row-in .product-col, .print-row-out .product-col {
          background: linear-gradient(160deg, #f0fdf4 0%, #f8fafc 100%) !important;
        }
        .print-row-in .batch-col, .print-row-out .batch-col {
          background: linear-gradient(160deg, #eff6ff 0%, #f8fafc 100%) !important;
        }
      `}</style>
    </div>
  );
}
