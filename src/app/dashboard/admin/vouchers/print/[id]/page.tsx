"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import VoucherPrintView from "@/components/vouchers/VoucherPrintView";
import { message } from "antd";

export default function VoucherPrintPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [resVoucher, resSettings] = await Promise.all([
          api.get(`/vouchers/${id}`),
          api.get("/system-settings"),
        ]);
        setVoucher(resVoucher.data.voucher);
        setSystemSettings(resSettings.data || {});
      } catch (err) {
        console.error(err);
        message.error("Failed to load voucher for printing");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-gray-500 animate-pulse">Loading voucher...</div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-red-500">Voucher not found</div>
      </div>
    );
  }

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
            Print Voucher
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
      <div className="max-w-[800px] mx-auto bg-white shadow-xl mt-8 print:mt-0 print:shadow-none print:max-w-none print:m-0 print:w-full min-h-[1100px]">
        <VoucherPrintView voucher={voucher} systemSettings={systemSettings} />
      </div>
    </div>
  );
}
