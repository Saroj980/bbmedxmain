"use client";

import { useEffect, useMemo, useState } from "react";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";

type Row = {
  id: number;
  created_at: string;
  type: string;
  quantity: number;
  product_id: number;
  batch_id: number;
  product?: { name: string };
  batch?: { batch_no: string };
  location?: { name: string };
  performer?: { name: string };
};

export default function StockRegisterPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState<string | null>(null);
  const [from, setFrom] = useState<any>(null);
  const [to, setTo] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);

    const params: any = {};
    if (type) params.type = type;
    if (from) params.from = from.format("YYYY-MM-DD");
    if (to) params.to = to.format("YYYY-MM-DD");

    const res = await api.get("/stock/movements", { params });

    // IMPORTANT: paginator response
    setRows(res.data?.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- PER PRODUCT + BATCH BALANCE ---------------- */
  const rowsWithBalance = useMemo(() => {
  if (!rows.length) return [];

  // 1️⃣ Sort ASC for correct running calculation
  const sortedAsc = [...rows].sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime()
  );

  // 2️⃣ Balance bucket PER product + batch
  const balanceMap: Record<string, number> = {};

  const calculated = sortedAsc.map(r => {
    const key = `${r.product_id}-${r.batch_id}`;

    if (!balanceMap[key]) {
      balanceMap[key] = 0;
    }

    balanceMap[key] += Number(r.quantity);

    return {
      ...r,
      balance: balanceMap[key],
    };
  });

  // 3️⃣ Return DESC (latest first)
  return calculated.reverse();
}, [rows]);



  return (
    <div className="space-y-6 p-6">

      {/* BREADCRUMB */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Stock", href: "/dashboard/admin/stock" },
          { label: "Stock In / Out Register" },
        ]}
      />

      {/* PAGE TITLE */}
      <div>
        <h1 className="text-2xl font-semibold">Stock In / Out Register</h1>
        <p className="text-sm text-gray-500">
          Batch-wise stock movement with running balance
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 flex-wrap">
        <Select
          allowClear
          placeholder="Movement Type"
          className="w-40"
          onChange={(v) => setType(v)}
          options={[
            { value: "purchase", label: "Stock In" },
            { value: "sale", label: "Stock Out" },
            { value: "adjustment", label: "Adjustment" },
          ]}
        />

        <DatePicker placeholder="From" onChange={setFrom} />
        <DatePicker placeholder="To" onChange={setTo} />

        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={fetchData}
        >
          Apply
        </button>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg overflow-x-auto bg-white">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Product</th>
              <th className="border px-3 py-2">Batch</th>
              <th className="border px-3 py-2">IN</th>
              <th className="border px-3 py-2">OUT</th>
              <th className="border px-3 py-2">Unit</th>

              <th className="border px-3 py-2">Balance</th>
              <th className="border px-3 py-2">User</th>
            </tr>
          </thead>

          <tbody>
            {!loading && rowsWithBalance.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  No records found
                </td>
              </tr>
            )}

            {rowsWithBalance.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">
                  {dayjs(r.created_at).format("YYYY-MM-DD HH:mm")}
                </td>

                <td className="border px-3 py-2">
                  {r.product?.name ?? "-"}
                </td>

                <td className="border px-3 py-2">
                  {r.batch?.batch_no ?? "-"}
                </td>

                <td className="border px-3 py-2 text-green-700 text-right">
                  {r.quantity > 0 ? r.quantity : ""}
                </td>

                <td className="border px-3 py-2 text-red-700 text-right">
                  {r.quantity < 0 ? Math.abs(r.quantity) : ""}
                </td>

                <td className="border px-3 py-2 text-center">
  {/* {r.product?.base_unit?.name ?? "Unit"} */}
</td>


                <td className="border px-3 py-2 text-right font-semibold">
                  {r.balance}
                </td>

                <td className="border px-3 py-2">
                  {r.performer?.name ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
