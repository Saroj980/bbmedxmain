/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, Plus, X } from "lucide-react";
import dayjs from "dayjs";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, Divider, Checkbox } from "antd";
import { toast } from "sonner";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import SaleItemsTable from "./SaleItemsTable";
import SaleItemModal from "./SaleItemModal";
import SalePaymentModal from "./SalePaymentModal";
import NepaliBsDatePicker from "@/components/common/NepaliBsDatePicker";
import BsAdDateTimeDisplay from "@/components/common/BsAdDateTimeDisplay";
import { ADToBS } from "bikram-sambat-js";

export default function SaleForm({ open, onClose, refresh }: any) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeFiscalYear, setActiveFiscalYear] = useState<any>(null);
  const [bsInvoiceDate, setBsInvoiceDate] = useState<string>(() => {
    try { return ADToBS(dayjs().format("YYYY-MM-DD")); } catch { return ""; }
  });
  const [customerType, setCustomerType] = useState<"registered" | "walkin">("registered");
  const [walkinName, setWalkinName] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [items, setItems] = useState<any[]>([]);
  const [itemModal, setItemModal] = useState({ open: false, editItem: null });

  const [form, setForm] = useState<any>({
    customer_id: null,
    invoice_date: dayjs().format("YYYY-MM-DD"),
  });

  const [isPaying, setIsPaying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [payment, setPayment] = useState<any>({
    amount: "",
    method: "cash",
    account_id: null,
    payment_date: dayjs().format("YYYY-MM-DD"),
    reference: "",
    remarks: "",
  });

  /* ---------------- Load Data ---------------- */
  useEffect(() => {
    if (!open) return;

    api.get("/parties", { params: { type: "customer" } })
      .then(res => setCustomers(res.data || []));

    api.get("/products", { params: { available_only: 1 } })
      .then(res => setProducts(res.data || []));

    api.get("/fiscal-years").then(res => {
      const active = res.data.find((f: any) => f.is_active);
      if (active) {
        setActiveFiscalYear(active);
        const today = dayjs();
        const start = dayjs(active.ad_start);
        const end = dayjs(active.ad_end);

        if (today.isBefore(start) || today.isAfter(end)) {
          const adDate = start.format("YYYY-MM-DD");
          setForm((f: any) => ({ ...f, invoice_date: adDate }));
          setPayment((p: any) => ({ ...p, payment_date: adDate }));
          setBsInvoiceDate(active.bs_start || ""); // clamp to FY start
        }
        // else: today is within FY — bsInvoiceDate already set to today's BS
      }
    });
  }, [open]);

  /* ---------------- Totals ---------------- */
  const grossAmount = useMemo(
    () => items.reduce((sum, i) => sum + Number((i.inventory_value ?? (i.quantity * i.selling_price)) || 0), 0),
    [items]
  );

  const taxableAmount = useMemo(
    () => items.reduce((sum, i) => (i.vat_included ? sum + Number((i.inventory_value ?? (i.quantity * i.selling_price)) || 0) : sum), 0),
    [items]
  );

  const vatAmount = useMemo(() => taxableAmount * 0.13, [taxableAmount]);
  const totalFreeCarrierCost = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.free_carrier_cost || 0), 0);
  }, [items]);
  const totalAmount = grossAmount + vatAmount;
  const netPayable = Math.max(0, totalAmount - (Number(discount) || 0));
  const pendingAmount = isPaying ? Math.max(0, netPayable - (Number(payment.amount) || 0)) : netPayable;

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
        invoice_date: form.invoice_date,
        items,
        discount_amount: Number(discount) || 0,
        payment: isPaying && payment.amount ? payment : null,
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
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-lg font-semibold">New Sale</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-140px)]">
          <div className="bg-gray-50 border rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Customer Type</label>
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
                <label className="text-xs font-medium text-gray-600">Customer</label>
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
                <label className="text-xs font-medium text-gray-600">Walk-in Customer Name</label>
                <Input
                  className="mt-1"
                  placeholder="Customer name"
                  value={walkinName}
                  onChange={e => setWalkinName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-600">Invoice Date</label>
              <NepaliBsDatePicker
                value={bsInvoiceDate}
                minDate={activeFiscalYear?.bs_start}
                maxDate={activeFiscalYear?.bs_end}
                onChange={adDate => setForm({ ...form, invoice_date: adDate || form.invoice_date })}
              />
              <BsAdDateTimeDisplay bsDate={bsInvoiceDate} />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                <Package size={18} />
                Sale Items
              </h4>
              <p className="text-xs text-gray-400">Select product → batch (FEFO) → quantity</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setItemModal({ open: true, editItem: null })}>
              <Plus size={14} className="mr-1" />
              Add Item
            </Button>
          </div>

          <SaleItemsTable
            items={items}
            onEdit={(item: any) => setItemModal({ open: true, editItem: item, parentItem: null } as any)}
            onRemove={(id: string) => setItems(items.filter(i => i.id !== id))}
            onAddBonus={(parentItem: any) => setItemModal({ open: true, editItem: null, parentItem } as any)}
          />

          <SaleItemModal
            open={itemModal.open}
            onClose={() => setItemModal({ open: false, editItem: null, parentItem: null } as any)}
            editItem={itemModal.editItem}
            parentItem={(itemModal as any).parentItem}
            onSave={(savedItem: any) => {
              setItems(prev => {
                const exists = prev.find(i => i.id === savedItem.id);
                if (exists) return prev.map(i => (i.id === savedItem.id ? savedItem : i));
                
                // If it's a bonus item, insert it right after its parent
                if (savedItem.is_bonus_item && savedItem.bonus_parent_item_id) {
                  const parentIdx = prev.findIndex(i => i.id === savedItem.bonus_parent_item_id);
                  if (parentIdx !== -1) {
                    const newItems = [...prev];
                    newItems.splice(parentIdx + 1, 0, savedItem);
                    return newItems;
                  }
                }
                
                return [...prev, savedItem];
              });
            }}
          />

          <div className="flex justify-end">
            <div className="w-full md:w-1/2 bg-white border-2 border-primary/20 rounded-2xl p-6 space-y-4 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              
              <div className="space-y-3 relative">
                <div className="flex justify-between text-[11px] text-gray-500 font-medium bg-gray-50/50 p-2 rounded">
                  <span>Gross Total</span>
                  <span className="text-gray-900 font-bold">{formatNepaliCurrency(grossAmount)}</span>
                </div>
                
                <div className="flex justify-between text-[11px] text-gray-500 font-medium px-2">
                  <span>Taxable Amount</span>
                  <span className="text-gray-900">{formatNepaliCurrency(taxableAmount)}</span>
                </div>

                <div className="flex justify-between text-[11px] text-gray-500 font-medium px-2">
                  <span>Total VAT (13%)</span>
                  <span className="text-orange-600">{formatNepaliCurrency(vatAmount)}</span>
                </div>

                {totalFreeCarrierCost > 0 && (
                  <div className="flex justify-between text-[11px] text-gray-500 font-medium px-2">
                    <span>Carrier Cost on Free Items</span>
                    <span className="text-emerald-600 font-bold">{formatNepaliCurrency(totalFreeCarrierCost)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium px-2 gap-2">
                  <span>Overall Discount</span>
                  <div className="flex items-center gap-1 flex-1 justify-end">
                    <div className="w-20">
                      <Input
                        type="number"
                        placeholder="%"
                        className="text-right h-7 border-gray-200 focus:border-primary focus:ring-primary/20 font-bold text-[11px]"
                        value={discountPercent || ""}
                        onChange={e => {
                          const pct = Number(e.target.value);
                          const amt = (grossAmount * pct) / 100;
                          setDiscountPercent(pct);
                          setDiscount(amt);
                        }}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        placeholder="Amt"
                        className="text-right h-7 border-gray-200 focus:border-primary focus:ring-primary/20 font-bold text-[11px]"
                        value={discount || ""}
                        onChange={e => {
                          const amt = Number(e.target.value);
                          const pct = grossAmount > 0 ? (amt / grossAmount) * 100 : 0;
                          setDiscount(amt);
                          setDiscountPercent(pct);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />

                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Net Payable Amount</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">
                    {formatNepaliCurrency(netPayable)}
                  </span>
                </div>

                <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="record-payment"
                        checked={isPaying}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setIsPaying(checked);
                          if (checked) {
                            setPayment((p: any) => ({
                              ...p,
                              amount: netPayable,
                            }));
                            setShowPaymentModal(true);
                          } else {
                            setPayment((p: any) => ({ ...p, amount: "" }));
                          }
                        }}
                        className="scale-125 accent-primary"
                      />
                      <label htmlFor="record-payment" className="text-sm font-extrabold text-gray-700 cursor-pointer uppercase tracking-tight">Record Payment?</label>
                    </div>
                    {isPaying && (
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary hover:bg-primary/10" onClick={() => setShowPaymentModal(true)}>
                        Edit Details
                      </Button>
                    )}
                  </div>

                  {isPaying && (
                    <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">Total Paid</span>
                        <span className="text-sm font-bold text-blue-600">{formatNepaliCurrency(Number(payment.amount) || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-red-50 p-4 rounded-xl border border-red-100">
                        <span className="text-xs font-black text-red-400 uppercase tracking-widest">Pending Balance</span>
                        <span className="text-xl font-black text-red-600 tracking-tighter">{formatNepaliCurrency(pendingAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <SalePaymentModal
            open={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onSave={(p) => setPayment(p)}
            payment={payment}
            setPayment={setPayment}
            invoiceTotal={netPayable}
          />
        </div>

        <div className="border-t p-4 flex justify-end gap-3 bg-white">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-[#009966] text-white" onClick={submit} disabled={loading}>{loading ? "Saving…" : "Save Sale"}</Button>
        </div>
      </aside>
    </>
  );
}
