"use client";

import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { Printer, X } from "lucide-react";
import BatchPrintView from "@/components/inventory/BatchPrintView";

export default function BatchPrintPage() {
  const [printData, setPrintData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read data passed from the main Batches page
    const storedData = sessionStorage.getItem("batch_print_data");
    if (storedData) {
      try {
        setPrintData(JSON.parse(storedData));
      } catch (e) {
        console.error("Failed to parse batch print data", e);
      }
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    window.close();
  };

  if (!mounted) return null;

  return (
    <div className="bg-white min-h-screen">
      {/* Control Bar (Hidden on Print) */}
      <div className="py-4 bg-gray-50 border-b border-gray-200 no-print print:hidden">
        <div className="max-w-5xl mx-auto flex justify-center gap-4">
          <Button 
            size="large" 
            icon={<Printer size={18} />} 
            onClick={handlePrint}
            className="bg-[#009966] hover:bg-[#008855] text-primary flex items-center gap-2 font-bold px-8 h-10 border-none rounded-xl transition-all shadow-sm"
          >
            Print Document
          </Button>
          <Button 
            size="large" 
            icon={<X size={18} />} 
            onClick={handleClose}
            className="flex items-center gap-2 h-10 px-8 rounded-xl border-gray-200 hover:border-[#009966] hover:text-[#009966] transition-all bg-white shadow-sm"
          >
            Close Window
          </Button>
        </div>
      </div>

      {/* Report Container */}
      <div className="max-w-[1100px] mx-auto bg-white shadow-xl mt-8 print:mt-0 print:shadow-none print:max-w-none print:m-0 print:w-full min-h-screen">
        <BatchPrintView data={printData} />
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
            margin: 15mm !important;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
}
