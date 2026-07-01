"use client";

import React from "react";

interface Props {
  systemSettings: any;
  title?: string;
}

export default function PrintHeader({ systemSettings, title }: Props) {
  return (
    <div className="mb-6 font-sans" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>
      <table className="w-full mb-4 border-none border-collapse">
        <tbody>
          <tr>
            <td className="w-[20%] text-left align-middle">
              <div className="w-14 h-14 bg-white flex items-center justify-center font-bold text-[10px] rounded border border-gray-100 overflow-hidden">
                {systemSettings?.logo ? (
                  <img
                    src={`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "")}/storage/${systemSettings.logo}`}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-300 uppercase">Logo</span>
                )}
              </div>
            </td>
            <td className="w-[60%] text-center">
              <div className="text-xl font-black text-gray-900 uppercase tracking-tight leading-tight">
                {systemSettings?.firm_name || "Company Name"}
              </div>
              <div className="text-xs text-gray-600 mt-0.5 font-medium">
                {systemSettings?.address || "Address"}
              </div>
              <div className="text-[10px] text-gray-500">
                {systemSettings?.email && `Email: ${systemSettings.email}`}
                {systemSettings?.email && systemSettings?.contact_number && " | "}
                {systemSettings?.contact_number && `Phone: ${systemSettings.contact_number}`}
              </div>
            </td>
            <td className="w-[20%] text-right align-top">
              <div className="inline-block whitespace-nowrap border border-gray-400 p-1.5 text-[9px] font-bold leading-tight text-right uppercase">
                {systemSettings?.is_vat_registered && systemSettings?.vat_no
                  ? `VAT No. : ${systemSettings.vat_no}`
                  : systemSettings?.pan_no
                  ? `PAN No. : ${systemSettings.pan_no}`
                  : "PAN No. : —"}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {title && (
        <div className="text-center mb-6 relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-6 py-1 bg-white border-2 border-gray-800 text-base font-black uppercase tracking-widest text-gray-900">
              {title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
