/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Modal, Table, Tag } from "antd";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { api } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  purchaseId: number | null;
}

export default function PurchasePaymentsHistoryModal({ open, onClose, purchaseId }: Props) {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [invoiceNo, setInvoiceNo] = useState("");

  useEffect(() => {
    if (open && purchaseId) {
      loadPayments();
    } else {
      setPayments([]);
      setInvoiceNo("");
    }
  }, [open, purchaseId]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Re-use the purchase detail endpoint since it eager loads payments
      const res = await api.get(`/purchases/${purchaseId}`);
      setPayments(res.data.purchase?.payments || []);
      setInvoiceNo(res.data.purchase?.invoice_no || "");
    } catch (err) {
      console.error("Failed to load payments", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "payment_date",
      render: (v: string) => dayjs(v).format("YYYY-MM-DD"),
    },
    {
      title: "Method",
      dataIndex: "method",
      render: (v: string) => <span className="uppercase">{v}</span>,
    },
    {
      title: "Reference",
      dataIndex: "reference",
      render: (v: string) => v || "—",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right" as const,
      render: (v: number) => (
        <span className="font-semibold text-green-700">
          {formatNepaliCurrency(v)}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: any) => {
        if (record.is_reversed) {
          return <Tag color="error">Reversed</Tag>;
        }
        return <Tag color="success">Active</Tag>;
      },
    },
  ];

  return (
    <Modal
      title={`Payment History: ${invoiceNo}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div className="mt-4">
        <Table
          dataSource={payments}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
          bordered
        />
        {payments.length === 0 && !loading && (
          <p className="text-center text-gray-500 mt-4">
            No payments found for this invoice.
          </p>
        )}
      </div>
    </Modal>
  );
}
