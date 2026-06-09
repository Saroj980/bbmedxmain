/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Modal } from "antd";
import { Button } from "@/components/ui/button";
import PaymentSection from "@/components/payment/PaymentSection";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (payment: any) => void;
  payment: any;
  setPayment: (p: any) => void;
  invoiceTotal: number;
};

export default function SalePaymentModal({
  open,
  onClose,
  onSave,
  payment,
  setPayment,
  invoiceTotal,
}: Props) {
  return (
    <Modal
      open={open}
      title="Payment Details"
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <div className="space-y-6 pt-4">
        <PaymentSection
          mode="sale"
          payment={payment}
          setPayment={setPayment}
          invoiceTotal={invoiceTotal}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-[#009966] text-white"
            onClick={() => {
              onSave(payment);
              onClose();
            }}
          >
            Confirm Payment
          </Button>
        </div>
      </div>
    </Modal>
  );
}
