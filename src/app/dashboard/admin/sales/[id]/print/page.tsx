/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "antd";
import { Printer, X } from "lucide-react";
import { api } from "@/lib/api";
import SaleInvoicePrintView from "@/components/sales/SaleInvoicePrintView";

export default function SalePrintPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/sales/${id}`),
      api.get("/system-settings"),
    ])
      .then(([saleRes, settingsRes]) => {
        setData(saleRes.data);
        setSystemSettings(settingsRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading invoice...</div>;
  if (!data) return <div className="p-8 text-center text-red-500 font-medium">Sale not found.</div>;

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Control Bar */}
      <div className="py-4 bg-gray-50 border-b border-gray-200 no-print print:hidden">
        <div className="max-w-[900px] mx-auto flex justify-center gap-4 px-4">
          <Button
            className="bg-[#009966] text-white hover:bg-[#008055] border-none font-bold shadow-md shadow-green-100"
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
            className="border-gray-200 hover:border-red-200 hover:text-red-500 font-bold transition-all"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Print Container */}
      <div className="max-w-[900px] mx-auto bg-white shadow-2xl mt-8 mb-12 rounded-3xl overflow-hidden print:mt-0 print:mb-0 print:shadow-none print:max-w-none print:m-0 print:w-full print:rounded-none">
        <SaleInvoicePrintView
          sale={data.sale}
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
