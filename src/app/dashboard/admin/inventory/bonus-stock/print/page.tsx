"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "antd";
import { Printer, X } from "lucide-react";
import { api } from "@/lib/api";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { ADToBS } from "bikram-sambat-js";
import ListingPrintHeader from "@/components/common/ListingPrintHeader";

function PrintFreeBonusesContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fromAD = searchParams.get("from");
  const toAD = searchParams.get("to");

  const loadData = async () => {
    try {
      const params: any = {};
      if (fromAD) params.from = fromAD;
      if (toAD) params.to = toAD;

      const [res, settingsRes] = await Promise.all([
        api.get("/free-bonuses", { params }),
        api.get("/system-settings")
      ]);
      setData(res.data.data || []);
      setSystemSettings(settingsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fromAD, toAD]);

  const getDateString = () => {
    if (!fromAD && !toAD) return "All Time";
    const bsFrom = fromAD ? ADToBS(fromAD) : "";
    const bsTo = toAD ? ADToBS(toAD) : "";
    if (bsFrom && bsTo && bsFrom === bsTo) {
      return bsFrom;
    }
    return `${bsFrom || "Start"} to ${bsTo || "End"}`;
  };

  if (loading) {
    return <div className="p-10 text-center">Loading print data...</div>;
  }

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Control Bar */}
      <div className="py-4 bg-gray-50 border-b border-gray-200 no-print print:hidden">
        <div className="max-w-[1000px] mx-auto flex justify-center gap-4 px-4">
          <Button
            className="bg-[#009966] hover:bg-[#008055] border-none font-bold shadow-md shadow-green-100"
            icon={<Printer size={18} />}
            onClick={() => window.print()}
            size="large"
          >
            Print Report
          </Button>
          <Button
            size="large"
            icon={<X size={18} />}
            onClick={() => window.close()}
            className="border-gray-200 hover:border-red-200 hover:text-red-500 font-bold transition-all"
          >
            Close
          </Button>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto bg-white p-8 print:p-0">
        <ListingPrintHeader
          title="Free / Bonuses Received"
          systemSettings={systemSettings}
          filters={{ from: fromAD, to: toAD }}
        />

        <table className="w-full mt-8 text-left border-collapse border border-gray-300 text-xs">
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            <th className="p-2 border border-gray-300">Purchase Date</th>
            <th className="p-2 border border-gray-300">Invoice No.</th>
            <th className="p-2 border border-gray-300">Supplier</th>
            <th className="p-2 border border-gray-300">Product</th>
            <th className="p-2 border border-gray-300">Batch / Expiry</th>
            <th className="p-2 border border-gray-300 text-right">Unit Cost</th>
            <th className="p-2 border border-gray-300 text-right">Free Qty</th>
            <th className="p-2 border border-gray-300 text-right">CC Charge</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-4 text-center text-gray-500 border border-gray-300">
                No free items or bonuses found.
              </td>
            </tr>
          ) : (
            data.map((row: any, idx: number) => {
              const ub = row.free_unit_breakdown || [];
              return (
                <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="p-2 border border-gray-300">
                    {dayjs(row.purchase?.invoice_date).format("YYYY-MM-DD")}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {row.purchase?.invoice_no || "-"}
                  </td>
                  <td className="p-2 border border-gray-300">
                    {row.purchase?.supplier?.name || "-"}
                  </td>
                  <td className="p-2 border border-gray-300 font-semibold">
                    {row.product?.name || "-"}
                  </td>
                  <td className="p-2 border border-gray-300">
                    <div>{row.batch?.batch_no || "-"}</div>
                    <div className="text-[10px] text-gray-500">
                      Exp: {row.batch?.expiry_date ? dayjs(row.batch?.expiry_date).format("YYYY-MM-DD") : "-"}
                    </div>
                  </td>
                  <td className="p-2 border border-gray-300 text-right text-gray-700">
                    {formatNepaliCurrency(row.cost_price || 0)}
                  </td>
                  <td className="p-2 border border-gray-300 text-right">
                    {ub.length === 0 ? "-" : (
                      <div className="flex flex-col items-end gap-0.5">
                        {ub.map((u: any, i: number) => (
                          <span key={i} className="flex items-center gap-1">
                            <span className="font-bold text-gray-800 text-xs">{u.qty}</span>
                            <span className="uppercase text-[9px] text-gray-600 font-medium">{u.unit}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-2 border border-gray-300 text-right">
                    {row.carrier_cost > 0 ? formatNepaliCurrency(row.carrier_cost) : "-"}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      
      {/* ======== FOOTER ======== */}
      <div className="text-center text-[8px] text-gray-400 mt-12 border-t pt-2 space-y-1 font-medium tracking-wide">
          <p>This is a computer-generated report. Generated by BBMedx ERP System.</p>
          <p className="text-[7px]">Printed on {dayjs().format("YYYY-MM-DD HH:mm:ss")}</p>
      </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            margin: 10mm !important;
            size: landscape;
          }
        }
      `}</style>
    </div>
  );
}

export default function PrintFreeBonuses() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PrintFreeBonusesContent />
        </Suspense>
    );
}
