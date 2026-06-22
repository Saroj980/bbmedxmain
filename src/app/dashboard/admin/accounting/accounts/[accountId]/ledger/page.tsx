"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Book, Hash } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import FiscalYearSelect from "@/components/common/FiscalYearSelect";
import { Printer } from "lucide-react";

type LedgerRow = {
  date: string;
  journal_no: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

export default function AccountLedgerPage() {
  const { accountId } = useParams();

  const [account, setAccount] = useState<any>(null);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fiscalYearId, setFiscalYearId] = useState<string | number | null>(null);

  const loadLedger = async (fyId = fiscalYearId) => {
    setLoading(true);
    try {
      const res = await api.get(`/accounts/${accountId}/ledger`, {
        params: { from, to, fiscal_year_id: fyId },
      });

      setAccount(res.data.account);
      setLedger(res.data.ledger);
      setSummary(res.data.summary);
    } finally {
      setLoading(false);
    }
  };

  const handleFiscalYearChange = (id: any) => {
    setFiscalYearId(id);
    setFrom("");
    setTo("");
    loadLedger(id);
  };

  const handlePrint = () => {
    const url = `/dashboard/admin/accounting/accounts/${accountId}/ledger/print?fiscal_year_id=${fiscalYearId || ""}&from=${from}&to=${to}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    loadLedger();
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Accounting" },
          { label: "Chart of Accounts", href: "/dashboard/admin/accounting/accounts" },
          { label: account?.name || "Account Ledger" },
        ]}
      />

      {/* Summary Status Card (Same as Party Ledger) */}
      {summary && (
        <div
          className={`rounded-xl p-4 border flex justify-between items-center mt-4
            ${
              summary.closing_balance > 0
                ? "bg-green-50 border-green-300"
                : summary.closing_balance < 0
                ? "bg-red-50 border-red-300"
                : "bg-gray-50 border-gray-300"
            }
          `}
        >
          <div>
            <p className="text-xs uppercase text-gray-500">
              Account Status
            </p>

            {summary.closing_balance > 0 && (
              <p className="text-lg font-semibold text-green-700 mb-0" style={{marginBottom: 0}}>
                Positive Balance (Dr)
              </p>
            )}

            {summary.closing_balance < 0 && (
              <p className="text-lg font-semibold text-red-700 mb-0" style={{marginBottom: 0}}>
                Negative Balance (Cr)
              </p>
            )}

            {summary.closing_balance === 0 && (
              <p className="text-lg font-semibold text-gray-700 mb-0" style={{marginBottom: 0}}>
                Nil Balance
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-2xl font-bold mb-0" style={{marginBottom: 0}}>
              NPR {formatNepaliCurrency(Math.abs(summary.closing_balance))}
            </p>
          </div>
        </div>
      )}

      {/* Header (Same as Party Ledger) */}
      {account && (
        <div className="sticky top-0 z-10 bg-white border rounded-xl p-5 shadow">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

            {/* LEFT */}
            <div>
              {/* Name */}
              <h2 className="text-lg font-semibold text-gray-800">
                {account.name}
              </h2>

              {/* Meta Row: Code • Type */}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">

                {/* Code Badge */}
                <span className="bg-gray-900 text-white px-2 py-0.5 font-medium uppercase tracking-wide">
                  {account.code}
                </span>

                {/* Type Badge */}
                <span className="bg-indigo-700 text-white px-2 py-0.5 font-medium uppercase tracking-wide border-indigo-800">
                  {account.type}
                </span>
              </div>
            </div>

            {/* RIGHT */}
            {summary && (
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  Closing Balance
                </p>

                <p
                  className={`text-lg font-semibold ${
                    summary.closing_balance >= 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {formatNepaliCurrency(
                    Math.abs(summary.closing_balance)
                  )}{" "}
                  <span className="text-sm">
                    {summary.closing_balance >= 0 ? "Dr" : "Cr"}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters (Same as Party Ledger) */}
      <div className="flex flex-wrap gap-4 items-end bg-white p-4 border rounded-xl shadow-sm">
        <div className="w-full md:w-64">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Fiscal Year</label>
          <FiscalYearSelect 
            value={fiscalYearId} 
            onChange={handleFiscalYearChange}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">From Date</label>
          <Input
            type="date"
            value={from}
            onChange={(e) => {
                setFrom(e.target.value);
                setFiscalYearId(null);
            }}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">To Date</label>
          <Input
            type="date"
            value={to}
            onChange={(e) => {
                setTo(e.target.value);
                setFiscalYearId(null);
            }}
          />
        </div>

        <div className="flex gap-2">
            <Button className="bg-[#009966] hover:bg-[#007a52] text-white" onClick={() => loadLedger()} disabled={loading}>
              {loading ? "Loading..." : "Apply Filter"}
            </Button>

            <Button variant="outline" className="border-gray-300 hover:bg-gray-50" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print Ledger
            </Button>
        </div>
      </div>

      {/* Ledger Table (Same as Party Ledger) */}
      <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
       <table className="w-full border-collapse text-sm">
         {/* TABLE HEADER */}
         <thead>
           <tr className="bg-gray-100 text-xs uppercase text-gray-600">
             <th className="border px-3 py-2 text-left w-[110px]">Date</th>
             <th className="border px-3 py-2 text-left w-[140px]">Journal #</th>
             <th className="border px-3 py-2 text-left">Particulars</th>
             <th className="border px-3 py-2 text-right w-[140px]">Debit (NPR)</th>
             <th className="border px-3 py-2 text-right w-[140px]">Credit (NPR)</th>
             <th className="border px-3 py-2 text-right w-[160px]">Balance</th>
           </tr>
         </thead>

         {/* TABLE BODY */}
         <tbody>
           {ledger.map((r, idx) => {
             const isDebit = r.debit > 0;

             return (
               <tr
                 key={idx}
                 className={`${
                   idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                 } hover:bg-green-50`}
               >
                 {/* Date */}
                 <td className="border px-3 py-2 text-gray-600 text-xs">
                   {r.date}
                 </td>

                 {/* Journal No */}
                 <td className="border px-3 py-2 text-gray-700 font-mono text-xs">
                   {r.journal_no}
                 </td>

                 {/* Particulars */}
                 <td className="border px-3 py-2">
                   <p className="font-medium text-gray-800">
                     {r.description || "—"}
                   </p>
                   <p className="text-xs text-gray-500">
                     {isDebit ? "To" : "By"} {account?.name}
                   </p>
                 </td>

                 {/* Debit */}
                 <td className="border px-3 py-2 text-right font-mono">
                   {r.debit > 0 ? formatNepaliCurrency(r.debit) : ""}
                 </td>

                 {/* Credit */}
                 <td className="border px-3 py-2 text-right font-mono">
                   {r.credit > 0 ? formatNepaliCurrency(r.credit) : ""}
                 </td>

                 {/* Running Balance */}
                 <td className="border px-3 py-2 text-right font-semibold">
                   <span
                     className={
                       r.balance >= 0
                         ? "text-green-700"
                         : "text-red-700"
                     }
                   >
                     {formatNepaliCurrency(Math.abs(r.balance))}{" "}
                     <span className="text-xs">
                       {r.balance >= 0 ? "Dr" : "Cr"}
                     </span>
                   </span>
                 </td>
               </tr>
             );
           })}
         </tbody>
       </table>
     </div>

      {/* Summary Footer (Same as Party Ledger) */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-xl p-5 bg-[#F6FAF8]">
          <div className="text-center ">
            <p className="text-sm text-gray-500">
              Total Debit
            </p>
            <p className="font-semibold">
              {formatNepaliCurrency(summary.total_debit)}
            </p>
          </div>

          <div className="text-center ">
            <p className="text-sm text-gray-500">
              Total Credit
            </p>
            <p className="font-semibold">
              {formatNepaliCurrency(summary.total_credit)}
            </p>
          </div>

          <div className="text-center ">
            <p className="text-sm text-gray-500">
              Closing Balance
            </p>
            <p
              className={`font-semibold ${
                summary.closing_balance >= 0
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {formatNepaliCurrency(Math.abs(summary.closing_balance))}{" "}
              {summary.closing_balance >= 0 ? "Dr" : "Cr"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
