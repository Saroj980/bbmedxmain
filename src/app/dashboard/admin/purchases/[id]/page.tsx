/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import PurchasePaymentDrawer from "@/components/purchases/PurchasePaymentDrawer";
import { toast } from "sonner";
import React from "react";
import { RotateCcw } from "lucide-react";

// import { useRouter } from "next/navigation";
// import router from "next/router";

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openPayment, setOpenPayment] = useState(false);

  const [reverseModalOpen, setReverseModalOpen] = useState(false);
  const [reverseReason, setReverseReason] = useState("");
  const [reversePaymentId, setReversePaymentId] = useState<number | null>(null);


  const router = useRouter();

  useEffect(() => {
    api.get(`/purchases/${id}`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Not found</p>;

  const { purchase, summary, journals} = data;
  const supplierAccountId = purchase.supplier.account_id;

  const reversePayment = async (paymentId: number) => {

    setReversePaymentId(paymentId);
    setReverseReason("");
    setReverseModalOpen(true);

    // console.log("Reversing payment", paymentId);
    // if (!confirm("Are you sure you want to reverse this payment?")) return;

    // try {
    //   await api.post(`/purchase/${paymentId}/reverse`);
    //   toast.success("Payment reversed");

    //   const res = await api.get(`/purchases/${purchase.id}`);
    //   setData(res.data);
    // } catch (err: any) {
    //   toast.error(err?.response?.data?.message || "Failed to reverse payment");
    // }
  };

  const confirmReversePayment = async () => {
    if (!reverseReason.trim()) {
      toast.error("Please provide a reason for reversal");
      return;
    }

    try {
      await api.post(`/purchase/${reversePaymentId}/reverse`, {
        reason: reverseReason,
      });

      toast.success("Payment reversed successfully");

      setReverseModalOpen(false);
      setReversePaymentId(null);

      const res = await api.get(`/purchases/${purchase.id}`);
      setData(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reverse payment");
    }
  };



  const ledgerRows = (() => {
    const rows: any[] = [];

    // Purchase journal
    if (journals?.purchase?.entries?.length) {
      journals.purchase.entries.forEach((e: any) => {
        rows.push({
          date: journals.purchase.journal_date,
          journal_no: journals.purchase.journal_no,
          source: "Purchase",
          account: `${e.account.code} – ${e.account.name}`,
          debit: Number(e.debit),
          credit: Number(e.credit),
        });
      });
    }

    // Payment journals
    journals?.payments?.forEach((pj: any) => {
      pj.entries.forEach((e: any) => {
        rows.push({
          date: pj.journal_date,
          journal_no: pj.journal_no,
          payment_id: pj.payment_id, 
          is_reversed: pj.is_reversed, 
          description: pj.description,
          source: "Payment",
          account: `${e.account.code} – ${e.account.name}`,
          debit: Number(e.debit),
          credit: Number(e.credit),
        });
      });
    });

    // console.log(journals?.payments);

    // Sort by date (ledger rule)
    rows.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Running balance
    let balance = 0;
      return rows.map(r => {
        balance += r.debit - r.credit;
        return { ...r, balance };
      });
    })();

    // const outstandingBalance = ledgerRows.length > 0
    //   ? ledgerRows[ledgerRows.length - 1].balance
    //   : summary.total_amount;
  const outstandingBalance = (() => {
    let balance = 0;

    // Purchase journal
    journals?.purchase?.entries?.forEach((e: any) => {
      if (e.account_id === supplierAccountId) {
        balance += Number(e.debit) - Number(e.credit);
      }
    });

    // Payment journals
    journals?.payments?.forEach((j: any) => {
      j.entries.forEach((e: any) => {
        if (e.account_id === supplierAccountId) {
          balance += Number(e.debit) - Number(e.credit);
        }
      });
    });

    return balance;
  })();

  const payableAmount = Math.abs(outstandingBalance);
  const isPayable = outstandingBalance < 0;
  const defaultPaymentAmount = Math.abs(outstandingBalance);

  const groupedLedger = ledgerRows.reduce((acc: any, row: any) => {
    if (!acc[row.journal_no]) {
      acc[row.journal_no] = {
        journal_no: row.journal_no,
        date: row.date,
        source: row.source,
        payment_id: row.payment_id, 
        is_reversed: row.is_reversed,
        rows: [],
        description: row.description,
      };
    }

    acc[row.journal_no].rows.push(row);
    return acc;
  }, {});
  const groupedLedgerList = Object.values(groupedLedger);

  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Purchases", href: "/dashboard/admin/purchases" },
          { label: purchase.invoice_no },
        ]}
      />

      {/* ================= HEADER ================= */}
      <div className="bg-white border rounded-xl p-6 flex justify-between items-start mt-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Purchase Invoice
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Invoice No: <span className="font-medium">{purchase.invoice_no}</span>
          </p>
          <p className="text-sm text-gray-500">
            Invoice Date: {dayjs(purchase.invoice_date).format("DD MMM YYYY")}
          </p>
        </div>

        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium
              ${
                purchase.status === "open"
                  ? "bg-blue-100 text-blue-700"
                  : purchase.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }
            `}
          >
            {purchase.status.toUpperCase()}
          </span>

          <p className="mt-4 text-xs text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-green-700">
            {formatNepaliCurrency(summary.total_amount)}
          </p>
        </div>
      </div>

      {/* ================= SUPPLIER ================= */}
      <div className="bg-white border rounded-xl p-6 grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Supplier Information
          </h4>

          <p className="font-medium">{purchase.supplier.name}</p>
          <p className="text-sm text-gray-500">
            Supplier Code: {purchase.supplier.code}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Document Reference
          </h4>

          <p className="text-sm">
            Supplier Invoice No:{" "}
            <span className="font-medium">
              {purchase.supplier_invoice_no || "-"}
            </span>
          </p>
        </div>
      </div>

      {/* ================= ITEMS ================= */}
      <div className="bg-white border rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">
          Purchased Items
        </h4>

        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="text-left">Batch</th>
              <th className="text-left">Expiry</th>
              <th className="text-right">Qty</th>
              
              <th className="text-right">Cost</th>
              <th className="text-right">Selling</th>
              <th className="text-right">VAT</th>
              <th className="text-right">Line Total</th>
            </tr>
          </thead>

          <tbody>
            {purchase.items.map((i: any) => (
              <tr key={i.id} className="border-b last:border-0">
                <td className="p-3 font-medium text-left">
                  {i.product.name}
                </td>

                <td className="text-left">{i.batch.batch_no}</td>

                <td className="text-left">
                  {i.batch.expiry_date
                    ? dayjs(i.batch.expiry_date).format("YYYY-MM-DD")
                    : "-"}
                </td>

                <td className="text-right">
                  <span className="text-sm font-medium">
                    {i.unit_breakdown?.[0]?.qty} {i.unit_breakdown?.[0]?.unit}
                  </span>

                  {i.unit_breakdown?.length > 1 && (
                    <span className="text-xs text-gray-500 ml-1">
                      (
                      {i.unit_breakdown
                        .slice(1)
                        .map((u: any) => `${formatNepaliCurrency(u.qty)} ${u.unit}`)
                        .join(" / ")}
                      )
                    </span>
                  )}
                </td>

                <td className="text-right">
                  {formatNepaliCurrency(i.cost_price)}
                </td>

                <td className="text-right">
                  {formatNepaliCurrency(i.selling_price)}
                </td>

                <td className="text-right">
                  {formatNepaliCurrency(i.vat_amount)}
                </td>

                <td className="text-right font-semibold">
                  {formatNepaliCurrency(
                    Number(i.inventory_value) + Number(i.vat_amount)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {/* ================= TOTALS ================= */}
      <div className="bg-[#F6FAF8] border rounded-xl p-6 grid grid-cols-4 gap-6 text-sm">
        <div className="text-right">
          <p className="text-gray-500">Gross Amount</p>
          <p className="font-semibold">
            {formatNepaliCurrency(summary.gross_amount)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-gray-500">VAT</p>
          <p className="font-semibold">
            {formatNepaliCurrency(summary.vat_amount)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-gray-500">Discount</p>
          <p className="font-semibold">
            {formatNepaliCurrency(summary.discount_amount)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-gray-500">Net Payable</p>
          <p className="font-bold text-green-700 text-lg">
            {formatNepaliCurrency(summary.total_amount)}
          </p>
        </div>
      </div>


      {/* ================= JOURNAL ================= */}
      <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700">
            Accounting Ledger
          </h4>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-xs uppercase text-gray-600">
              <th className="border px-3 py-2 text-left w-[110px]">Date</th>
              <th className="border px-3 py-2 text-left">Journal #</th>
              <th className="border px-3 py-2 text-left">Particulars</th>
              <th className="border px-3 py-2 text-right w-[140px]">Debit (NPR)</th>
              <th className="border px-3 py-2 text-right w-[140px]">Credit (NPR)</th>
              <th className="border px-3 py-2 text-right w-[160px]">Balance</th>
              <th className="border px-3 py-2 text-center w-[90px]">Action</th>
            </tr>
          </thead>

          <tbody>
            {groupedLedgerList.map((group: any) => {
              const isPayment = group.source === "Payment";
              const rowCount = group.rows.length;
              const reversalReason = group.description?.includes("Reason:")
                  ? group.description.split("Reason:")[1]?.trim()
                  : null;
              return group.rows.map((r: any, idx: number) => (
                <tr
                  key={`${group.journal_no}-${idx}`}
                  className={[
                    "hover:bg-green-50",
                    group.is_reversed ? "border-l-4 border-red-500" : ""
                  ].join(" ")}
                >

                  {/* DATE (once) */}
                  {idx === 0 && (
                    <td
                      rowSpan={rowCount}
                      className="border px-3 py-2 align-center font-medium"
                    >
                      {dayjs(group.date).format("YYYY-MM-DD")}
                    </td>
                  )}

                  {/* JOURNAL (once) */}
                  {idx === 0 && (
                    <td
                      rowSpan={rowCount}
                      className="border px-3 py-2 align-center font-mono"
                    >
                      {group.journal_no}
                      <div className="text-xs text-gray-500">
                        {group.source}
                      </div>

                       {/* Reversal Reason */}
                      {group.is_reversed && reversalReason && (
                        <div className="mt-1 text-xs text-red-600">
                          Reason: {reversalReason}
                        </div>
                      )}
                    </td>
                  )}

                  {/* PARTICULARS */}
                  <td className="border px-3 py-2">
                    <p className="font-medium">{r.account}</p>
                    <p className="text-xs text-gray-500">
                      {r.source === "Purchase"
                        ? "To Purchase A/c"
                        : "By Payment"}
                    </p>
                  </td>

                  {/* DEBIT */}
                  <td className="border px-3 py-2 text-right text-green-700">
                    {r.debit > 0 ? formatNepaliCurrency(r.debit) : ""}
                  </td>

                  {/* CREDIT */}
                  <td className="border px-3 py-2 text-right text-red-700">
                    {r.credit > 0 ? formatNepaliCurrency(r.credit) : ""}
                  </td>

                  {/* BALANCE */}
                  <td className="border px-3 py-2 text-right font-semibold">
                    <span
                      className={
                        r.balance >= 0 ? "text-green-700" : "text-red-700"
                      }
                    >
                      {formatNepaliCurrency(Math.abs(r.balance))}{" "}
                      {r.balance >= 0 ? "Dr" : "Cr"}
                    </span>
                  </td>

                  {/* ACTION (once per journal) */}
                  {idx === 0 && (
                    <td
                      rowSpan={rowCount}
                      className="border px-3 py-2 text-center align-center"
                    >
                      {isPayment && !group.is_reversed ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                          title="Reverse Payment"
                          onClick={() => reversePayment(group.payment_id)}
                        >
                          <RotateCcw size={16} />
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ));
            })}
          </tbody>

          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td colSpan={5} className="border px-3 py-3 text-right">
                Outstanding Balance
              </td>
              <td className="border px-3 py-3 text-right">
                <span
                  className={
                    outstandingBalance < 0 ? "text-red-700" : "text-green-700"
                  }
                >
                  {formatNepaliCurrency(Math.abs(outstandingBalance))}{" "}
                  {outstandingBalance < 0 ? "Cr" : "Dr"}
                </span>

              </td>
              <td className="border px-3 py-3 text-right"></td>
            </tr>
          </tfoot>
        </table>
        {isPayable && (
            <div className="flex justify-end mt-4 px-4 pb-4">
              <Button
                className="bg-[#009966] text-white"
                onClick={() => setOpenPayment(true)}
              >
                Add Payment
              </Button>
            </div>
          )}
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex gap-3 justify-end">
        {/* <Button variant="outline">Print</Button>
        <Button variant="outline">Download PDF</Button> */}
        <Button
          className="bg-[#009966] text-white"
          onClick={() =>
            router.push(
              `/dashboard/admin/accounting/parties/${purchase.supplier.id}/ledger`
            )
          }
        >
          View Supplier Ledger
        </Button>

      </div>

      <PurchasePaymentDrawer
        open={openPayment}
        onClose={() => setOpenPayment(false)}
        purchase={purchase}
        outstandingAmount={Math.abs(outstandingBalance)}
        onSuccess={() => {
          api.get(`/purchases/${purchase.id}`).then(res => setData(res.data));
        }}
      />

      {reverseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800">
              Reverse Payment
            </h3>

            <p className="text-sm text-gray-500">
              Please provide a reason for reversing this payment.
            </p>

            <textarea
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              placeholder="e.g. Wrong bank selected, duplicate payment..."
              value={reverseReason}
              onChange={(e) => setReverseReason(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setReverseModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={confirmReversePayment}
              >
                Confirm Reverse
              </Button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
  

}

