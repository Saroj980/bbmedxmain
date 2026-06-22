/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import dayjs from "dayjs";

interface Props {
  title: string;
  systemSettings?: any;
  filters?: {
    from?: string | null;
    to?: string | null;
    fiscal_year_id?: number | null;
  };
}

export default function ListingPrintHeader({ title, systemSettings, filters }: Props) {
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="mb-8 block">
      {/* ======== FIRM HEADER ======== */}
      <table className="w-full mb-4 border-none border-collapse text-gray-900 font-sans">
        <tbody>
          <tr>
            <td className="w-[20%] text-left align-middle">
              <div className="w-16 h-16 bg-white flex items-center justify-center font-bold text-[10px] rounded border border-gray-100 overflow-hidden">
                {systemSettings?.logo ? (
                  <img
                    src={`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "")}/storage/${systemSettings.logo}`}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-300">LOGO</span>
                )}
              </div>
            </td>
            <td className="w-[60%] text-center">
              <div className="text-2xl font-black text-gray-900 uppercase tracking-tight leading-none">
                {systemSettings?.firm_name || "Company Name"}
              </div>
              <div className="text-xs text-gray-600 mt-1 font-medium">
                {systemSettings?.address || "Address"}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5 font-medium">
                {systemSettings?.email && `Email: ${systemSettings.email}`}
                {systemSettings?.email && systemSettings?.contact_number && " | "}
                {systemSettings?.contact_number && `Phone: ${systemSettings.contact_number}`}
              </div>
            </td>
            <td className="w-[20%] text-right align-top">
              <div className="inline-block whitespace-nowrap border-2 border-gray-900 p-2 text-[10px] font-black leading-tight text-right uppercase">
                {systemSettings?.is_vat_registered ? "VAT No. : " : "PAN No. : "}
                {systemSettings?.vat_no || systemSettings?.pan_no || "—"}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* <div className="border-t-2 border-gray-900 mb-4" /> */}

      {/* ── Title Box ── */}
      <div className="text-center mb-6 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-8 py-1.5 bg-white border-2 border-gray-800 text-lg font-black uppercase tracking-[0.2em] text-gray-900">
            {title}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-end text-[10px] uppercase font-bold text-gray-500">
        <div className="flex gap-4">
            {filters?.from && (
              <span>From: {dayjs(filters.from).format("YYYY-MM-DD")}</span>
            )}
            {filters?.to && (
              <span>To: {dayjs(filters.to).format("YYYY-MM-DD")}</span>
            )}
            {(!filters?.from && !filters?.to) && (
              <span>All Records</span>
            )}
        </div>
        <div className="text-right">
           Printed on: {isClient ? dayjs().format("YYYY-MM-DD HH:mm:ss") : "—"}
        </div>
      </div>
    </div>
  );
}
