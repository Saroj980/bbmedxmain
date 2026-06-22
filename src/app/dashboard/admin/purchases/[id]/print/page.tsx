/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "antd";
import { Printer, X } from "lucide-react";
import { api } from "@/lib/api";
import PurchaseInvoicePrintView from "@/components/purchases/PurchaseInvoicePrintView";

export default function PurchasePrintPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/purchases/${id}`),
      api.get("/system-settings"),
    ])
      .then(([purchaseRes, settingsRes]) => {
        setData(purchaseRes.data);
        setSystemSettings(settingsRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading invoice...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Purchase not found.</div>;

  return (
    <div className="bg-white min-h-screen">
      {/* Control Bar */}
      <div className="py-4 bg-gray-50 border-b border-gray-200 no-print print:hidden">
        <div className="max-w-[900px] mx-auto flex justify-center gap-4">
          <Button
            className="bg-[#009966] text-primary"
            icon={<Printer size={18} />}
            onClick={() => window.print()}
            size="large"
          >
            Print Invoice
          </Button>
          <Button
            size="large"
            icon={<X size={18} />}
            onClick={() => window.close()}
            className="border-gray-200 hover:border-[#009966] hover:text-[#009966]"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Print Container */}
      <div className="max-w-[900px] mx-auto bg-white shadow-xl mt-8 print:mt-0 print:shadow-none print:max-w-none print:m-0 print:w-full">
        <PurchaseInvoicePrintView
          purchase={data.purchase}
          summary={data.summary}
          systemSettings={systemSettings}
        />
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            margin: 0mm !important;
            size: portrait;
          }
        }
      `}</style>
    </div>
  );
}
