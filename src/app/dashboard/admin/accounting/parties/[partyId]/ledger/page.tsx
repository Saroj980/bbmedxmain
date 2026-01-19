"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Phone, Mail } from "lucide-react";
import { DataTable } from "@/components/datatable/DataTable";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";

type LedgerRow = {
  date: string;
  journal_no: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

export default function PartyLedgerPage() {
  const { partyId } = useParams();

  const [party, setParty] = useState<any>(null);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadLedger = async () => {
    setLoading(true);
    try {
      console.log("Fetching ledger for party ID:", partyId);
      const res = await api.get(`/parties/${partyId}/ledger`, {
        params: { from, to },
      });

      setParty(res.data.party);
      setLedger(res.data.ledger);
      setSummary(res.data.summary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const groupedLedger = useMemo(() => {
    const map: Record<string, LedgerRow[]> = {};

    ledger.forEach((row) => {
      if (!map[row.journal_no]) {
        map[row.journal_no] = [];
      }
      map[row.journal_no].push(row);
    });

    return Object.entries(map).map(([journal_no, rows]) => ({
      journal_no,
      date: rows[0].date,
      description: rows[0].description,
      rows,
      total_debit: rows.reduce((s, r) => s + Number(r.debit || 0), 0),
      total_credit: rows.reduce((s, r) => s + Number(r.credit || 0), 0),
      balance: rows[rows.length - 1].balance,
    }));
  }, [ledger]);


  const columns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
      },
      {
        accessorKey: "journal_no",
        header: "Journal #",
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "debit",
        header: "Debit",
        cell: ({ row }: any) =>
          row.original.debit > 0 ? row.original.debit : "",
      },
      {
        accessorKey: "credit",
        header: "Credit",
        cell: ({ row }: any) =>
          row.original.credit > 0 ? row.original.credit : "",
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }: any) => {
          const b = row.original.balance;
          return (
            <span
              className={
                b >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"
              }
            >
              {Math.abs(b)} {b >= 0 ? "Dr" : "Cr"}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Accounting" },
          { label: "Party Ledger", href: "/dashboard/admin/accounting/party-ledgers" },
          { label: party?.name || "Ledger" },
        ]}
      />
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
              Payment Status
            </p>

            {summary.closing_balance > 0 && (
              <p className="text-lg font-semibold text-green-700 mb-0" style={{marginBottom: 0}}>
                Receivable
              </p>
            )}

            {summary.closing_balance < 0 && (
              <p className="text-lg font-semibold text-red-700 mb-0" style={{marginBottom: 0}}>
                Payable
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


      {/* Header */}
      {party && (
        <div className="sticky top-0 z-10 bg-white border rounded-xl p-5 shadow">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

            {/* LEFT */}
            <div>
              {/* Name */}
              <h2 className="text-lg font-semibold text-gray-800">
                {party.name}
              </h2>

              {/* Meta Row: Type • Phone • Email */}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">

                {/* Type Badge */}
                <span
                  className={`px-2 py-0.5 font-medium uppercase tracking-wide
                    ${
                      party.type === "supplier"
                        ? "bg-gray-900 text-white"
                        : "bg-green-700 text-white border-green-800"
                    }
                  `}
                >
                  {party.type}
                </span>

                {/* Phone */}
                {party.phone && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                  bg-blue-50 text-blue-700 border border-blue-200">
                    <Phone size={12} />
                    {party.phone}
                  </span>
                )}

                {/* Email */}
                {party.email && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                  bg-purple-50 text-purple-700 border border-purple-200">
                    <Mail size={12} />
                    {party.email}
                  </span>
                )}
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




      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs text-gray-600">From Date</label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-gray-600">To Date</label>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>

        <Button className="bg-[#009966] text-white" onClick={loadLedger}>
          Apply Filter
        </Button>
      </div>

      {/* Ledger Table */}
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
                <td className="border px-3 py-2 text-gray-600">
                  {r.date}
                </td>

                {/* Journal No */}
                <td className="border px-3 py-2 text-gray-700 font-mono">
                  {r.journal_no}
                </td>

                {/* Particulars */}
                <td className="border px-3 py-2">
                  <p className="font-medium text-gray-800">
                    {r.description || "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isDebit ? "To" : "By"} {party?.name}
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



      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-xl p-5 bg-[#F6FAF8]">
          <div className="text-center ">
            <p className="text-sm text-gray-500">
              Total Debit (Payments / Purchases)
            </p>
            <p className="font-semibold">
              {formatNepaliCurrency(summary.total_debit)}
            </p>
          </div>

          <div className="text-center ">
            <p className="text-sm text-gray-500">
              Total Credit (Receipts / Sales)
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
