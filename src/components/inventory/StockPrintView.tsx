"use client";

import React from "react";
import { Table, Tag } from "antd";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { numberToWords } from "@/utils/numberToWords";
import NepaliDate from "nepali-date";
import PrintHeader from "@/components/common/PrintHeader";

interface Props {
  data: any[];
  searchQuery: string;
}

export default function StockPrintView({ data, searchQuery }: Props) {
  const [mounted, setMounted] = React.useState(false);
  const [systemSettings, setSystemSettings] = React.useState<any>(null);

  React.useEffect(() => {
    setMounted(true);
    const fetchSettings = async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get("/system-settings");
        setSystemSettings(res.data);
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    fetchSettings();
  }, []);

  const columns = [
    {
      title: "#",
      key: "sn",
      width: 50,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Category / Product Name",
      dataIndex: "product_name",
      key: "product_name",
      render: (text: string, record: any) => {
        if (record.isCategory) {
          return <span className="font-bold">{text}</span>;
        }
        return <span className="pl-6">{text}</span>;
      },
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "For Sale",
      dataIndex: "for_sale_qty",
      key: "for_sale_qty",
      render: (v: number) => v !== undefined && v !== null ? `${v.toFixed(2)} Pcs` : "",
    },
    {
      title: "Internal Use",
      dataIndex: "internal_use_qty",
      key: "internal_use_qty",
      render: (v: number) => v !== undefined && v !== null ? `${v.toFixed(2)} Pcs` : "",
    },
    {
      title: "Total Stock",
      dataIndex: "total_base_qty",
      key: "total_base_qty",
      render: (v: number) => v !== undefined && v !== null ? (
        <span className="font-bold">{v.toFixed(2)} Pcs</span>
      ) : "",
    },
    {
      title: "Unit Price",
      dataIndex: "unit_price",
      key: "unit_price",
      render: (v: number) => (v > 0 ? `${formatNepaliCurrency(v)} (Cost)` : "-"),
    },
    {
      title: "Est. Value (NPR)",
      dataIndex: "est_value",
      key: "est_value",
      render: (v: number) => v !== undefined && v !== null ? (
        <span className="font-bold">{formatNepaliCurrency(v)}</span>
      ) : "",
    },
  ];

  const totalValue = data.reduce((acc, curr) => acc + (curr.isCategory ? 0 : (curr.est_value || 0)), 0);

  return (
    <div className="bg-white p-2 sm:p-4 print:p-0 text-black w-full" id="stock-report">
      <PrintHeader systemSettings={systemSettings} title="Stock Status Report" />

      {/* Info Table */}
      <table className="w-full mb-3 border-collapse text-[10px]">
        <tbody>
          <tr>
            <td className="w-[15%] font-bold py-1">Report Date:</td>
            <td className="w-[45%] border-b border-gray-100 py-1 text-blue-800 font-semibold leading-tight">
              {mounted ? (
                <div className="flex items-center gap-2">
                  <span>{new NepaliDate().format("YYYY-MM-DD")} BS</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-[10px] text-gray-600 font-normal">{dayjs().format("YYYY-MM-DD")} AD</span>
                </div>
              ) : ""}
            </td>
            <td className="w-[15%] font-bold py-1 text-right pr-4">Printed On:</td>
            <td className="w-[25%] border-b border-gray-100 py-1 text-right text-gray-500 italic">
              {mounted ? dayjs().format("hh:mm A") : ""}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Main Table */}
      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        bordered
        size="small"
        className="print-table mb-6"
        rowClassName={(record) => record.isCategory ? 'bg-gray-50 font-bold' : ''}
        footer={() => (
           <div className="flex justify-between items-center p-2 bg-gray-50 font-bold border-t-2 border-gray-800">
              <span className="uppercase text-[10px]">Total Stock Valuation (NPR)</span>
               <span className="text-base text-red-700 border-2 border-gray-900 px-4 py-1">
                 {mounted ? formatNepaliCurrency(totalValue) : "0"}
              </span>
           </div>
        )}
      />

      {/* Amount in Words */}
      <div className="mb-6 text-[11px] italic border-l-4 border-gray-200 pl-4 py-2">
         <b>Amount in words:</b> {mounted ? numberToWords(totalValue) : ""}
      </div>

      {/* Signature Section */}
      <div className="mt-8 flex justify-between gap-12 px-4">
        <div className="flex-1 text-center pt-2 border-t border-gray-800">
          <p className="text-[10px] font-black uppercase tracking-tighter">Prepared By</p>
        </div>
        <div className="flex-1 text-center pt-2 border-t border-gray-800">
          <p className="text-[10px] font-black uppercase tracking-tighter">Checked By</p>
        </div>
        <div className="flex-1 text-center pt-2 border-t border-gray-800">
          <p className="text-[10px] font-black uppercase tracking-tighter">Approved By</p>
        </div>
      </div>

      {/* Footer Stamp */}
      <div className="mt-8 text-[9px] text-gray-400 flex justify-between items-center border-t border-gray-100 pt-2 italic">
         <div>
            {mounted ? `Computer-generated summary. Printed on: ${dayjs().format("YYYY-MM-DD hh:mm:ss A")}` : ""}
         </div>
          <div className="font-bold">
            System: {systemSettings?.company_name || "BBMedX"}
          </div>
      </div>

      <style jsx global>{`
        .print-table {
           border-top: 1px solid #000 !important;
        }
        .print-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #000 !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 9px !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #000 !important;
          padding: 4px 8px !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-table .ant-table-tbody > tr.bg-gray-50 > td {
          background-color: #f9fafb !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-table .ant-table-tbody > tr > td {
          padding: 4px 8px !important;
          font-size: 10px !important;
          border-bottom: 1px solid #eee !important;
        }
        @media print {
          body { font-family: 'Poppins', sans-serif; }
          .no-print { display: none !important; }
          @page { 
            margin: 5mm !important;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
}
