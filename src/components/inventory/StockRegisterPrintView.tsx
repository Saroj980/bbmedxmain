"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import dayjs from "dayjs";
import { TrendingUp, TrendingDown } from "lucide-react";
import NepaliDate from "nepali-date";

interface Props {
  data: any[];
  filters?: { type?: string; from?: string; to?: string };
}

export default function StockRegisterPrintView({ data, filters }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totals = data.reduce(
    (acc, r) => ({ in: acc.in + Number(r.stock_in || 0), out: acc.out + Number(r.stock_out || 0) }),
    { in: 0, out: 0 }
  );

  const columns = [
    {
      title: "S.N",
      dataIndex: "_sn",
      key: "sn",
      width: 40,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: "12%",
      render: (d: string) => (
        <div className="flex flex-col">
          <span className="text-[10px] font-medium">{new NepaliDate(new Date(d)).format("MMMM DD, YYYY")}</span>
          <span className="text-[8px] text-gray-400">{dayjs(d).format("MMM DD, YYYY")}</span>
        </div>
      ),
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      width: "22%",
      render: (t: string) => <span className="font-semibold text-gray-800">{t}</span>,
    },
    {
      title: "Batch No",
      dataIndex: "batch_no",
      key: "batch_no",
      width: "13%",
      render: (t: string) => <span className="font-mono font-bold text-blue-600 text-[10px]">{t}</span>,
    },
    {
      title: "Type",
      dataIndex: "reference_type",
      key: "type",
      width: "10%",
      render: (t: string, r: any) => {
        const raw = (t || r.type || "").split("\\").pop()?.toLowerCase() || "manual";
        const label = raw === "purchase" ? "Purchase" : raw === "sale" ? "Sale" : raw === "return" ? "Return" : raw.charAt(0).toUpperCase() + raw.slice(1);
        const color = raw === "purchase" ? "green" : raw === "sale" ? "red" : raw === "return" ? "orange" : "default";
        return <Tag color={color} className="text-[9px] font-bold uppercase">{label}</Tag>;
      },
    },
    {
      title: "IN",
      dataIndex: "stock_in",
      key: "stock_in",
      width: "9%",
      className: "text-right",
      render: (v: number, r: any) =>
        v > 0 ? (
          <span className="text-green-700 font-bold font-mono flex items-center justify-end gap-0.5">
            <TrendingUp size={10} />+{v}
            <span className="text-[8px] font-normal text-green-500 ml-0.5">{r.base_unit_name}</span>
          </span>
        ) : <span className="text-gray-300">—</span>,
    },
    {
      title: "OUT",
      dataIndex: "stock_out",
      key: "stock_out",
      width: "9%",
      className: "text-right",
      render: (v: number, r: any) =>
        v > 0 ? (
          <span className="text-red-600 font-bold font-mono flex items-center justify-end gap-0.5">
            <TrendingDown size={10} />-{v}
            <span className="text-[8px] font-normal text-red-400 ml-0.5">{r.base_unit_name}</span>
          </span>
        ) : <span className="text-gray-300">—</span>,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      width: "10%",
      className: "text-right",
      render: (v: number, r: any) => (
        <span className={`font-mono font-black ${v <= 0 ? "text-red-500" : "text-blue-700"}`}>
          {v} <span className="text-[8px] font-normal opacity-50">{r.base_unit_name}</span>
        </span>
      ),
    },
    {
      title: "Performed By",
      dataIndex: "performed_by",
      key: "performed_by",
      render: (t: string) => <span className="text-[10px] italic text-gray-500">{t || "System"}</span>,
    },
  ];

  return (
    <div className="bg-white p-2 sm:p-4 print:p-0 text-black w-full" id="stock-register-report">
      {/* Header */}
      <table className="w-full mb-3 border-none border-collapse">
        <tbody>
          <tr>
            <td className="w-[15%] text-left">
              <div className="w-16 h-16 bg-white flex items-center justify-center font-bold text-[10px] rounded border border-gray-100">
                {/* LOGO */}
              </div>
            </td>
            <td className="w-[70%] text-center">
              <div className="text-xl font-bold text-gray-900 leading-tight uppercase tracking-tight">BBMedX</div>
              <div className="text-xs text-gray-600 mt-0.5 font-medium">Dhangadhi Submetropolitan City</div>
              <div className="text-[10px] text-gray-500">Email: bbmedx@gmail.com | Phone: XXXXXXXXXX</div>
            </td>
            <td className="w-[15%] text-right align-top">
              <div className="inline-block border border-gray-400 p-1.5 text-[10px] font-bold leading-tight text-right">
                PAN No. : 303334574
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Title */}
      <div className="text-center mb-3 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-6 py-1 bg-white border-2 border-gray-800 text-base font-black uppercase tracking-widest text-gray-900">
            Stock In / Out Register
          </span>
        </div>
      </div>

      {/* Report Metadata */}
      <table className="w-full mb-3 border-collapse text-[10px]">
        <tbody>
          <tr>
            <td className="w-[12%] font-bold py-0.5">Period:</td>
            <td className="w-[38%] border-b border-gray-100 py-0.5 text-slate-800 font-semibold">
              {filters?.from && filters?.to ? `${filters.from} to ${filters.to}` : "All Time"}
            </td>
            <td className="w-[12%] font-bold py-0.5 text-right pr-4">Printed On:</td>
            <td className="w-[38%] border-b border-gray-100 py-0.5 text-right italic text-gray-500 font-medium leading-tight">
              {mounted ? (
                <>
                  <div className="text-[10px] font-bold text-slate-800">
                    {new NepaliDate().format("MMMM DD, YYYY")}
                  </div>
                  <div className="text-[8px]">
                    {dayjs().format("MMM DD, YYYY hh:mm A")}
                  </div>
                </>
              ) : ""}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Summary Row */}
      <div className="flex gap-4 mb-3">
        <div className="flex-1 bg-green-50 border border-green-200 rounded px-3 py-1.5 text-center">
          <p className="text-[9px] uppercase font-black text-green-700">Total Stock IN</p>
          <p className="text-base font-black text-green-700">+{totals.in}</p>
        </div>
        <div className="flex-1 bg-red-50 border border-red-200 rounded px-3 py-1.5 text-center">
          <p className="text-[9px] uppercase font-black text-red-600">Total Stock OUT</p>
          <p className="text-base font-black text-red-600">-{totals.out}</p>
        </div>
        <div className="flex-1 bg-blue-50 border border-blue-200 rounded px-3 py-1.5 text-center">
          <p className="text-[9px] uppercase font-black text-blue-700">Net Balance</p>
          <p className={`text-base font-black ${totals.in - totals.out >= 0 ? "text-blue-700" : "text-red-600"}`}>
            {totals.in - totals.out}
          </p>
        </div>
      </div>

      <Table
        dataSource={data.map((r, i) => ({ ...r, _sn: i + 1 }))}
        columns={columns}
        pagination={false}
        size="small"
        rowClassName={(r) =>
          r.stock_in > 0 ? "print-row-green" : r.stock_out > 0 ? "print-row-red" : ""
        }
        className="professional-print-table"
      />

      {/* Signatures */}
      <div className="mt-8 flex justify-between gap-12 px-4 pt-12">
        <div className="flex-1 text-center pt-2 border-t border-gray-800">
          <p className="text-[10px] font-black uppercase tracking-tighter">Prepared By</p>
        </div>
        <div className="flex-1 text-center pt-2 border-t border-gray-800">
          <p className="text-[10px] font-black uppercase tracking-tighter">Verified By</p>
        </div>
        <div className="flex-1 text-center pt-2 border-t border-gray-800">
          <p className="text-[10px] font-black uppercase tracking-tighter">Approved By</p>
        </div>
      </div>

      <div className="mt-6 text-[9px] text-gray-400 flex justify-between items-center border-t border-gray-100 pt-2 italic">
        <div>{mounted ? `Printed: ${dayjs().format("YYYY-MM-DD hh:mm:ss A")}` : ""}</div>
        <div className="font-bold text-gray-500">System: BBMedX</div>
      </div>

      <style jsx global>{`
        @media print {
          body { font-family: 'Poppins', sans-serif; -webkit-print-color-adjust: exact; }
          @page { margin: 15mm !important; size: auto; }
        }
        .professional-print-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #1e293b !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 9px !important;
          padding: 6px 8px !important;
          border-bottom: 2px solid #000 !important;
        }
        .professional-print-table .ant-table-tbody > tr > td {
          padding: 5px 8px !important;
          font-size: 10px !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .print-row-green td { background-color: #f0fdf4 !important; }
        .print-row-red td { background-color: #fff5f5 !important; }
      `}</style>
    </div>
  );
}
