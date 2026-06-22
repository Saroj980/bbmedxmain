"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NewSalePage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/parties?type=customer").then(res => setCustomers(res.data));
  }, []);

  const gross = items.reduce(
    (s, i) => s + i.quantity * i.selling_price,
    0
  );

  const vat = items.reduce(
    (s, i) =>
      s + (i.vat_included ? i.quantity * i.selling_price * 0.13 : 0),
    0
  );

  const total = gross + vat;

  const saveSale = async () => {
    if (!customerId || items.length === 0) {
      toast.error("Customer and items are required");
      return;
    }

    try {
      setSaving(true);
      await api.post("/sales", {
        customer_id: customerId,
        invoice_date: dayjs().format("YYYY-MM-DD"),
        items,
      });

      toast.success("Sale created successfully");
      router.push("/dashboard/admin/sales");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Sales", href: "/dashboard/admin/sales" },
          { label: "New Sale" },
        ]}
      />

      <div className="bg-white border rounded-xl p-6 space-y-6">

        {/* Customer */}
        <div>
          <label className="text-sm font-medium">Customer</label>
          <select
            className="w-full border rounded px-3 py-2 mt-1"
            value={customerId ?? ""}
            onChange={e => setCustomerId(Number(e.target.value))}
          >
            <option value="">Select customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Items placeholder */}
        <div className="border rounded-lg p-4 text-sm text-gray-500">
          Items table (reuse Purchase items UI here)
        </div>

        {/* Totals */}
        <div className="grid grid-cols-3 gap-4 text-sm text-right">
          <div>
            <p className="text-gray-500">Gross</p>
            <p className="font-semibold">
              {formatNepaliCurrency(gross)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">VAT</p>
            <p className="font-semibold">
              {formatNepaliCurrency(vat)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Total</p>
            <p className="font-bold text-green-700 text-lg">
              {formatNepaliCurrency(total)}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            className="bg-[#009966] text-white"
            disabled={saving}
            onClick={saveSale}
          >
            Save Sale
          </Button>
        </div>

      </div>
    </div>
  );
}
