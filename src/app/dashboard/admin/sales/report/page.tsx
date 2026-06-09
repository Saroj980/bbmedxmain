/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "antd";
import { Printer, X } from "lucide-react";
import { api } from "@/lib/api";
import ListingPrintHeader from "@/components/common/ListingPrintHeader";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import NepaliDate from "nepali-date";
import dayjs from "dayjs";

function SalesReportContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const filters = {
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    fiscal_year_id: searchParams.get("fiscal_year_id") ? Number(searchParams.get("fiscal_year_id")) : null,
  };

  useEffect(() => {
    Promise.all([
      api.get("/sales", { params: { ...filters, per_page: 1000 } }),
      api.get("/system-settings"),
    ])
      .then(([salesRes, settingsRes]) => {
        setData(salesRes.data.data || []);
        setSystemSettings(settingsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading report...</div>;

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

      {/* Print Container */}
      <div className="max-w-[1000px] mx-auto bg-white p-8 print:p-0">
        <ListingPrintHeader
          title="Sales Invoices Report"
          systemSettings={systemSettings}
          filters={filters}
        />

        <table className="w-full mt-8 border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100 border-y-2 border-gray-200">
              <th className="p-2 text-center border w-8">SN</th>
              <th className="p-2 text-left border">Invoice #</th>
              <th className="p-2 text-left border">Date (BS)</th>
              <th className="p-2 text-left border">Customer</th>
              <th className="p-2 text-left border w-[30%]">Particulars</th>
              <th className="p-2 text-right border">Rate × Qty</th>
              <th className="p-2 text-right border">Gross</th>
              <th className="p-2 text-right border">VAT (13%)</th>
              <th className="p-2 text-right border">Net Total</th>
              <th className="p-2 text-center border">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id} className="border-b align-top">
                <td className="p-2 border text-center">{index + 1}</td>
                <td className="p-2 border font-medium">
                  {item.invoice_no}
                </td>
                <td className="p-2 border whitespace-nowrap">
                  {new NepaliDate(new Date(item.invoice_date)).format("YYYY-MM-DD")}
                </td>
                <td className="p-2 border">
                  <div className="font-semibold text-gray-900">
                    {item.customer?.name || item.walkin_name || "Walk-in"}
                    {item.customer?.code ? ` (${item.customer.code})` : ""}
                  </div>
                </td>
                {/* Particulars */}
                <td className="p-2 border">
                  <div className="space-y-1">
                    {item.items?.map((li: any, lidx: number) => (
                      <div key={lidx} className="text-[10px] text-gray-700">
                        <span className="font-semibold text-gray-900">{li.product?.name}</span>
                        {li.vat_included && (
                          <span className="ml-1 text-[8px] bg-orange-100 text-orange-700 font-bold px-1 rounded">VAT</span>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                {/* Rate × Qty */}
                <td className="p-2 border text-right">
                  <div className="space-y-1">
                    {item.items?.map((li: any, lidx: number) => {
                      const qty = li.quantity || 0;
                      const rate = li.selling_price || 0;
                      const units = li.unit_breakdown?.map((ub: any) => `${ub.qty} ${ub.unit}`).join(" + ") || `${qty}`;
                      return (
                        <div key={lidx} className="text-[9px] text-gray-600 whitespace-nowrap">
                          {formatNepaliCurrency(rate)} × {units}
                        </div>
                      );
                    })}
                  </div>
                </td>
                {/* Gross */}
                <td className="p-2 border text-right">
                  <div className="space-y-1">
                    {item.items?.map((li: any, lidx: number) => {
                      const gross = Number(li.inventory_value || 0);
                      return (
                        <div key={lidx} className="text-[10px] font-medium">
                          {formatNepaliCurrency(gross)}
                        </div>
                      );
                    })}
                  </div>
                </td>
                {/* VAT */}
                <td className="p-2 border text-right">
                  <div className="space-y-1">
                    {item.items?.map((li: any, lidx: number) => {
                      const vat = Number(li.vat_amount || 0);
                      return (
                        <div key={lidx} className={`text-[10px] ${vat > 0 ? "text-orange-600 font-medium" : "text-gray-400"}`}>
                          {vat > 0 ? formatNepaliCurrency(vat) : "—"}
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="p-2 border text-right font-bold bg-gray-50/50">{formatNepaliCurrency(item.total_amount)}</td>
                <td className="p-2 border text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    item.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                    item.status === 'partial' ? 'bg-orange-100 text-orange-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold text-xs">
              <td colSpan={6} className="p-2 border text-right">TOTAL</td>
              <td className="p-2 border text-right">
                {formatNepaliCurrency(data.reduce((sum, inv) => sum + Number(inv.gross_amount || 0), 0))}
              </td>
              <td className="p-2 border text-right text-orange-600">
                {formatNepaliCurrency(data.reduce((sum, inv) => sum + Number(inv.vat_amount || 0), 0))}
              </td>
              <td className="p-2 border text-right">
                {formatNepaliCurrency(data.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0))}
              </td>
              <td className="p-2 border"></td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-20 grid grid-cols-3 gap-8 text-[10px] text-center sign-section">
            <div>
                <div className="border-t-2 border-gray-900 pt-1.5 mt-10">
                    <p className="font-black uppercase tracking-tighter text-gray-900">Prepared By</p>
                </div>
            </div>
            <div>
                <div className="border-t-2 border-gray-900 pt-1.5 mt-10">
                    <p className="font-black uppercase tracking-tighter text-gray-900">Checked By</p>
                </div>
            </div>
            <div>
                <div className="border-t-2 border-gray-900 pt-1.5 mt-10">
                    <p className="font-black uppercase tracking-tighter text-gray-900 flex flex-col">
                        <span>Authorized Signatory</span>
                        <span className="text-[7px] text-gray-400 mt-0.5 italic lowercase">({systemSettings?.firm_name || "firm"})</span>
                    </p>
                </div>
            </div>
        </div>

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

export default function SalesReportPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SalesReportContent />
        </Suspense>
    );
}
