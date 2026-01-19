/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";

import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";

export default function SaleDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const openInvoicePdf = async (saleId: number) => {
    const res = await api.get(`/sales/${saleId}/invoice-pdf-url`);
    window.open(res.data.url, "_blank");
 };


  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/sales/${id}`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!data) return <p className="p-6">Not found</p>;

  const { sale, summary } = data;

  return (
    <div className="space-y-6">

      {/* ================= BREADCRUMB ================= */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Sales", href: "/dashboard/admin/sales" },
          { label: sale.invoice_no },
        ]}
      />

      {/* ================= HEADER ================= */}
      <div className="bg-white border rounded-xl p-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">
            Sales Invoice
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Invoice No: <span className="font-medium">{sale.invoice_no}</span>
          </p>
          <p className="text-sm text-gray-500">
            Invoice Date: {dayjs(sale.invoice_date).format("DD MMM YYYY")}
          </p>
        </div>

        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium
              ${
                sale.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : sale.status === "partial"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }
            `}
          >
            {sale.status.toUpperCase()}
          </span>

          <p className="mt-4 text-xs text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-green-700">
            {formatNepaliCurrency(summary.total_amount)}
          </p>
        </div>
      </div>

      {/* ================= CUSTOMER ================= */}
      <div className="bg-white border rounded-xl p-6 grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Customer Information
          </h4>

          <p className="font-medium">{sale.customer.name}</p>
          <p className="text-sm text-gray-500">
            Customer Code: {sale.customer.code}
          </p>
        </div>
      </div>

      {/* ================= ITEMS ================= */}
      <div className="bg-white border rounded-xl p-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">
          Sold Items
        </h4>

        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="text-left">Batch</th>
              <th className="text-left">Expiry</th>
              <th className="text-right">Quantity</th>
              <th className="text-right">Rate</th>
              <th className="text-right">VAT</th>
              <th className="text-right">Line Total</th>
            </tr>
          </thead>

          <tbody>
            {sale.items.map((i: any) => (
              <tr key={i.id} className="border-b last:border-0">
                <td className="p-3 font-medium">
                  {i.product.name}
                </td>

                <td>{i.batch.batch_no}</td>

                <td>
                  {i.batch.expiry_date
                    ? dayjs(i.batch.expiry_date).format("YYYY-MM-DD")
                    : "-"}
                </td>

                <td className="text-right">
                  <span className="font-medium">
                    {i.unit_breakdown?.[0]?.qty} {i.unit_breakdown?.[0]?.unit}
                  </span>

                  {i.unit_breakdown?.length > 1 && (
                    <span className="text-xs text-gray-500 ml-1">
                      (
                      {i.unit_breakdown
                        .slice(1)
                        .map((u: any) => `${u.qty} ${u.unit}`)
                        .join(" / ")}
                      )
                    </span>
                  )}
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
          <p className="text-gray-500">Gross</p>
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
          <p className="text-gray-500">Net Total</p>
          <p className="font-bold text-green-700 text-lg">
            {formatNepaliCurrency(summary.total_amount)}
          </p>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.print()}>
          Print Invoice
        </Button>

        <Button
          className="bg-[#009966] text-white"
          onClick={() =>
            router.push(
              `/dashboard/admin/accounting/parties/${sale.customer.id}/ledger`
            )
          }
        >
          View Customer Ledger
        </Button>

        <Button onClick={() => openInvoicePdf(sale.id)}>
  View Invoice (PDF)
</Button>


      </div>
    </div>
  );
}
