/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { numberToWords } from "@/utils/numberToWords";
import PrintHeader from "@/components/common/PrintHeader";

interface Props {
  purchase: any;
  summary: any;
  systemSettings?: any;
}

export default function PurchaseInvoicePrintView({ purchase, summary, systemSettings }: Props) {
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const items = purchase?.items || [];
  const supplier = purchase?.supplier || {};

  /* ---- Totals ---- */
  const grossAmount = Number(summary?.gross_amount || purchase?.gross_amount || 0);
  const vatAmount = Number(summary?.vat_amount || purchase?.vat_amount || 0);
  const discountAmount = Number(summary?.discount_amount || purchase?.discount_amount || 0);
  const carrierCost = Number(purchase?.carrier_cost || 0);
  const totalAmount = Number(summary?.total_amount || purchase?.total_amount || 0);

  return (
    <div className="p-8 text-[11px] leading-tight font-sans text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>

      <PrintHeader systemSettings={systemSettings} title="Purchase Invoice" />

      {/* ======== INVOICE META ======== */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-[10px]">
        <div className="space-y-1">
          <div className="grid grid-cols-[110px_1fr]">
            <span className="font-bold">Invoice No:</span>
            <span>{purchase.invoice_no}</span>
          </div>
          <div className="grid grid-cols-[110px_1fr]">
            <span className="font-bold">Invoice Date:</span>
            <span>{dayjs(purchase.invoice_date).format("YYYY-MM-DD")}</span>
          </div>
          <div className="grid grid-cols-[110px_1fr]">
            <span className="font-bold">Supplier Inv No:</span>
            <span>{purchase.supplier_invoice_no || "—"}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-[110px_1fr]">
            <span className="font-bold">Supplier:</span>
            <span className="font-semibold">{supplier.name}</span>
          </div>
          <div className="grid grid-cols-[110px_1fr]">
            <span className="font-bold">Supplier Code:</span>
            <span>{supplier.code || "—"}</span>
          </div>
          <div className="grid grid-cols-[110px_1fr]">
            <span className="font-bold">Contact:</span>
            <span>{supplier.phone || supplier.email || "—"}</span>
          </div>
          <div className="grid grid-cols-[110px_1fr]">
            <span className="font-bold">Status:</span>
            <span className="uppercase font-bold">{purchase.status}</span>
          </div>
        </div>
      </div>

      {/* ======== IRD ITEMS TABLE ======== */}
      <table className="w-full border-collapse border border-gray-900 text-[10px] mb-4">
        <thead>
          <tr className="bg-gray-100 font-black uppercase text-[9px] tracking-wider">
            <th className="border border-gray-900 px-2 py-1.5 text-center w-8">S.N.</th>
            <th className="border border-gray-900 px-2 py-1.5 text-center w-20">HS Code</th>
            <th className="border border-gray-900 px-2 py-1.5 text-left">Particulars</th>
            <th className="border border-gray-900 px-2 py-1.5 text-center w-24">Batch</th>
            <th className="border border-gray-900 px-2 py-1.5 text-center w-24">Expiry</th>
            <th className="border border-gray-900 px-2 py-1.5 text-right w-14">Qty</th>
            <th className="border border-gray-900 px-2 py-1.5 text-right w-16">Rate</th>
            <th className="border border-gray-900 px-2 py-1.5 text-right w-20">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, idx: number) => {
            const lineAmount = Number(item.inventory_value || 0);
            return (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="border border-gray-900 px-2 py-1 text-center">{idx + 1}</td>
                <td className="border border-gray-900 px-2 py-1 text-center">{item.batch?.hs_code || "—"}</td>
                <td className="border border-gray-900 px-2 py-1 font-medium">{item.product?.name}</td>
                <td className="border border-gray-900 px-2 py-1 text-center">{item.batch?.batch_no || "—"}</td>
                <td className="border border-gray-900 px-2 py-1 text-center">
                  {item.batch?.expiry_date ? dayjs(item.batch.expiry_date).format("YYYY-MM-DD") : "—"}
                </td>
                <td className="border border-gray-900 px-2 py-1 text-right">
                  <div>
                    {item.unit_breakdown?.[0]?.qty ?? item.quantity}
                    <span className="text-[8px] ml-0.5 text-gray-500">
                      {item.unit_breakdown?.[0]?.unit || ""}
                    </span>
                  </div>
                  {item.free_unit_breakdown && item.free_unit_breakdown.length > 0 && (
                    <div className="text-[8px] font-bold mt-0.5 text-gray-700">
                      +{item.free_unit_breakdown[0].qty} {item.free_unit_breakdown[0].unit} (Free)
                    </div>
                  )}
                </td>
                <td className="border border-gray-900 px-2 py-1 text-right">
                  {formatNepaliCurrency(item.cost_price)}
                </td>
                <td className="border border-gray-900 px-2 py-1 text-right font-semibold">
                  {formatNepaliCurrency(lineAmount)}
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* ======== TOTALS ======== */}
        <tfoot>
          <tr className="font-bold bg-gray-50">
            <td colSpan={7} className="border border-gray-900 px-2 py-1 text-right">
              Gross Amount
            </td>
            <td className="border border-gray-900 px-2 py-1 text-right">
              {formatNepaliCurrency(grossAmount)}
            </td>
          </tr>
          {discountAmount > 0 && (
            <tr className="font-bold">
              <td colSpan={7} className="border border-gray-900 px-2 py-1 text-right">
                Discount
              </td>
              <td className="border border-gray-900 px-2 py-1 text-right text-red-700">
                ({formatNepaliCurrency(discountAmount)})
              </td>
            </tr>
          )}
          <tr className="font-bold">
            <td colSpan={7} className="border border-gray-900 px-2 py-1 text-right">
              Taxable Amount
            </td>
            <td className="border border-gray-900 px-2 py-1 text-right">
              {formatNepaliCurrency(grossAmount - discountAmount)}
            </td>
          </tr>
          <tr className="font-bold">
            <td colSpan={7} className="border border-gray-900 px-2 py-1 text-right">
              Taxable Amount
            </td>
            <td className="border border-gray-900 px-2 py-1 text-right">
              {formatNepaliCurrency(grossAmount - discountAmount)}
            </td>
          </tr>
          {vatAmount > 0 && (
            <tr className="font-bold">
              <td colSpan={7} className="border border-gray-900 px-2 py-1 text-right">
                VAT (13%)
              </td>
              <td className="border border-gray-900 px-2 py-1 text-right">
                {formatNepaliCurrency(vatAmount)}
              </td>
            </tr>
          )}
          {carrierCost > 0 && (
            <tr className="font-bold">
              <td colSpan={7} className="border border-gray-900 px-2 py-1 text-right">
                Carrier / Transport Cost
              </td>
              <td className="border border-gray-900 px-2 py-1 text-right">
                {formatNepaliCurrency(carrierCost)}
              </td>
            </tr>
          )}
          <tr className="font-black bg-gray-100 text-xs">
            <td colSpan={7} className="border border-gray-900 px-2 py-2 text-right uppercase tracking-wider">
              Grand Total
            </td>
            <td className="border border-gray-900 px-2 py-2 text-right">
              {formatNepaliCurrency(totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* ======== AMOUNT IN WORDS ======== */}
      <div className="border border-gray-900 px-3 py-2 mb-6 bg-gray-50">
        <span className="font-bold text-[10px]">Amount in Words: </span>
        <span className="text-[10px] italic">
          Rupees {numberToWords(totalAmount)}
        </span>
      </div>

      {/* ======== REMARKS ======== */}
      {purchase.remarks && (
        <div className="mb-6 text-[10px]">
          <span className="font-bold">Remarks: </span>
          <span>{purchase.remarks}</span>
        </div>
      )}

      {/* ======== SIGNATURES ======== */}
      <div className="grid grid-cols-3 gap-8 mt-16 text-[10px] text-center">
        <div>
          <div className="border-t border-gray-900 pt-1 mt-10">
            <p className="font-bold">Prepared By</p>
            <p className="text-gray-500">{purchase.creator?.name || "—"}</p>
          </div>
        </div>
        <div>
          <div className="border-t border-gray-900 pt-1 mt-10">
            <p className="font-bold">Checked By</p>
          </div>
        </div>
        <div>
          <div className="border-t border-gray-900 pt-1 mt-10">
            <p className="font-bold">Authorized Signatory</p>
          </div>
        </div>
      </div>

      {/* ======== FOOTER ======== */}
      <div className="text-center text-[8px] text-gray-400 mt-8 border-t pt-2">
        This is a computer-generated document. Printed on {isClient ? dayjs().format("YYYY-MM-DD HH:mm") : "—"}
      </div>
    </div>

    
  );
}
