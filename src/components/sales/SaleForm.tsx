/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, Plus, X } from "lucide-react";
import dayjs from "dayjs";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import "@/components/payment/PaymentSection";
import { Select, DatePicker, Divider } from "antd";
import { toast } from "sonner";
import SaleItemsSection from "./SaleItemsSection";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import PaymentSection from "@/components/payment/PaymentSection";
import SaleItemsTable from "./SaleItemsTable";
import SaleItemModal from "./SaleItemModal";


export default function SaleForm({ open, onClose, refresh }: any) {
  const [loading, setLoading] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  // const [items, setItems] = useState<any[]>([]);

  const [customerType, setCustomerType] = useState<"registered" | "walkin">(
    "registered"
  );

  const [walkinName, setWalkinName] = useState("");

  const [discount, setDiscount] = useState<number>(0);


// inside SaleForm component
const [items, setItems] = useState<any[]>([]);
const [itemModal, setItemModal] = useState({ open: false, editItem: null });

  const [form, setForm] = useState<any>({
    customer_id: null,
    invoice_date: dayjs(),
  });

  const [payment, setPayment] = useState<any>({
    amount: "",
    method: "cash",
    account_id: null,
    payment_date: dayjs(),
    reference: "",
    remarks: "",
  });

  /* ---------------- Load Data ---------------- */
  useEffect(() => {
    if (!open) return;

    api.get("/parties", { params: { type: "customer" } })
      .then(res => setCustomers(res.data || []));

    api.get("/products")
      .then(res => setProducts(res.data || []));
  }, [open]);

  /* ---------------- Totals ---------------- */

  const grossAmount = useMemo(
    () =>
      items.reduce(
        (sum, i) =>
          sum + Number(i.quantity || 0) * Number(i.selling_price || 0),
        0
      ),
    [items]
  );

  const vatAmount = useMemo(
    () =>
      items.reduce((sum, i) => {
        if (!i.vat_included) return sum;
        return sum + Number(i.quantity) * Number(i.selling_price) * 0.13;
      }, 0),
    [items]
  );

  const totalAmount = grossAmount + vatAmount;
  const netPayable = Math.max(0, totalAmount - discount);

  /* ---------------- Submit ---------------- */

  const submit = async () => {
    if (items.length === 0) {
      toast.error("Add at least one product");
      return;
    }

    if (customerType === "registered" && !form.customer_id) {
      toast.error("Customer is required");
      return;
    }

    if (customerType === "walkin" && !walkinName.trim()) {
      toast.error("Enter walk-in customer name");
      return;
    }

    try {
      setLoading(true);

      await api.post("/sales", {
        customer_type: customerType,
        customer_id: customerType === "registered" ? form.customer_id : null,
        walkin_name: customerType === "walkin" ? walkinName : null,
        invoice_date: form.invoice_date.format("YYYY-MM-DD"),
        items,
        discount_amount: discount,
        payment: payment.amount ? payment : null,
      });

      toast.success("Sale created successfully");
      refresh();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <aside className="fixed right-0 top-0 z-50 h-full w-full sm:w-[1000px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-lg font-semibold">New Sale</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-140px)]">

          {/* Customer Section */}
          <div className="bg-gray-50 border rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">
                Customer Type
              </label>
              <Select
                className="w-full mt-1"
                value={customerType}
                onChange={v => setCustomerType(v)}
                options={[
                  { value: "registered", label: "Registered Customer" },
                  { value: "walkin", label: "Walk-in Customer" },
                ]}
              />
            </div>

            {customerType === "registered" ? (
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Customer
                </label>
                <Select
                  showSearch
                  allowClear
                  className="w-full mt-1"
                  value={form.customer_id ?? undefined}
                  onChange={v => setForm({ ...form, customer_id: v })}
                  options={customers.map(c => ({
                    value: c.id,
                    label: `${c.name} (${c.code})`,
                  }))}
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Walk-in Customer Name
                </label>
                <Input
                  className="mt-1"
                  placeholder="Customer name"
                  value={walkinName}
                  onChange={e => setWalkinName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-600">
                Invoice Date
              </label>
              <DatePicker
                className="w-full mt-1"
                value={form.invoice_date}
                onChange={d =>
                  setForm({ ...form, invoice_date: d || dayjs() })
                }
              />
            </div>
          </div>

          {/* Items */}
          <div className="flex justify-between items-center">
            <div>
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                  <Package size={18} />
                  Sale Items
                </h4>
                <p className="text-xs text-gray-400">
                  Select product → batch (FEFO) → quantity
                </p>
            </div>

            <Button variant="outline" size="sm" onClick={() => setItemModal({ open: true, editItem: null })}>
              <Plus size={14} className="mr-1" />
              Add Item
            </Button>
            {/* </div> */}
          </div>

          

          <SaleItemsTable
            items={items}
            onEdit={(item: any) => setItemModal({ open: true, editItem: item })}
            onRemove={(id: string) => setItems(items.filter(i => i.id !== id))}
          />

<SaleItemModal
  open={itemModal.open}
  onClose={() => setItemModal({ open: false, editItem: null })}
  editItem={itemModal.editItem}
  onSave={(savedItem: any) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === savedItem.id);
      if (exists) return prev.map(i => (i.id === savedItem.id ? savedItem : i));
      return [...prev, savedItem];
    });
  }}
/>

          {/* Totals */}
          <div className="bg-[#F6FAF8] border rounded-xl p-4 grid grid-cols-4 gap-4 text-sm">
            <div className="text-right">
              <p className="text-gray-500">Gross</p>
              <p className="font-semibold">
                {formatNepaliCurrency(grossAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">VAT</p>
              <p className="font-semibold">
                {formatNepaliCurrency(vatAmount)}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Discount</label>
              <Input
                type="number"
                className="mt-1 text-right"
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
              />
            </div>
            <div className="text-right">
              <p className="text-gray-500">Net Payable</p>
              <p className="font-semibold text-green-700">
                {formatNepaliCurrency(netPayable)}
              </p>
            </div>
          </div>

          {/* Payment Section */}
          <PaymentSection
          mode="sale"
            payment={payment}
            setPayment={setPayment}
            invoiceTotal={netPayable}
            // label="Payment (Optional)"
          />

        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3 bg-white">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-[#009966] text-white"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Saving…" : "Save Sale"}
          </Button>
        </div>
      </aside>
    </>
  );
}
