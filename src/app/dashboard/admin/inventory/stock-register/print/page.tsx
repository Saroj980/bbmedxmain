"use client";

import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { Printer, X } from "lucide-react";
import StockRegisterPrintView from "@/components/inventory/StockRegisterPrintView";

export default function StockRegisterPrintPage() {
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const raw = sessionStorage.getItem("stock_register_data");
    const rawFilters = sessionStorage.getItem("stock_register_filters");
    if (raw) {
      try { setData(JSON.parse(raw)); } catch {}
    }
    if (rawFilters) {
      try { setFilters(JSON.parse(rawFilters)); } catch {}
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-white min-h-screen">
      {/* Control Bar */}
      <div className="py-4 bg-gray-50 border-b border-gray-200 no-print print:hidden">
        <div className="max-w-5xl mx-auto flex justify-center gap-4">
          <Button
            size="large"
            icon={<Printer size={18} />}
            onClick={() => window.print()}
            className="bg-[#009966] hover:bg-[#008855] text-primary flex items-center gap-2 font-bold px-8 h-10 border-none rounded-xl transition-all shadow-sm"
          >
            Print Document
          </Button>
          <Button
            size="large"
            icon={<X size={18} />}
            onClick={() => window.close()}
            className="flex items-center gap-2 h-10 px-8 rounded-xl border-gray-200 hover:border-[#009966] hover:text-[#009966] transition-all bg-white shadow-sm"
          >
            Close Window
          </Button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto bg-white shadow-xl mt-8 print:mt-0 print:shadow-none print:max-w-none print:m-0 print:w-full min-h-screen">
        <StockRegisterPrintView data={data} filters={filters} />
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          html, body {
            margin: 0 !important; padding: 0 !important;
            background: white !important; width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page { margin: 8mm !important; size: auto; }
        }
      `}</style>
    </div>
  );
}
