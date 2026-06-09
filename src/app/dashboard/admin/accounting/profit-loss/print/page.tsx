"use client";

import React, { useEffect, useState } from "react";
import { Printer, X } from "lucide-react";
import ProfitLossPrintView from "@/components/accounting/ProfitLossPrintView";

export default function ProfitLossPrintPage() {
  const [report, setReport] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  const [fiscalYear, setFiscalYear] = useState<any>(null);
  const [dates, setDates] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const storedReport = sessionStorage.getItem("pl_print_report");
      const storedKpis = sessionStorage.getItem("pl_print_kpis");
      const storedFy = sessionStorage.getItem("pl_print_fy");
      const storedDates = sessionStorage.getItem("pl_print_dates");
      const storedSettings = sessionStorage.getItem("pl_print_settings");

      if (storedReport) setReport(JSON.parse(storedReport));
      if (storedKpis) setKpis(JSON.parse(storedKpis));
      if (storedFy) setFiscalYear(JSON.parse(storedFy));
      if (storedDates) setDates(JSON.parse(storedDates));
      if (storedSettings) setSystemSettings(JSON.parse(storedSettings));
    } catch (err) {
      console.error("Failed to load print data", err);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      {/* Control Bar */}
      <div className="py-4 bg-white border-b border-gray-200 no-print print:hidden sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1122px] mx-auto flex justify-between items-center px-4">
          <h1 className="text-xl font-bold text-gray-800">Print Preview: Profit & Loss</h1>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => window.close()}
              className="flex items-center gap-2 h-10 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all bg-white text-gray-700 font-medium"
            >
              <X size={18} /> Cancel
            </button>
            <button
              onClick={() => window.print()}
              className="bg-[#009966] hover:bg-[#008855] text-white flex items-center gap-2 font-bold px-8 h-10 border-none rounded-xl transition-all shadow-md"
            >
              <Printer size={18} /> Print Document
            </button>
          </div>
        </div>
      </div>

      {report ? (
        <ProfitLossPrintView 
          report={report}
          kpis={kpis || {}}
          fiscalYear={fiscalYear}
          fromDateBS={dates?.fromDateBS || ""}
          toDateBS={dates?.toDateBS || ""}
          comparePrevFy={dates?.comparePrevFy || false}
          systemSettings={systemSettings}
          onClose={() => window.close()}
        />
      ) : (
        <div className="max-w-[1122px] mx-auto mt-12 bg-white p-12 text-center rounded-xl shadow">
          <p className="text-gray-500">No report data found. Please generate the report from the Profit & Loss screen and click Print.</p>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          html, body {
            margin: 0 !important; padding: 0 !important;
            background: white !important; width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* PrintView component handles its own @page size */
        }
      `}</style>
    </div>
  );
}
