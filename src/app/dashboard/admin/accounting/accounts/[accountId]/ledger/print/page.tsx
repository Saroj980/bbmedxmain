"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import AccountLedgerPrintView from "@/components/accounting/AccountLedgerPrintView";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

export default function AccountLedgerPrintPage() {
  const { accountId } = useParams();
  const searchParams = useSearchParams();
  
  const [data, setData] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const fiscalYearId = searchParams.get("fiscal_year_id");

    const fetchData = async () => {
      try {
        const [ledgerRes, settingsRes] = await Promise.all([
          api.get(`/accounts/${accountId}/ledger`, {
            params: { from, to, fiscal_year_id: fiscalYearId },
          }),
          api.get("/system-settings"),
        ]);

        setData(ledgerRes.data);
        setSystemSettings(settingsRes.data || {});
      } catch (error) {
        console.error("Failed to load ledger for printing", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId, searchParams]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-gray-500 animate-pulse">Preparing Ledger Statement...</div>
    </div>
  );

  if (!data) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-red-500 font-bold">Failed to load ledger data.</div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* ===== PRINT STYLES ===== */}
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

      {/* Control Bar */}
      <div className="py-4 bg-gray-50 border-b border-gray-200 no-print print:hidden">
        <div className="max-w-[800px] mx-auto flex justify-center gap-4">
          <Button
            className="bg-[#009966] text-white hover:bg-[#008055]"
            onClick={() => window.print()}
          >
            <Printer size={18} className="mr-2" />
            Print Ledger
          </Button>
          <Button
            variant="outline"
            className="border-gray-200 hover:border-[#009966] hover:text-[#009966]"
            onClick={() => window.close()}
          >
            <X size={18} className="mr-2" />
            Close
          </Button>
        </div>
      </div>

      {/* Print Container */}
      <div className="max-w-[850px] mx-auto bg-white shadow-xl mt-8 print:mt-0 print:shadow-none print:max-w-none print:m-0 print:w-full min-h-[1100px]">
        <AccountLedgerPrintView data={data} systemSettings={systemSettings} />
      </div>
    </div>
  );
}
