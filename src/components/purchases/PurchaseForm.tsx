/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import dayjs from "dayjs";

import { DatePicker, Select } from "antd";
import { Product } from "@/types/product";
import PurchaseItemsSection from "./PurchaseItemSection";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";

import { ADToBS } from "bikram-sambat-js";
import { Checkbox } from "antd";
import PurchasePaymentModal from "@/components/purchases/PurchasePaymentModal";
import NepaliBsDatePicker from "@/components/common/NepaliBsDatePicker";
import BsAdDateTimeDisplay from "@/components/common/BsAdDateTimeDisplay";


export default function PurchaseForm({ open, onClose, refresh }: any) {
  const [loading, setLoading] = useState(false);
  const [systemInvoiceNo, setSystemInvoiceNo] = useState<string>("");
  const [activeFiscalYear, setActiveFiscalYear] = useState<any>(null);
  const [bsInvoiceDate, setBsInvoiceDate] = useState<string>(() => {
    try { return ADToBS(dayjs().format("YYYY-MM-DD")); } catch { return ""; }
  });

  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [accountBalance, setAccountBalance] = useState<number | null>(null);



  const [form, setForm] = useState<any>({
    supplier_id: null,
    invoice_no: "",
    supplier_invoice_no: "",
    invoice_date: dayjs().format("YYYY-MM-DD"),
    remarks: "",
  });

  const [discount, setDiscount] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const [globalCarrierCost, setGlobalCarrierCost] = useState<number>(0);

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


  const [suppliers, setSuppliers] = useState<any[]>([]);
  // const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.get("/parties", { params: { type: "supplier" } }).then(res => {
      setSuppliers(res.data || []);
    });

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
        // else: today is within FY, keep today's BS date already set
      }
    });

    // api.get("/products").then(res => {
    //   setProducts(res.data || []);
    // });

    // if (!open) return;

    // api.get("/purchases/next-invoice-no")
    //   .then(res => {
    //     setSystemInvoiceNo(res.data.invoice_no);
    //   })
    //   .catch(() => {
    //     setSystemInvoiceNo("");
    //   });

  }, []);

  useEffect(() => {
    if (!open) return;

    api.get("/purchases/next-invoice-no")
      .then(res => {
        setSystemInvoiceNo(res.data.invoice_no);
      })
      .catch(() => {
        setSystemInvoiceNo("");
      });
  }, [open]);


  const [products, setProducts] = useState<any[]>([]);
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    api
      .get("/accounts", { params: { can_make_payment: 1, active: 1 } })
      .then(res => setPaymentAccounts(res.data || []));
  }, []);

  const filteredAccounts = useMemo(() => {
    if (!payment.method) return [];

    if (payment.method === "cash") {
      return paymentAccounts.filter(a => a.category === "cash");
    }

    if (payment.method === "bank" || payment.method === "cheque") {
      return paymentAccounts.filter(a => a.category === "bank");
    }

    if (payment.method === "mobile") {
      return paymentAccounts.filter(a => a.category === "wallet");
    }

    return [];
  }, [payment.method, paymentAccounts]);

  useEffect(() => {
    if (!payment.account_id) {
      setAccountBalance(null);
      return;
    }

    api
      .get(`/accounts/${payment.account_id}/balance`)
      .then(res => setAccountBalance(res.data.balance))
      .catch(() => setAccountBalance(null));
  }, [payment.account_id]);






  const [items, setItems] = useState<any[]>([]);

  /* ---------------- Totals ---------------- */
  const grossAmount = useMemo(() => {
    return items.reduce(
      (sum, i) => sum + Number(i.quantity || 0) * Number(i.cost_price || 0),
      0
    );
  }, [items]);

  const vatAmount = useMemo(() => {
    return items.reduce((sum, i) => {
      if (!i.vat_included) return sum;

      const lineBase = Number(i.quantity || 0) * Number(i.cost_price || 0);
      return sum + +(lineBase * 0.13).toFixed(2);
    }, 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    const totalCarrierCost = items.reduce((acc, cur) => acc + (Number(cur.carrier_cost) || 0), 0) + globalCarrierCost;
    return Math.round(grossAmount + vatAmount + totalCarrierCost);
  }, [grossAmount, vatAmount, items, globalCarrierCost]);

  const netPayable = Math.max(0, totalAmount - (Number(discount) || 0));
  const pendingAmount = isPaying ? Math.max(0, netPayable - (Number(payment.amount) || 0)) : netPayable;


  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    if (!form.supplier_id) {
      toast.error("Supplier is required");
      return;
    }

    if (items.length === 0) {
      toast.error("Add at least one product");
      return;
    }

    if (payment.amount && accountBalance !== null && Number(payment.amount) > accountBalance ) {
      toast.error("Insufficient balance in selected account");
      return;
    }

    

    const payload = {
      ...form,
      items: items.map(item => {
        // Distribute global carrier cost proportionally based on grossAmount
        const lineBase = Number(item.quantity || 0) * Number(item.cost_price || 0);
        const distributedCarrierCost = grossAmount > 0 
          ? (lineBase / grossAmount) * globalCarrierCost 
          : 0;
        
        return {
          ...item,
          carrier_cost: Number((Number(item.carrier_cost || 0) + distributedCarrierCost).toFixed(2))
        };
      }),
      carrier_cost: items.reduce((acc, cur) => acc + Number(cur.carrier_cost || 0), 0) + globalCarrierCost,
      gross_amount: grossAmount,
      vat_amount: vatAmount,
      discount_amount: Number(discount) || 0,
      total_amount: netPayable,
      payment: isPaying && payment.amount ? payment : null,
    };

    console.log("Submitting purchase payload:", payload);

    try {
      setLoading(true);
      await api.post("/purchases", payload);
      toast.success("Purchase saved");
      refresh();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      <aside className="fixed top-0 right-0 z-50 h-full w-full sm:w-[900px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold">New Purchase</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-140px)]">
          {/* Supplier & Invoice */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">
                Supplier
              </label>
              <Select
                showSearch
                allowClear
                className="w-full"
                placeholder="Select Supplier"
                optionFilterProp="label"
                value={form.supplier_id ?? undefined}
                onChange={(v) => setForm({ ...form, supplier_id: v })}
                options={suppliers.map(s => ({
                  value: s.id,
                  label: `${s.name} (${s.code})`,
                }))}
              />
            </div>

            {/* <div>
              <label className="text-xs font-medium text-gray-600">
                Invoice No.
              </label>
              <Input
                placeholder="Invoice No"
                
                value={form.invoice_no}
                onChange={(e) =>
                  setForm({ ...form, invoice_no: e.target.value })
                }
              />
            </div> */}
            <div>
              <label className="text-xs font-medium text-gray-600">
                Invoice No
              </label>
              <Input
                className="mt-1 bg-gray-100"
                value={systemInvoiceNo || "Auto-generated"}
                disabled
              />
            </div>


            <div>
              <label className="text-xs font-medium text-gray-600">
                Invoice Date
              </label>
              {/* <Input
                type="date"
                value={form.invoice_date}
                onChange={(e) =>
                  setForm({ ...form, invoice_date: e.target.value })
                }
              /> */}

              <NepaliBsDatePicker
                value={bsInvoiceDate}
                minDate={activeFiscalYear?.bs_start}
                maxDate={activeFiscalYear?.bs_end}
                onChange={(adDate) => {
                  if (adDate) setBsInvoiceDate(bsInvoiceDate); // picker controls its display
                  setForm({ ...form, invoice_date: adDate || form.invoice_date });
                }}
              />
              <BsAdDateTimeDisplay bsDate={bsInvoiceDate} />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Supplier Invoice No.
              </label>
              <Input
                placeholder="Supplier Invoice No"
                value={form.supplier_invoice_no}
                onChange={(e) =>
                  setForm({ ...form, supplier_invoice_no: e.target.value })
                }
              />
            </div>


          </div>

          {/* Items */}
          {/* <PurchaseItemsTable value={items} onChange={setItems} products={products}  /> */}
          <PurchaseItemsSection
            value={items}
            onChange={setItems}
            products={products}
            refreshProducts={fetchProducts}
          />

          <div className="flex justify-end">
            <div className="w-full md:w-1/2 bg-white border-2 border-[#009966]/20 rounded-2xl p-6 space-y-4 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#009966]/5 rounded-full -mr-16 -mt-16" />
              
              <div className="space-y-3 relative">
                <div className="flex justify-between text-[11px] text-gray-500 font-medium bg-gray-50/50 p-2 rounded">
                  <span>Gross Total</span>
                  <span className="text-gray-900 font-bold">{formatNepaliCurrency(grossAmount)}</span>
                </div>
                
                <div className="flex justify-between text-[11px] text-gray-500 font-medium px-2">
                  <span>Total VAT (13%)</span>
                  <span className="text-orange-600">{formatNepaliCurrency(vatAmount)}</span>
                </div>

                {items.reduce((acc, cur) => acc + (Number(cur.carrier_cost) || 0), 0) > 0 && (
                  <div className="flex justify-between text-[11px] text-gray-500 font-medium bg-blue-50/50 p-2 rounded">
                    <span>Total Item Carrier Cost</span>
                    <span className="text-blue-600 font-bold">
                      {formatNepaliCurrency(items.reduce((acc, cur) => acc + (Number(cur.carrier_cost) || 0), 0))}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium px-2 gap-2 mt-2">
                  <span>Global Carrier Charge</span>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Amt"
                      min={0}
                      className="text-right h-7 border-gray-200 focus:border-[#009966] focus:ring-[#009966]/20 font-bold text-[11px]"
                      value={globalCarrierCost || ""}
                      onChange={e => setGlobalCarrierCost(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium px-2 gap-2">
                  <span>Overall Discount</span>
                  <div className="flex items-center gap-1 flex-1 justify-end">
                    <div className="w-20">
                      <Input
                        type="number"
                        placeholder="%"
                        className="text-right h-7 border-gray-200 focus:border-[#009966] focus:ring-[#009966]/20 font-bold text-[11px]"
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
                        className="text-right h-7 border-gray-200 focus:border-[#009966] focus:ring-[#009966]/20 font-bold text-[11px]"
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
                  <span className="text-3xl font-black text-[#009966] tracking-tighter">
                    {formatNepaliCurrency(netPayable)}
                  </span>
                </div>

                {/* Payment Section */}
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
                        className="scale-125 accent-[#009966]"
                      />
                      <label
                        htmlFor="record-payment"
                        className="text-sm font-extrabold text-gray-700 cursor-pointer uppercase tracking-tight"
                      >
                        Record Payment?
                      </label>
                    </div>
                    {isPaying && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-bold text-[#009966] hover:bg-[#009966]/10"
                        onClick={() => setShowPaymentModal(true)}
                      >
                        Edit Details
                      </Button>
                    )}
                  </div>

                  {isPaying && (
                    <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">Total Paid</span>
                        <span className="text-sm font-bold text-blue-600">
                          {formatNepaliCurrency(Number(payment.amount) || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-red-50 p-4 rounded-xl border border-red-100">
                        <span className="text-xs font-black text-red-400 uppercase tracking-widest">Pending Balance</span>
                        <span className="text-xl font-black text-red-600 tracking-tighter">
                          {formatNepaliCurrency(pendingAmount)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>




        </div>

        <PurchasePaymentModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSave={(p: any) => setPayment(p)}
          payment={payment}
          setPayment={setPayment}
          invoiceTotal={netPayable}
        />

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-4 flex justify-end gap-3 bg-white">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-[#009966] text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving…" : "Save Purchase"}
          </Button>
        </div>
      </aside>
    </>
  );
}
