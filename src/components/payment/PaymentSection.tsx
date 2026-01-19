/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select, DatePicker } from "antd";
import dayjs from "dayjs";
import { api } from "@/lib/api";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";

export type PaymentMode = "purchase" | "sale" | "receipt" | "payment";


type Props = {
  mode: PaymentMode;
  payment: any;
  setPayment: (p: any) => void;

  /** Required for sale & purchase */
  invoiceTotal?: number;

  /** Optional for receipt / payment voucher */
  defaultAmount?: number;
};

export default function PaymentSection({
  mode,
  payment,
  setPayment,
  invoiceTotal = 0,
  defaultAmount = 0,
}: Props) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);

  /* ---------------- Direction ---------------- */
  const isInflow = mode === "sale" || mode === "receipt";
  const isOutflow = mode === "purchase" || mode === "payment";

  const userEditedAmountRef = useRef(false);

  


  /* ---------------- Load Accounts ---------------- */
  useEffect(() => {
    api
      .get("/accounts", { params: { can_make_payment: 1, active: 1 } })
      .then(res => setAccounts(res.data || []));
  }, []);

  /* ---------------- Filter Accounts ---------------- */
  const filteredAccounts = useMemo(() => {
    if (payment.method === "cash") {
      return accounts.filter(a => a.category === "cash");
    }
    if (payment.method === "bank") {
      return accounts.filter(a => a.category === "bank");
    }
    if (payment.method === "wallet") {
      return accounts.filter(a => a.category === "wallet");
    }
    return [];
  }, [payment.method, accounts]);

  /* ---------------- Account Balance ---------------- */
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

  /* ---------------- Target Amount ---------------- */
  const targetAmount = useMemo(() => {
    if (mode === "sale" || mode === "purchase") {
      return invoiceTotal;
    }
    return defaultAmount;
  }, [mode, invoiceTotal, defaultAmount]);

  useEffect(() => {
    if (!userEditedAmountRef.current && targetAmount > 0) {
      setPayment((p: any) => ({
        ...p,
        amount: targetAmount,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAmount]);

  // useEffect(() => {
  //   if (
  //     payment.amount === "" &&
  //     targetAmount > 0
  //   ) {
  //     setPayment((p: any) => ({
  //       ...p,
  //       amount: targetAmount,
  //     }));
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [targetAmount]);


  /* ---------------- Calculations ---------------- */
  const paid = Number(payment.amount || 0);
  const balance = invoiceTotal ? invoiceTotal - paid : 0;

  /* ---------------- Labels ---------------- */
  const amountLabel = isInflow ? "Amount Received" : "Amount Paid";
  const accountLabel = isInflow
    ? "Received In Account"
    : "Paid From Account";

  /* ---------------- UI ---------------- */
  return (
    <div className="border rounded-xl bg-white shadow-sm">
      <div className="px-5 py-3 border-b">
        <h4 className="font-semibold text-gray-800">
          Payment Details
        </h4>
        <p className="text-xs text-gray-500">
          Optional – record payment now
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Main Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Method */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              Payment Method
            </label>
            <Select
              className="mt-1 w-full"
              value={payment.method}
              onChange={v =>
                setPayment({
                  ...payment,
                  method: v,
                  account_id: null,
                })
              }
              options={[
                { value: "cash", label: "Cash" },
                { value: "bank", label: "Bank Transfer" },
                { value: "wallet", label: "Wallet" },
              ]}
            />
          </div>

          {/* Account */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              {accountLabel}
            </label>
            <Select
              className="mt-1 w-full"
              placeholder="Select account"
              value={payment.account_id ?? undefined}
              onChange={v =>
                setPayment({ ...payment, account_id: v })
              }
              options={filteredAccounts.map(a => ({
                value: a.id,
                label: a.name,
              }))}
            />

            {accountBalance !== null && (
              <p className="mt-1 text-xs text-gray-500">
                Balance:{" "}
                <span
                  className={
                    isOutflow && accountBalance < paid
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
              value={payment.payment_date}
              onChange={d =>
                setPayment({
                  ...payment,
                  payment_date: d || dayjs(),
                })
              }
            />
          </div>
          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-gray-600">
              {amountLabel}
            </label>
            <Input
              type="number"
              min={0}
              className="mt-1 text-right"
              value={payment.amount}
              onChange={e => {
                userEditedAmountRef.current = true;
                setPayment({ ...payment, amount: e.target.value });
              }}
            />
          </div>
        </div>
        

        {/* Reference & Remarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Reference No."
            value={payment.reference}
            onChange={e =>
              setPayment({ ...payment, reference: e.target.value })
            }
          />
          <Input
            placeholder="Remarks"
            value={payment.remarks}
            onChange={e =>
              setPayment({ ...payment, remarks: e.target.value })
            }
          />
        </div>

        {/* Summary */}
        {invoiceTotal > 0 && (
          <div className="bg-gray-50 border rounded-lg p-4 grid grid-cols-3 text-sm">
            <div className="text-right">
              <p className="text-gray-500">Invoice Total</p>
              <p className="font-semibold">
                {formatNepaliCurrency(invoiceTotal)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-gray-500">Paid</p>
              <p className="font-semibold text-blue-700">
                {formatNepaliCurrency(paid)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-gray-500">Balance</p>
              <p
                className={`font-semibold ${
                  balance > 0
                    ? "text-red-600"
                    : "text-green-700"
                }`}
              >
                {formatNepaliCurrency(balance)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
