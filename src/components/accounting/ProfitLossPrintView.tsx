"use client";

import React from "react";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import PrintHeader from "@/components/common/PrintHeader";

interface Props {
  report: any;
  kpis: any;
  fiscalYear: any;
  fromDateBS: string;
  toDateBS: string;
  systemSettings: any;
  onClose: () => void;
  comparePrevFy: boolean;
}

export default function ProfitLossPrintView({ report, kpis, fiscalYear, fromDateBS, toDateBS, systemSettings, onClose, comparePrevFy }: Props) {
  
  const formatNPR = (num: number | undefined) => {
    if (num === undefined) return "0.00";
    return Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const renderSection = (title: string, dataKey: string, sectionNumber: string, isExpense: boolean = false) => {
    const section = report[dataKey];
    if (!section || !section.items) return null;

    return (
      <>
        <tr className="bg-gray-100 text-gray-900 border-b border-gray-900">
          <td colSpan={comparePrevFy ? 5 : 2} className="py-1.5 px-2 font-bold text-[10px] uppercase tracking-wider">
            {sectionNumber}. {title}
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
      </>
    );
  };

  const renderTotalRow = (title: string, value: number, prevValue?: number, sectionRef?: string) => {
    const variance = value - (prevValue || 0);
    const variancePercent = prevValue ? ((variance / Math.abs(prevValue)) * 100).toFixed(2) : (value > 0 ? 100 : 0);

    return (
      <tr className="border-t border-b-2 border-gray-900 font-bold bg-white">
        <td className="py-2 px-2 text-[10px] uppercase">
          {sectionRef ? `${sectionRef}. ` : ""}{title}
        </td>
        <td className="py-2 px-2 text-[10px] text-right text-gray-900">
          {formatNPR(value)}
        </td>
        {comparePrevFy && (
          <>
            <td className="py-2 px-2 text-[10px] text-right text-gray-900">
              {formatNPR(prevValue)}
            </td>
            <td className="py-2 px-2 text-[10px] text-right text-gray-900">
              {variance > 0 ? "+" : ""}{formatNPR(variance)}
            </td>
            <td className="py-2 px-2 text-[10px] text-right text-gray-900">
              {Number(variancePercent) > 0 ? "+" : ""}{variancePercent}%
            </td>
          </>
        )}
      </tr>
    );
  };

  return (
    <div className="w-full bg-white print:m-0">
      {/* A4 Landscape Document */}
      <div className="max-w-[1122px] mx-auto my-8 bg-white shadow-lg print:shadow-none print:m-0 print:w-full" style={{ minHeight: '794px' }}>
        <div className="p-8 text-[11px] leading-tight font-sans text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          
          <PrintHeader systemSettings={systemSettings} title="PROFIT & LOSS STATEMENT" />

          {/* REPORT INFO SECTION */}
          <div className="grid grid-cols-2 gap-8 mb-6 border-b-2 border-gray-100 pb-4">
            <div className="space-y-2">
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold uppercase text-[9px]">Period</span>
                <span className="text-sm font-black text-gray-900">
                  {fromDateBS} TO {toDateBS}
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

          {/* TABLE SECTION */}
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-900 text-white uppercase">
                <th className="border border-gray-900 px-2 py-2 text-left font-bold">Particulars</th>
                <th className="border border-gray-900 px-2 py-2 text-right font-bold w-[18%]">
                  Current Period<br/>
                  <span className="text-[8px] font-normal tracking-wide">({fromDateBS} to {toDateBS})</span>
                </th>
                {comparePrevFy && (
                  <>
                    <th className="border border-gray-900 px-2 py-2 text-right font-bold w-[18%]">
                      Previous Period<br/>
                      <span className="text-[8px] font-normal tracking-wide">(Last FY)</span>
                    </th>
                    <th className="border border-gray-900 px-2 py-2 text-right font-bold w-[15%]">Variance Amt</th>
                    <th className="border border-gray-900 px-2 py-2 text-right font-bold w-[10%]">Var %</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {report?.revenue && (
                <>
                  {renderSection("INCOME", "revenue", "I")}
                  {renderSection("COST OF GOODS SOLD", "cogs", "II", true)}
                  {renderTotalRow("GROSS PROFIT ( I - II )", report.gross_profit.current, report.gross_profit.previous, "III")}
                  
                  {renderSection("OPERATING EXPENSES", "opex", "IV", true)}
                  {renderTotalRow("OPERATING PROFIT ( III - IV )", report.operating_profit.current, report.operating_profit.previous, "V")}
                  
                  {renderSection("OTHER INCOME", "other_income", "VI")}
                  {renderSection("OTHER EXPENSES", "other_expense", "VII", true)}
                  
                  {renderTotalRow("NET PROFIT ( V + VI - VII )", report.net_profit.current, report.net_profit.previous, "VIII")}
                </>
              )}
            </tbody>
          </table>

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
            <span>Profit & Loss Statement</span>
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
