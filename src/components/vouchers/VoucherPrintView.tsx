/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { numberToWords } from "@/utils/numberToWords";
import { adToBs } from "@/utils/adToBs";
import PrintHeader from "@/components/common/PrintHeader";

interface Props {
  voucher: any;
  systemSettings?: any;
}

export default function VoucherPrintView({ voucher, systemSettings }: Props) {
  const entries = voucher?.entries || [];

  const getVoucherTitle = () => {
    if (!voucher?.journal_no) return "VOUCHER";
    if (voucher.journal_no.startsWith("PAY-")) return "PAYMENT VOUCHER";
    if (voucher.journal_no.startsWith("RCV-")) return "RECEIPT VOUCHER";
    if (voucher.journal_no.startsWith("JV-")) return "JOURNAL VOUCHER";
    if (voucher.journal_no.startsWith("CONTRA-")) return "CONTRA VOUCHER";
    if (voucher.journal_no.startsWith("PUR-")) return "PURCHASE VOUCHER";
    if (voucher.journal_no.startsWith("SAL-")) return "SALES VOUCHER";
    if (voucher.journal_no.startsWith("DN-")) return "DEBIT NOTE";
    if (voucher.journal_no.startsWith("CN-")) return "CREDIT NOTE";
    if (voucher.journal_no.startsWith("OB-") || voucher.journal_no.startsWith("OPEN-")) return "OPENING BALANCE VOUCHER";
    if (voucher.journal_no.startsWith("REV-")) return "REVERSAL VOUCHER";
    return "JOURNAL VOUCHER";
  };

  let displayEntries = entries;

  // For Sales Vouchers, hide internal COGS (5100) and Inventory (1310) entries
  if (voucher?.journal_no?.startsWith("SAL-")) {
    displayEntries = entries.filter((e: any) => {
      const code = e.account?.code;
      return code !== "5100" && code !== "1310";
    });
  }

  const computedDebit = displayEntries.reduce((sum: number, e: any) => sum + Number(e.debit || 0), 0);
  const computedCredit = displayEntries.reduce((sum: number, e: any) => sum + Number(e.credit || 0), 0);

  return (
    <div className="p-8 text-[11px] leading-tight font-sans text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>

      <PrintHeader systemSettings={systemSettings} title={getVoucherTitle()} />

      {/* ======== VOUCHER META ======== */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-[10px]">
        <div className="space-y-1">
          <div className="grid grid-cols-[80px_1fr]">
            <span className="font-bold">Voucher No:</span>
            <span>{voucher?.journal_no}</span>
          </div>
          <div className="grid grid-cols-[80px_1fr]">
            <span className="font-bold">Date:</span>
            <span>
                {dayjs(voucher?.journal_date).format("YYYY-MM-DD")} (AD) 
                {adToBs(voucher?.journal_date) && ` / ${adToBs(voucher?.journal_date)} (BS)`}
            </span>
          </div>
        </div>

        <div className="space-y-1 text-right">
            {/* Added for symmetry or future use */}
        </div>
      </div>

      {/* ======== OVERALL DESCRIPTION ======== */}
      {voucher?.description && (
        <div className="mb-4">
          <span className="font-bold text-[10px]">Narration / Particulars: </span>
          <span>{voucher.description}</span>
        </div>
      )}

      {/* ======== ENTRIES TABLE ======== */}
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-900 px-2 py-1.5 text-center w-8">S.N.</th>
            <th className="border border-gray-900 px-2 py-1.5 text-left">A/c Code</th>
            <th className="border border-gray-900 px-2 py-1.5 text-left">Account Head</th>
            <th className="border border-gray-900 px-2 py-1.5 text-right w-24">Debit (Rs.)</th>
            <th className="border border-gray-900 px-2 py-1.5 text-right w-24">Credit (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          {displayEntries.map((entry: any, index: number) => {
            const isDebit = Number(entry.debit) > 0;
            return (
              <tr key={entry.id}>
                <td className="border border-gray-900 px-2 py-1 text-center">{index + 1}</td>
                <td className="border border-gray-900 px-2 py-1 text-left">{entry.account?.code || "—"}</td>
                <td className="border border-gray-900 px-2 py-1 font-medium">
                  {!isDebit && <span className="mr-6"></span>} {/* Indent Cr entries visually if desired, though separate columns help */}
                  {entry.account?.name || "Unknown A/c"}
                </td>
                <td className="border border-gray-900 px-2 py-1 text-right tracking-tight">
                  {isDebit ? formatNepaliCurrency(entry.debit) : ""}
                </td>
                <td className="border border-gray-900 px-2 py-1 text-right tracking-tight">
                  {!isDebit ? formatNepaliCurrency(entry.credit) : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
        
        {/* TOTALS */}
        <tfoot className="font-bold">
          <tr>
            <td colSpan={3} className="border border-gray-900 px-2 py-1.5 text-right">
              Grand Total
            </td>
            <td className="border border-gray-900 px-2 py-1.5 text-right">
              {formatNepaliCurrency(computedDebit)}
            </td>
            <td className="border border-gray-900 px-2 py-1.5 text-right">
              {formatNepaliCurrency(computedCredit)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-3 text-[10px]">
        <span className="font-bold">Amount in Words: </span>
        {numberToWords(computedDebit)} Rupees Only
      </div>

      {voucher?.remarks && (
        <div className="mt-2 text-[10px]">
          <span className="font-bold">Remarks: </span>
          {voucher.remarks}
        </div>
      )}

      {/* ======== SIGNATURES ======== */}
      <div className="mt-16 grid grid-cols-3 gap-8 text-center text-[10px]">
        <div>
          <div className="border-t border-gray-400 pt-1 w-3/4 mx-auto font-medium">Prepared By</div>
          <div className="text-gray-500 mt-0.5">{voucher?.creator?.name || "—"}</div>
        </div>
        <div>
          <div className="border-t border-gray-400 pt-1 w-3/4 mx-auto font-medium">Checked By</div>
        </div>
        <div>
          <div className="border-t border-gray-400 pt-1 w-3/4 mx-auto font-medium">Authorized By</div>
        </div>
      </div>
    </div>
  );
}
