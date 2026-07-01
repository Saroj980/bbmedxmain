"use client";

import React from "react";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import PrintHeader from "@/components/common/PrintHeader";

interface Props {
  data: any;
  systemSettings: any;
}

export default function PartyLedgerPrintView({ data, systemSettings }: Props) {
  const party = data?.party;
  const ledger = data?.ledger || [];
  const summary = data?.summary;
  const fiscalYear = data?.fiscal_year;

  return (
    <div className="p-8 text-[11px] leading-tight font-sans text-gray-900 bg-white" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
      <PrintHeader systemSettings={systemSettings} title="PARTY LEDGER" />

      {/* PARTY INFO SECTION */}
      <div className="grid grid-cols-2 gap-8 mb-6 border-b-2 border-gray-100 pb-4">
        <div className="space-y-2">
          <div className="flex gap-2 items-baseline">
            <span className="text-gray-500 font-bold uppercase text-[9px] w-24">Party Name:</span>
            <span className="text-sm font-black text-gray-900 uppercase">{party?.name}</span>
          </div>
          <div className="flex gap-2 items-baseline text-xs">
             <span className="text-gray-400 font-bold uppercase text-[9px] w-24">Category:</span>
             <span className="font-bold px-2 py-0.5 rounded-full text-[9px] bg-gray-100 text-gray-600 uppercase">
                {party?.type || "None"}
             </span>
          </div>
          <div className="flex gap-4 mt-2">
             {party?.phone && (
                <div className="flex gap-1 items-center">
                    <span className="text-gray-400 font-bold uppercase text-[8px]">Phone:</span>
                    <span className="font-bold">{party.phone}</span>
                </div>
             )}
             {party?.email && (
                <div className="flex gap-1 items-center">
                    <span className="text-gray-400 font-bold uppercase text-[8px]">Email:</span>
                    <span className="font-bold text-blue-600 underline">{party.email}</span>
                </div>
             )}
          </div>
        </div>
        
        <div className="space-y-2 text-right">
          <div className="flex flex-col">
            <span className="text-gray-500 font-bold uppercase text-[9px]">Fiscal Year</span>
            <span className="text-sm font-black text-gray-900">
                {fiscalYear ? `${fiscalYear.name} (${fiscalYear.bs_start} - ${fiscalYear.bs_end})` : "General Period"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 font-bold uppercase text-[9px]">Outstanding Balance</span>
            <span className={`text-lg font-black ${summary?.closing_balance >= 0 ? "text-[#009966]" : "text-red-600"}`}>
               {formatNepaliCurrency(Math.abs(summary?.closing_balance || 0))} 
               <span className="text-[10px] ml-1">{summary?.closing_balance >= 0 ? "Dr" : "Cr"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr className="bg-gray-100 text-gray-900 uppercase">
            <th className="border border-gray-900 px-2 py-1.5 text-left font-bold w-[12%]">Date</th>
            <th className="border border-gray-900 px-2 py-1.5 text-left font-bold w-[15%]">Journal #</th>
            <th className="border border-gray-900 px-2 py-1.5 text-left font-bold">Particulars / Remarks</th>
            <th className="border border-gray-900 px-2 py-1.5 text-right font-bold w-[13%]">Debit</th>
            <th className="border border-gray-900 px-2 py-1.5 text-right font-bold w-[13%]">Credit</th>
            <th className="border border-gray-900 px-2 py-1.5 text-right font-bold w-[15%]">Balance</th>
          </tr>
        </thead>
        <tbody>
          {ledger.map((entry: any, idx: number) => {
             const balance = entry.balance;
             const isDr = balance >= 0;
             return (
                <tr key={idx}>
                  <td className="border border-gray-900 px-2 py-1 text-gray-900 font-medium whitespace-nowrap">
                    {dayjs(entry.date).format("YYYY-MM-DD")}
                  </td>
                  <td className="border border-gray-900 px-2 py-1 font-bold text-gray-900">
                    {entry.journal_no}
                  </td>
                  <td className="border border-gray-900 px-2 py-1 leading-snug">
                     <div className="font-bold text-gray-900 uppercase text-[9px] mb-0.5">{entry.description}</div>
                     {entry.remarks && <div className="text-[8px] text-gray-600 italic leading-none">{entry.remarks}</div>}
                  </td>
                  <td className="border border-gray-900 px-2 py-1 text-right font-bold text-gray-900">
                    {entry.debit > 0 ? formatNepaliCurrency(entry.debit) : "—"}
                  </td>
                  <td className="border border-gray-900 px-2 py-1 text-right font-bold text-gray-900">
                    {entry.credit > 0 ? formatNepaliCurrency(entry.credit) : "—"}
                  </td>
                  <td className={`border border-gray-900 px-2 py-1 text-right font-black ${isDr ? "text-green-700" : "text-red-700"}`}>
                    {formatNepaliCurrency(Math.abs(balance))} {isDr ? "Dr" : "Cr"}
                  </td>
                </tr>
             );
          })}
        </tbody>
        <tfoot className="font-bold text-[10px]">
          <tr>
            <td colSpan={3} className="border border-gray-900 px-2 py-1.5 text-right uppercase tracking-wider">Statement Summary</td>
            <td className="border border-gray-900 px-2 py-1.5 text-right text-gray-900">
              {formatNepaliCurrency(summary?.total_debit || 0)}
            </td>
            <td className="border border-gray-900 px-2 py-1.5 text-right text-gray-900">
              {formatNepaliCurrency(summary?.total_credit || 0)}
            </td>
            <td className={`border border-gray-900 px-2 py-1.5 text-right font-black ${summary?.closing_balance >= 0 ? "text-green-700" : "text-red-700"}`}>
              {formatNepaliCurrency(Math.abs(summary?.closing_balance || 0))} {summary?.closing_balance >= 0 ? "Dr" : "Cr"}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* SIGNATURES SECTION */}
      <div className="mt-20 grid grid-cols-3 gap-12 text-center text-[9px] uppercase font-black tracking-tighter">
        <div>
          <div className="border-t-2 border-gray-900 pt-2 w-4/5 mx-auto">Prepared By</div>
        </div>
        <div>
          <div className="border-t-2 border-gray-900 pt-2 w-4/5 mx-auto">Checked By</div>
        </div>
        <div>
          <div className="border-t-2 border-gray-900 pt-2 w-4/5 mx-auto">Authorized By</div>
        </div>
      </div>
      
      {/* PRINT FOOTER */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-[8px] text-gray-400 flex justify-between italic tracking-wide">
        <span>Statement Printed at: {dayjs().format("YYYY-MM-DD HH:mm:ss")}</span>
        <span>Pharmacy Ledger Statement - Page 1 of 1</span>
      </div>
    </div>
  );
}
