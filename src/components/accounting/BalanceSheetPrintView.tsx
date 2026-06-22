"use client";

import React from "react";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import PrintHeader from "@/components/common/PrintHeader";

interface Props {
  report: any;
  fiscalYear: any;
  asOnDateBS: string;
  systemSettings: any;
  comparePrevFy: boolean;
}

export default function BalanceSheetPrintView({ report, fiscalYear, asOnDateBS, systemSettings, comparePrevFy }: Props) {
  
  const formatNPR = (num: number | undefined) => {
    if (num === undefined) return "0.00";
    return Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const renderSection = (title: string, dataKey: string, sectionRef: string, isAssets: boolean) => {
    const parentSection = isAssets ? report?.assets : report?.liabilities;
    if (!parentSection) return null;
    
    const section = parentSection[dataKey];
    if (!section || !section.items) return null;

    return (
      <>
        <tr className="bg-gray-100 text-gray-900 border-b border-gray-900">
          <td colSpan={comparePrevFy ? 5 : 2} className="py-1.5 px-2 font-bold text-[10px] uppercase tracking-wider">
            {sectionRef}. {title}
          </td>
        </tr>
        {section.items.map((item: any, idx: number) => (
          <tr key={item.id} className="border-b border-gray-300">
            <td className="py-1 px-2 pl-6 text-[10px] text-gray-800">
              {item.name}
            </td>
            <td className="py-1 px-2 text-[10px] text-right font-medium">
              {formatNPR(item.current)}
            </td>
            {comparePrevFy && (
              <>
                <td className="py-1 px-2 text-[10px] text-right text-gray-600">
                  {formatNPR(item.previous)}
                </td>
                <td className="py-1 px-2 text-[10px] text-right text-gray-600">
                  {item.variance > 0 ? "+" : ""}{formatNPR(item.variance)}
                </td>
                <td className="py-1 px-2 text-[10px] text-right text-gray-600">
                  {item.variance_percent > 0 ? "+" : ""}{item.variance_percent}%
                </td>
              </>
            )}
          </tr>
        ))}
        <tr className="border-t border-b border-gray-900 font-bold bg-white">
          <td className="py-1.5 px-2 pl-6 text-[10px]">Total {title}</td>
          <td className="py-1.5 px-2 text-[10px] text-right text-gray-900">
            {formatNPR(section.total)}
          </td>
          {comparePrevFy && (
            <>
              <td className="py-1.5 px-2 text-[10px] text-right text-gray-900">
                {formatNPR(section.total_prev)}
              </td>
              <td className="py-1.5 px-2 text-[10px] text-right text-gray-900">-</td>
              <td className="py-1.5 px-2 text-[10px] text-right text-gray-900">-</td>
            </>
          )}
        </tr>
      </>
    );
  };

  const renderEquitySection = () => {
    const section = report?.equity;
    if (!section || !section.items) return null;

    return (
      <>
        <tr className="bg-gray-100 text-gray-900 border-b border-gray-900">
          <td colSpan={comparePrevFy ? 5 : 2} className="py-1.5 px-2 font-bold text-[10px] uppercase tracking-wider">
            III. EQUITY
          </td>
        </tr>
        {section.items.map((item: any, idx: number) => (
          <tr key={item.id} className="border-b border-gray-300">
            <td className="py-1 px-2 pl-6 text-[10px] text-gray-800">
              {item.name}
            </td>
            <td className="py-1 px-2 text-[10px] text-right font-medium">
              {formatNPR(item.current)}
            </td>
            {comparePrevFy && (
              <>
                <td className="py-1 px-2 text-[10px] text-right text-gray-600">
                  {formatNPR(item.previous)}
                </td>
                <td className="py-1 px-2 text-[10px] text-right text-gray-600">
                  {item.variance > 0 ? "+" : ""}{formatNPR(item.variance)}
                </td>
                <td className="py-1 px-2 text-[10px] text-right text-gray-600">
                  {item.variance_percent > 0 ? "+" : ""}{item.variance_percent}%
                </td>
              </>
            )}
          </tr>
        ))}
        <tr className="border-t border-b border-gray-900 font-bold bg-white">
          <td className="py-1.5 px-2 pl-6 text-[10px]">Total Equity</td>
          <td className="py-1.5 px-2 text-[10px] text-right text-gray-900">
            {formatNPR(section.total)}
          </td>
          {comparePrevFy && (
            <>
              <td className="py-1.5 px-2 text-[10px] text-right text-gray-900">
                {formatNPR(section.total_prev)}
              </td>
              <td className="py-1.5 px-2 text-[10px] text-right text-gray-900">-</td>
              <td className="py-1.5 px-2 text-[10px] text-right text-gray-900">-</td>
            </>
          )}
        </tr>
      </>
    );
  };

  return (
    <div className="w-full bg-white print:m-0">
      <div className="max-w-[1122px] mx-auto my-8 bg-white shadow-lg print:shadow-none print:m-0 print:w-full" style={{ minHeight: '794px' }}>
        <div className="p-8 text-[11px] leading-tight font-sans text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          
          <PrintHeader systemSettings={systemSettings} title="BALANCE SHEET" />

          {/* REPORT INFO SECTION */}
          <div className="grid grid-cols-2 gap-8 mb-6 border-b-2 border-gray-100 pb-4">
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold uppercase text-[9px]">As On Date</span>
                <span className="text-sm font-black text-gray-900">
                  {asOnDateBS}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-right">
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold uppercase text-[9px]">Fiscal Year</span>
                <span className="text-sm font-black text-gray-900 uppercase">
                  {fiscalYear?.name || "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 items-start">
            {/* ASSETS */}
            <div>
              <h3 className="font-bold text-[12px] uppercase mb-2 border-b-2 border-gray-900 pb-1">Assets</h3>
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-gray-900 text-white uppercase">
                    <th className="border border-gray-900 px-2 py-2 text-left font-bold">Particulars</th>
                    <th className="border border-gray-900 px-2 py-2 text-right font-bold w-[25%]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report?.assets && (
                    <>
                      {renderSection("CURRENT ASSETS", "current", "I", true)}
                      {renderSection("NON-CURRENT ASSETS", "non_current", "II", true)}
                    </>
                  )}
                </tbody>
                {report?.totals && (
                  <tfoot>
                    <tr className="border-t-2 border-b-2 border-gray-900 font-black bg-gray-100">
                      <td className="py-2 px-2 text-[11px] uppercase">TOTAL ASSETS</td>
                      <td className="py-2 px-2 text-[11px] text-right">{formatNPR(report.totals.total_assets)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* LIABILITIES & EQUITY */}
            <div>
              <h3 className="font-bold text-[12px] uppercase mb-2 border-b-2 border-gray-900 pb-1">Liabilities & Equity</h3>
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-gray-900 text-white uppercase">
                    <th className="border border-gray-900 px-2 py-2 text-left font-bold">Particulars</th>
                    <th className="border border-gray-900 px-2 py-2 text-right font-bold w-[25%]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report?.liabilities && (
                    <>
                      {renderSection("CURRENT LIABILITIES", "current", "I", false)}
                      {renderSection("NON-CURRENT LIABILITIES", "non_current", "II", false)}
                      {renderEquitySection()}
                    </>
                  )}
                </tbody>
                {report?.totals && (
                  <tfoot>
                    <tr className="border-t-2 border-b-2 border-gray-900 font-black bg-gray-100">
                      <td className="py-2 px-2 text-[11px] uppercase">TOTAL LIABILITIES & EQUITY</td>
                      <td className="py-2 px-2 text-[11px] text-right">{formatNPR(report.totals.total_liabilities_equity)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* SIGNATURES SECTION */}
          <div className="mt-20 grid grid-cols-3 gap-12 text-center text-[9px] uppercase font-bold tracking-tighter">
            <div>
              <div className="border-t-2 border-gray-900 pt-2 w-4/5 mx-auto">Prepared By</div>
            </div>
            <div>
              <div className="border-t-2 border-gray-900 pt-2 w-4/5 mx-auto">Verified By</div>
            </div>
            <div>
              <div className="border-t-2 border-gray-900 pt-2 w-4/5 mx-auto">Authorized By</div>
            </div>
          </div>
          
          {/* PRINT FOOTER */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-[8px] text-gray-400 flex justify-between italic">
            <span>Printed on: {dayjs().format("YYYY-MM-DD hh:mm A")}</span>
            <span>Balance Sheet Statement</span>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:m-0 { margin: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}} />
    </div>
  );
}
