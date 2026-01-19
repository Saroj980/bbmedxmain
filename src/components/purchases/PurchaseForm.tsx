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


export default function PurchaseForm({ open, onClose, refresh }: any) {
  const [loading, setLoading] = useState(false);
  const [systemInvoiceNo, setSystemInvoiceNo] = useState<string>("");

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

  useEffect(() => {
      api.get("/products").then(res => setProducts(res.data || []));
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
    return +(grossAmount + vatAmount).toFixed(2);
  }, [grossAmount, vatAmount]);


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
      items,
      gross_amount: grossAmount,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      payment: payment.amount ? payment : null,
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

              <DatePicker
                className="w-full mt-1"
                format="YYYY-MM-DD"
                placeholder="Select invoice date"
                value={form.invoice_date ? dayjs(form.invoice_date) : null}
                onChange={(d) =>
                  setForm({ ...form, invoice_date: d ? d.format("YYYY-MM-DD") : null })
                }
                        />
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
          />

          {}
          {/* Totals */}
          <div className="bg-[#F6FAF8] border rounded-xl p-4 grid grid-cols-3 text-sm">
            <div className="text-right">
              <p className="text-gray-500">Gross</p>
              <p className="font-semibold">
                {formatNepaliCurrency(grossAmount)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-gray-500">VAT (13%)</p>
              <p className="font-semibold">
                {formatNepaliCurrency(vatAmount)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-gray-500">Total Payable</p>
              <p className="font-semibold text-green-700">
                {formatNepaliCurrency(totalAmount)}
              </p>
            </div>
          </div>


          <div className="border rounded-xl bg-white shadow-sm">
            {/* Header */}
            <div className="px-5 py-3 border-b flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">
                  Payment Details
                </h4>
                <p className="text-xs text-gray-500">
                  Optional – record payment at the time of purchase
                </p>
              </div>

              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                Accounts Payable
              </span>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Main Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Amount */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Amount Paid
                  </label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0.00"
                    className="mt-1 text-right"
                    value={payment.amount}
                    onChange={(e) =>
                      setPayment({ ...payment, amount: e.target.value })
                    }
                  />
                </div>

                {/* Method */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Payment Method
                  </label>
                  <Select
                    className="mt-1 w-full"
                    value={payment.method}
                    onChange={(v) =>
                      setPayment({ ...payment, method: v })
                    }
                    options={[
                      { value: "cash", label: "Cash" },
                      { value: "bank", label: "Bank Transfer" },
                      { value: "mobile", label: "Mobile Wallet" },
                      { value: "cheque", label: "Cheque" },
                    ]}
                  />
                </div>

                {/* Account */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Paid From Account
                  </label>

                  <Select
                    className="mt-1 w-full"
                    placeholder="Select account"
                    value={payment.account_id ?? undefined}
                    onChange={(v) => {
                      setPayment({ ...payment, account_id: v });
                      setSelectedAccount(
                        filteredAccounts.find(a => a.id === v) || null
                      );
                    }}
                    options={filteredAccounts.map(a => ({
                      value: a.id,
                      label: `${a.name}`,
                    }))}
                  />

                  {accountBalance !== null && (
                    <p className="mt-1 text-xs text-gray-500">
                      Available Balance:{" "}
                      <span
                        className={
                          accountBalance < Number(payment.amount || 0)
                            ? "text-red-600 font-semibold"
                            : "text-green-700 font-semibold"
                        }
                      >
                        {formatNepaliCurrency(accountBalance)}
                      </span>
                    </p>
                  )}
                </div>


                {/* Date */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Payment Date
                  </label>
                  <DatePicker
                    className="mt-1 w-full"
                    format="YYYY-MM-DD"
                    value={dayjs(payment.payment_date)}
                    onChange={(d) =>
                      setPayment({
                        ...payment,
                        payment_date: d?.format("YYYY-MM-DD"),
                      })
                    }
                  />
                </div>
              </div>

              {/* Reference & Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Reference No.
                  </label>
                  <Input
                    className="mt-1"
                    placeholder="Cheque / Txn / Voucher no."
                    value={payment.reference}
                    onChange={(e) =>
                      setPayment({ ...payment, reference: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Remarks
                  </label>
                  <Input
                    className="mt-1"
                    placeholder="Optional notes about this payment"
                    value={payment.remarks}
                    onChange={(e) =>
                      setPayment({ ...payment, remarks: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gray-50 border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 text-sm">
                <div className="text-right">
                  <p className="text-gray-500">Invoice Total</p>
                  <p className="font-semibold">
                    {formatNepaliCurrency(totalAmount)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-gray-500">Paid Amount</p>
                  <p className="font-semibold text-blue-700">
                    {formatNepaliCurrency((payment.amount || 0))}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-gray-500">Balance</p>
                  <p className={`font-semibold ${
                    totalAmount - Number(payment.amount || 0) > 0
                      ? "text-red-600"
                      : "text-green-700"
                  }`}>
                    {formatNepaliCurrency((totalAmount - Number(payment.amount || 0)))}
                  </p>
                </div>
              </div>
            </div>
          </div>


        </div>

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
