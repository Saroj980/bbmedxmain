/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { numberToWords } from "@/utils/numberToWords";
import NepaliDate from "nepali-date";
import PrintHeader from "@/components/common/PrintHeader";

interface Props {
  sale: any;
  summary: any;
  systemSettings?: any;
}

export default function SaleInvoicePrintView({ sale, summary, systemSettings }: Props) {
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const items = sale?.items || [];
  const customer = sale?.customer || {};

  /* ---- Totals ---- */
  const grossAmount = Number(summary?.gross_amount || 0);
  const taxableAmount = items.reduce((sum: number, i: any) => i.vat_included ? sum + Number(i.inventory_value || 0) : sum, 0);
  const vatAmount = Number(summary?.vat_amount || 0);
  const discountAmount = Number(summary?.discount_amount || 0);
  const totalAmount = Number(summary?.total_amount || 0);

  const nepaliDate = sale?.invoice_date ? new NepaliDate(new Date(sale.invoice_date)).format("YYYY-MM-DD") : "—";
  const invoiceTime = sale?.created_at ? dayjs(sale.created_at).format("HH:mm A") : dayjs().format("HH:mm A");

  const overallDiscountPercent = grossAmount > 0 ? (discountAmount / grossAmount) * 100 : 0;

  return (
    <div className="p-8 text-[11px] leading-tight font-sans text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>

      <PrintHeader systemSettings={systemSettings} title="Tax Invoice" />

      {/* ======== INFO SECTION ======== */}
      <div className="grid grid-cols-2 gap-8 mb-6 text-[10px]">
        {/* Bill To */}
        <div className="space-y-1.5">
          <h4 className="font-black uppercase text-[9px] text-gray-400 tracking-wider">Bill To:</h4>
          <div className="text-xs font-bold text-gray-900">{customer.name}</div>
          <div className="text-gray-600">{customer.address || "Address: —"}</div>
          <div className="text-gray-600">PAN/VAT No: <span className="font-bold">{customer.pan_no || "—"}</span></div>
          <div className="text-gray-600">Contact: {customer.phone || customer.email || "—"}</div>
        </div>

        {/* Invoice Meta */}
        <div className="space-y-1">
          <div className="flex justify-between border-b border-gray-100 pb-1">
            <span className="font-bold uppercase text-[9px] text-gray-400">Invoice No:</span>
            <span className="font-black text-gray-900">{sale.invoice_no}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-1">
            <span className="font-bold uppercase text-[9px] text-gray-400">Date (A.D.):</span>
            <span className="font-medium text-gray-900">
                {dayjs(sale.invoice_date).format("YYYY-MM-DD")}
                <span className="ml-2 text-gray-400 text-[9px]">{invoiceTime}</span>
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-100 py-1">
            <span className="font-bold uppercase text-[9px] text-gray-400">Date (B.S.):</span>
            <span className="font-medium text-gray-900">
                {nepaliDate}
                <span className="ml-2 text-gray-400 text-[9px]">{invoiceTime}</span>
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-bold uppercase text-[9px] text-gray-400">Method:</span>
            <span className="font-bold uppercase text-gray-900">{sale.status}</span>
          </div>
        </div>
      </div>

      {/* ======== ITEMS TABLE ======== */}
      <table className="w-full border-collapse border border-gray-900 text-[10px] mb-6">
        <thead>
          <tr className="bg-gray-100 font-black uppercase text-[8px] text-gray-700">
            <th className="border border-gray-900 px-2 py-2 text-center w-8">S.N.</th>
            <th className="border border-gray-900 px-2 py-2 text-center w-16">HS Code</th>
            <th className="border border-gray-900 px-2 py-2 text-left">Particulars</th>
            <th className="border border-gray-900 px-2 py-2 text-center w-24">Batch</th>
            <th className="border border-gray-900 px-2 py-2 text-center w-16">Expiry</th>
            <th className="border border-gray-900 px-2 py-2 text-right w-12">Qty</th>
            <th className="border border-gray-900 px-2 py-2 text-right w-16">Orig. Rate</th>
            <th className="border border-gray-900 px-2 py-2 text-right w-16">Disc</th>
            <th className="border border-gray-900 px-2 py-2 text-right w-16">Rate</th>
            <th className="border border-gray-900 px-2 py-2 text-right w-20">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, idx: number) => {
            const lineAmount = Number(item.inventory_value || 0);
            return (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="border border-gray-900 px-2 py-1.5 text-center font-medium">{idx + 1}</td>
                <td className="border border-gray-900 px-2 py-1.5 text-center text-gray-500 uppercase">{item.hs_code || "—"}</td>
                <td className="border border-gray-900 px-2 py-1.5 font-bold text-gray-900">{item.product?.name}</td>
                <td className="border border-gray-900 px-2 py-1.5 text-center text-gray-600 font-medium">{item.batch?.batch_no || "—"}</td>
                <td className="border border-gray-900 px-2 py-1.5 text-center text-gray-600">
                  {item.batch?.expiry_date ? dayjs(item.batch.expiry_date).format("YYYY-MM") : "—"}
                </td>
                <td className="border border-gray-900 px-2 py-1.5 text-right">
                  <div>
                    <span className="font-black text-gray-900">{item.unit_breakdown?.[0]?.qty ?? item.quantity}</span>
                    <span className="text-[7px] ml-0.5 text-gray-500 uppercase font-medium">{item.unit_breakdown?.[0]?.unit || ""}</span>
                  </div>
                  {Number(item.free_qty) > 0 && (
                    <div className="text-[8px] font-bold italic mt-0.5 whitespace-nowrap">
                      + {Number(item.free_qty)} Free
                    </div>
                  )}
                </td>
                <td className="border border-gray-900 px-2 py-1.5 text-right text-gray-400 line-through">
                  {formatNepaliCurrency(item.original_price || item.selling_price)}
                </td>
                <td className="border border-gray-900 px-2 py-1.5 text-right">
                  {Number(item.discount_amount) > 0 ? (
                    <div className="leading-[1]">
                        <div className="text-red-600 font-bold">-{formatNepaliCurrency(item.discount_amount)}</div>
                        <div className="text-[8px] text-gray-400 font-medium">({((Number(item.discount_amount) / Number(item.original_price || item.selling_price)) * 100).toFixed(1)}%)</div>
                    </div>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="border border-gray-900 px-2 py-1.5 text-right font-bold text-gray-900">
                  {formatNepaliCurrency(item.selling_price)}
                </td>
                <td className="border border-gray-900 px-2 py-1.5 text-right font-black text-gray-900">
                  {formatNepaliCurrency(lineAmount)}
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* ======== TOTALS ======== */}
        <tfoot>
          <tr className="font-bold">
            <td colSpan={9} className="border border-gray-900 px-3 py-1.5 text-right uppercase text-[9px] tracking-wider text-gray-500">
              Gross Total
            </td>
            <td className="border border-gray-900 px-2 py-1.5 text-right font-bold text-gray-900">
              {formatNepaliCurrency(grossAmount)}
            </td>
          </tr>
          <tr className="font-bold bg-gray-50">
            <td colSpan={9} className="border border-gray-900 px-3 py-1.5 text-right uppercase text-[9px] tracking-wider text-gray-900">
              Taxable Amount
            </td>
            <td className="border border-gray-900 px-2 py-1.5 text-right font-black text-gray-900">
              {formatNepaliCurrency(taxableAmount)}
            </td>
          </tr>
          <tr className="font-bold">
            <td colSpan={9} className="border border-gray-900 px-3 py-1.5 text-right uppercase text-[9px] tracking-wider text-gray-500">
              VAT (13%)
            </td>
            <td className="border border-gray-900 px-2 py-1.5 text-right font-bold text-orange-700">
              {formatNepaliCurrency(vatAmount)}
            </td>
          </tr>
          <tr className="font-bold border-t-2 border-gray-900">
            <td colSpan={9} className="border border-gray-900 px-3 py-1.5 text-right uppercase text-[9px] tracking-wider text-gray-900">
                Total Amount
            </td>
            <td className="border border-gray-900 px-2 py-1.5 text-right font-black text-gray-900">
                {formatNepaliCurrency(grossAmount + vatAmount)}
            </td>
          </tr>
          {discountAmount > 0 && (
            <tr className="font-bold italic">
              <td colSpan={9} className="border border-gray-900 px-3 py-1.5 text-right uppercase text-[9px] tracking-wider text-red-600">
                Overall Discount
                <span className="ml-1 text-[8px] text-gray-400 font-medium not-italic">({overallDiscountPercent.toFixed(1)}%)</span>
              </td>
              <td className="border border-gray-900 px-2 py-1.5 text-right text-red-700 font-bold">
                ({formatNepaliCurrency(discountAmount)})
              </td>
            </tr>
          )}
          <tr className="font-black bg-gray-900 text-white">
            <td colSpan={9} className="border border-gray-900 px-3 py-2.5 text-right uppercase text-[10px] tracking-widest">
              Net Payable
            </td>
            <td className="border border-gray-900 px-2 py-2.5 text-right text-xs font-black">
              {formatNepaliCurrency(totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* ======== AMOUNT IN WORDS ======== */}
      <div className="border-2 border-gray-900 px-4 py-3 mb-8 bg-gray-50 relative overflow-hidden">
        {/* <div className="absolute top-0 right-0 p-1 opacity-10 font-black text-4xl uppercase pointer-events-none">OFFICIAL</div> */}
        <span className="font-black text-[9px] uppercase text-gray-400 block mb-1">Amount in Words:</span>
        <span className="text-xs font-bold italic text-gray-900">
          Rupees {numberToWords(totalAmount)}.
        </span>
      </div>

      {/* ======== REMARKS ======== */}
      {sale.remarks && (
        <div className="mb-8 p-3 border border-dashed border-gray-300 rounded text-[10px]">
          <span className="font-black uppercase text-[8px] text-gray-400 block mb-1 tracking-tighter">Remarks:</span>
          <span className="text-gray-700 leading-relaxed">{sale.remarks}</span>
        </div>
      )}

      {/* ======== SIGNATURES (matching Purchase Print) ======== */}
      <div className="grid grid-cols-3 gap-8 mt-20 text-[10px] text-center">
        <div>
          <div className="border-t-2 border-gray-900 pt-1.5 mt-10">
            <p className="font-black uppercase tracking-tighter text-gray-900">Prepared By</p>
            <p className="text-gray-500 font-medium">{sale.creator?.name || "—"}</p>
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
        <p>This is a computer-generated TAX INVOICE. Generated by BBMedx ERP System.</p>
        <p className="text-[7px]">Printed on {isClient ? dayjs().format("YYYY-MM-DD HH:mm:ss") : "—"}</p>
      </div>
    </div>
  );
}
