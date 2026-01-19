"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import dayjs from "dayjs";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, DatePicker } from "antd";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { toast } from "sonner";

export default function PurchasePaymentDrawer({
  open,
  onClose,
  purchase,
  outstandingAmount,
  onSuccess,
}: any) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountBalance, setAccountBalance] = useState<number | null>(null);

  useEffect(() => {
    api
      .get("/accounts", { params: { can_make_payment: 1, active: 1 } })
      .then(res => setAccounts(res.data || []));
  }, []);

  const [form, setForm] = useState<any>({
    amount: outstandingAmount,
    method: "bank",
    account_id: null,
    payment_date: dayjs(),
    reference: "",
    remarks: "",
  });

  /* ---------------- Load payment accounts ---------------- */
  useEffect(() => {
  if (!form.account_id) {
    setAccountBalance(null);
    return;
  }

  let cancelled = false;

  api
    .get(`/accounts/${form.account_id}/balance`)
    .then(res => {
      if (!cancelled) {
        setAccountBalance(Number(res.data.balance));
      }
    })
    .catch(() => {
      if (!cancelled) setAccountBalance(null);
    });

  return () => {
    cancelled = true;
  };
}, [form.account_id]);


  const filteredAccounts = useMemo(() => {
    if (form.method === "cash")
      return accounts.filter(a => a.category === "cash");
    if (form.method === "bank" || form.method === "cheque")
      return accounts.filter(a => a.category === "bank");
    if (form.method === "mobile")
      return accounts.filter(a => a.category === "wallet");
    return [];
  }, [form.method, accounts]);
  
  const selectedAccount = useMemo(() => {
    return filteredAccounts.find(a => a.id === form.account_id) || null;
   }, [filteredAccounts, form.account_id]);

//    const accountBalance = selectedAccount
//     ? Number(selectedAccount.available_balance || 0)
//     : null;


  /* ---------------- Submit ---------------- */
  const submitPayment = async () => {
    if (!form.amount || form.amount <= 0) {
      toast.error("Invalid payment amount");
      return;
    }

    if (form.amount > outstandingAmount) {
      toast.error("Payment exceeds outstanding balance");
      return;
    }

    if (!form.account_id) {
      toast.error("Select payment account");
      return;
    }

    if (accountBalance !== null && form.amount > accountBalance) {
        toast.error("Insufficient balance in selected account");
        return;
    }


    try {
      setLoading(true);

      await api.post(`/purchases/${purchase.id}/payments`, {
        amount: form.amount,
        method: form.method,
        account_id: form.account_id,
        payment_date: form.payment_date.format("YYYY-MM-DD"),
        reference: form.reference,
        remarks: form.remarks,
      });

      toast.success("Payment recorded");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <aside className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold">Add Payment</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Outstanding */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
            <p className="text-gray-600">Outstanding Payable</p>
            <p className="text-xl font-semibold text-red-700">
              {formatNepaliCurrency(outstandingAmount)}
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Payment Amount
            </label>
            <Input
              type="number"
              className="mt-1 text-right"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
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
              value={form.method}
              onChange={(v) => setForm({ ...form, method: v })}
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
                value={form.account_id ?? undefined}
                onChange={(v) => setForm({ ...form, account_id: v })}
                options={filteredAccounts.map(a => ({
                value: a.id,
                label: `${a.code} – ${a.name}`,
                }))}
            />

            {accountBalance !== null && (
                <p className="mt-1 text-xs text-gray-500">
                Available Balance:{" "}
                <span
                    className={`font-semibold ${
                    accountBalance < Number(form.amount)
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                >
                    {formatNepaliCurrency(Math.abs(accountBalance))}{" "}
                    {accountBalance >= 0 ? "Dr" : "Cr"}
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
              value={form.payment_date}
              onChange={(d) => setForm({ ...form, payment_date: d })}
            />
          </div>

          {/* Reference */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Reference
            </label>
            <Input
              className="mt-1"
              placeholder="Cheque / Txn no."
              value={form.reference}
              onChange={(e) =>
                setForm({ ...form, reference: e.target.value })
              }
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Remarks
            </label>
            <Input
              className="mt-1"
              placeholder="Optional notes"
              value={form.remarks}
              onChange={(e) =>
                setForm({ ...form, remarks: e.target.value })
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-4 flex justify-end gap-3 bg-white">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-[#009966] text-white"
            disabled={loading}
            onClick={submitPayment}
          >
            {loading ? "Saving…" : "Save Payment"}
          </Button>
        </div>
      </aside>
    </>
  );
}
