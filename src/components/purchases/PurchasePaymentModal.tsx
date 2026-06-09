/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal, Select, DatePicker, Input, Divider } from "antd";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { api } from "@/lib/api";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (payment: any) => void;
  payment: any;
  setPayment: (payment: any) => void;
  invoiceTotal: number;
}

export default function PurchasePaymentModal({
  open,
  onClose,
  onSave,
  payment,
  setPayment,
  invoiceTotal,
}: Props) {
  const [paymentAccounts, setPaymentAccounts] = useState<any[]>([]);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      api
        .get("/accounts", { params: { can_make_payment: 1, active: 1 } })
        .then((res) => setPaymentAccounts(res.data || []));
    }
  }, [open]);

  const filteredAccounts = useMemo(() => {
    if (!payment.method) return [];
    if (payment.method === "cash") return paymentAccounts.filter((a) => a.category === "cash");
    if (payment.method === "bank" || payment.method === "cheque") return paymentAccounts.filter((a) => a.category === "bank");
    if (payment.method === "mobile") return paymentAccounts.filter((a) => a.category === "wallet");
    return [];
  }, [payment.method, paymentAccounts]);

  useEffect(() => {
    if (!payment.account_id) {
      setBalance(null);
      return;
    }
    api
      .get(`/accounts/${payment.account_id}/balance`)
      .then((res) => setBalance(res.data.balance))
      .catch(() => setBalance(null));
  }, [payment.account_id]);

  const handleSave = () => {
    if (!payment.amount || !payment.account_id) {
      onClose();
      return;
    }
    onSave(payment);
    onClose();
  };

  return (
    <Modal
      title={<span className="text-lg font-black uppercase tracking-tight">Record Purchase Payment</span>}
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      okText="Save Details"
      cancelText="Cancel"
      destroyOnHidden
      width={500}
      okButtonProps={{ className: "bg-[#009966]" }}
    >
      <div className="space-y-5 py-4">
        {/* Amount */}
        <div>
          <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Payment Amount</label>
          <Input
            type="number"
            size="large"
            className="font-bold text-lg"
            placeholder="0.00"
            value={payment.amount}
            max={invoiceTotal}
            onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
            suffix={<span className="text-gray-400 font-bold">NPR</span>}
          />
          <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">
            Max Payable: {formatNepaliCurrency(invoiceTotal)}
          </p>
        </div>

        <Divider className="my-2" />

        <div className="grid grid-cols-2 gap-4">
          {/* Method */}
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Method</label>
            <Select
              className="w-full"
              size="large"
              value={payment.method}
              onChange={(v) => setPayment({ ...payment, method: v, account_id: null })}
              options={[
                { value: "cash", label: "Cash" },
                { value: "bank", label: "Bank Transfer" },
                { value: "mobile", label: "Mobile Wallet" },
                { value: "cheque", label: "Cheque" },
              ]}
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Date</label>
            <DatePicker
              className="w-full"
              size="large"
              value={payment.payment_date ? dayjs(payment.payment_date) : null}
              onChange={(d) => setPayment({ ...payment, payment_date: d?.format("YYYY-MM-DD") })}
            />
          </div>
        </div>

        {/* Account */}
        <div>
          <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Paid From Account</label>
          <Select
            className="w-full"
            size="large"
            placeholder="Select source account"
            value={payment.account_id}
            onChange={(v) => setPayment({ ...payment, account_id: v })}
            options={filteredAccounts.map((a) => ({
              value: a.id,
              label: a.name,
            }))}
          />
          {balance !== null && (
            <div className="mt-1 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 uppercase font-black">Available Balance:</span>
              <span className={`text-xs font-bold ${balance < Number(payment.amount || 0) ? "text-red-500" : "text-green-600"}`}>
                {formatNepaliCurrency(balance)}
              </span>
            </div>
          )}
        </div>

        {/* Reference/Notes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Reference</label>
            <Input
              placeholder="Cheque/Txn No."
              value={payment.reference}
              onChange={(e) => setPayment({ ...payment, reference: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-gray-400 mb-1 block">Remarks</label>
            <Input
              placeholder="Internal notes"
              value={payment.remarks}
              onChange={(e) => setPayment({ ...payment, remarks: e.target.value })}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
