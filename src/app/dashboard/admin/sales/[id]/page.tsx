/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { numberToWords } from "@/utils/numberToWords";
import NepaliDate from "nepali-date";
import { 
  Printer, 
  FileText, 
  User, 
  Calendar, 
  CreditCard, 
  Tag, 
  Package, 
  Hash, 
  Building2, 
  Phone, 
  Mail, 
  WalletCards,
  ArrowLeft,
  ChevronRight,
  Info
} from "lucide-react";

export default function SaleDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/sales/${id}`),
      api.get("/system-settings"),
    ])
      .then(([saleRes, settingsRes]) => {
        setData(saleRes.data);
        setSystemSettings(settingsRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009966]"></div>
    </div>
  );
  if (!data) return <div className="p-8 text-center text-red-500 font-medium">Sale not found.</div>;

  const { sale, summary } = data;
  const items = sale.items || [];
  const customer = sale.customer || {};

  const grossAmount = Number(summary.gross_amount || 0);
  const taxableAmount = items.reduce((sum: number, i: any) => i.vat_included ? sum + Number(i.inventory_value || 0) : sum, 0);
  const vatAmount = Number(summary.vat_amount || 0);
  const discountAmount = Number(summary.discount_amount || 0);
  const totalAmount = Number(summary.total_amount || 0);
  const subtotalBeforeOverallDiscount = grossAmount + vatAmount;

  const nepaliDate = sale.invoice_date ? new NepaliDate(new Date(sale.invoice_date)).format("YYYY-MM-DD") : "—";
  const invoiceTime = sale.created_at ? dayjs(sale.created_at).format("HH:mm A") : dayjs().format("HH:mm A");
  const overallDiscountPercent = grossAmount > 0 ? (discountAmount / grossAmount) * 100 : 0;

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto pb-12" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ================= TOP NAVIGATION & ACTIONS ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => router.push("/dashboard/admin/sales")} className="hover:text-[#009966] flex items-center gap-1 transition-colors border-none bg-transparent p-0 cursor-pointer">
            <ArrowLeft size={16} /> Sales
          </button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="font-semibold text-gray-900">{sale.invoice_no}</span>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.open(`/dashboard/admin/sales/${sale.id}/print`, "_blank")}
            className="rounded-xl border-gray-200 hover:border-[#009966] hover:text-[#009966] group h-10 px-6 font-bold"
          >
            <Printer size={18} className="mr-2 text-gray-400 group-hover:text-[#009966]" />
            Print
          </Button>

          <Button
            onClick={() => router.push(`/dashboard/admin/accounting/parties/${customer.id}/ledger`)}
            className="bg-[#009966] hover:bg-[#008055] text-white rounded-xl px-6 h-10 shadow-md shadow-green-100 font-bold"
          >
            <WalletCards size={18} className="mr-2" />
            Customer Ledger
          </Button>
        </div>
      </div>

      {/* ================= MAIN INVOICE CONTAINER (Mirroring Print Layout) ================= */}
      <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-10 relative overflow-hidden">
        
        {/* IRD Watermark style Header tag */}
        <div className="absolute top-8 right-10 opacity-5 font-black text-6xl uppercase pointer-events-none -rotate-12 select-none">
          {sale.status}
        </div>

        {/* ======== HEADER ======== */}
        <div className="flex justify-between items-center mb-6">
          <div className="w-[20%]">
             <div className="w-20 h-20 bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-100 overflow-hidden shadow-inner">
                {systemSettings?.logo ? (
                  <img
                    src={`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "")}/storage/${systemSettings.logo}`}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Package className="text-gray-200" size={32} />
                )}
             </div>
          </div>

          <div className="w-[60%] text-center">
             <div className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none mb-2">
                {systemSettings?.firm_name || "Company Name"}
             </div>
             <div className="text-sm text-gray-500 font-medium">
                {systemSettings?.address || "Address"}
             </div>
             <div className="text-xs text-gray-400 mt-1 font-medium italic">
                {systemSettings?.email && `Email: ${systemSettings.email}`}
                {systemSettings?.email && systemSettings?.contact_number && " | "}
                {systemSettings?.contact_number && `Phone: ${systemSettings.contact_number}`}
             </div>
          </div>

          <div className="w-[20%] text-right align-top">
             <div className="inline-block whitespace-nowrap border-2 border-gray-900 px-4 py-2.5 text-xs font-black leading-tight text-right uppercase rounded-xl">
                {systemSettings?.is_vat_registered ? "VAT No. :" : "PAN No. :"}
                <span className="ml-2 bg-gray-900 text-white px-2 py-0.5 rounded">{systemSettings?.vat_no || systemSettings?.pan_no || "—"}</span>
             </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-100 mb-8" />

        {/* ── Title Box ── */}
        <div className="text-center mb-10 relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-10 py-2.5 bg-white border-2 border-gray-900 text-lg font-black uppercase tracking-[0.3em] text-gray-900 rounded-full shadow-sm">
              Tax Invoice
            </span>
          </div>
        </div>

        {/* ======== INFO SECTION ======== */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          {/* Bill To */}
          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-50/50">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
               <User size={14} className="text-[#009966]" />
               <h4 className="font-black uppercase text-[10px] tracking-widest">Bill To:</h4>
            </div>
            <div className="text-xl font-black text-gray-900 mb-2">{customer.name}</div>
            <div className="space-y-1.5 text-sm text-gray-600 font-medium">
               <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-gray-300" />
                  <span>{customer.address || "Address: —"}</span>
               </div>
               <div className="flex items-center gap-2">
                  <Hash size={14} className="text-gray-300" />
                  <span>PAN/VAT No: <span className="font-black text-gray-900 ml-1">{customer.pan_no || "—"}</span></span>
               </div>
               <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-300" />
                  <span>Contact: {customer.phone || customer.email || "—"}</span>
               </div>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="space-y-3 pt-4">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-bold uppercase text-[10px] text-gray-400 tracking-wider">Invoice No:</span>
              <span className="font-black text-gray-900 tracking-tight text-lg">{sale.invoice_no}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 py-2">
              <span className="font-bold uppercase text-[10px] text-gray-400 tracking-wider">Date (A.D.):</span>
              <div className="text-right">
                 <span className="font-bold text-gray-900">{dayjs(sale.invoice_date).format("YYYY-MM-DD")}</span>
                 <span className="ml-2 text-gray-400 text-[10px] font-black uppercase tracking-tighter">{invoiceTime}</span>
              </div>
            </div>
            <div className="flex justify-between border-b border-gray-50 py-2">
              <span className="font-bold uppercase text-[10px] text-gray-400 tracking-wider">Date (B.S.):</span>
              <div className="text-right">
                 <span className="font-bold text-gray-900">{nepaliDate}</span>
                 <span className="ml-2 text-gray-400 text-[10px] font-black uppercase tracking-tighter">{invoiceTime}</span>
              </div>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-bold uppercase text-[10px] text-gray-400 tracking-wider">Payment Method:</span>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest
                 ${sale.status === "paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}
              `}>
                 {sale.payment_mode || sale.status}
              </span>
            </div>
          </div>
        </div>

        {/* ======== ITEMS TABLE ======== */}
        <div className="overflow-hidden border border-gray-100 rounded-2xl mb-10">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white font-black uppercase text-[10px] tracking-widest">
                <th className="px-4 py-4 text-center w-12 border-r border-white/10 text-[9px]">S.N.</th>
                <th className="px-4 py-4 text-left border-r border-white/10">Particulars</th>
                <th className="px-4 py-4 text-center border-r border-white/10">Batch / Exp</th>
                <th className="px-4 py-4 text-right border-r border-white/10">Qty</th>
                <th className="px-4 py-4 text-right border-r border-white/10">Rate</th>
                <th className="px-4 py-4 text-right border-r border-white/10">Disc</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item: any, idx: number) => {
                const lineAmount = Number(item.inventory_value || 0);
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 text-center font-bold text-gray-400 border-r border-gray-50">{idx + 1}</td>
                    <td className="px-4 py-4 border-r border-gray-50">
                      <div className="font-black text-gray-900 text-sm leading-tight">{item.product?.name}</div>
                      <div className="text-[9px] text-gray-400 mt-1 uppercase font-bold">HS Code: {item.hs_code || "—"}</div>
                    </td>
                    <td className="px-4 py-4 text-center border-r border-gray-50">
                      <div className="font-bold text-gray-700">{item.batch?.batch_no || "—"}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 uppercase font-medium">
                        {item.batch?.expiry_date ? dayjs(item.batch.expiry_date).format("YYYY MMM") : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-black text-[#009966] border-r border-gray-50">
                      <div>
                        {item.unit_breakdown?.[0]?.qty ?? item.quantity}
                        <span className="text-[8px] ml-1 text-gray-400 uppercase">{item.unit_breakdown?.[0]?.unit}</span>
                      </div>
                      {Number(item.free_qty) > 0 && (
                        <div className="text-[10px] font-bold italic mt-1 text-[#009966] bg-green-50 px-2 py-0.5 rounded inline-block whitespace-nowrap">
                          + {Number(item.free_qty)} Free
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right border-r border-gray-50">
                      <div className="bg-gray-50 px-2 py-1 rounded inline-block font-bold text-gray-900 text-[13px]">
                         {formatNepaliCurrency(item.selling_price)}
                      </div>
                      {Number(item.original_price) !== Number(item.selling_price) && (
                         <div className="text-[10px] text-gray-500 line-through mt-1 block font-medium">{formatNepaliCurrency(item.original_price)}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right border-r border-gray-50">
                      {Number(item.discount_amount) > 0 ? (
                        <div className="leading-tight">
                          <div className="text-red-500 font-bold">-{formatNepaliCurrency(item.discount_amount)}</div>
                          <div className="text-[9px] text-gray-400 italic">({((Number(item.discount_amount) / Number(item.original_price || item.selling_price)) * 100).toFixed(1)}%)</div>
                        </div>
                      ) : <span className="text-gray-200">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-gray-900 text-sm">
                      {formatNepaliCurrency(lineAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* ======== TOTALS ======== */}
            <tfoot className="bg-gray-50/50">
              <tr className="font-bold border-t border-gray-100">
                <td colSpan={6} className="px-6 py-3 text-right uppercase text-[10px] tracking-widest text-gray-400 font-black">
                  Gross Total
                </td>
                <td className="px-6 py-3 text-right font-bold text-gray-900 border-l border-white">
                  {formatNepaliCurrency(grossAmount)}
                </td>
              </tr>
              <tr className="font-bold">
                <td colSpan={6} className="px-6 py-3 text-right uppercase text-[10px] tracking-widest text-gray-900 font-black">
                  Taxable Amount
                </td>
                <td className="px-6 py-3 text-right font-black text-gray-900 border-l border-white">
                  {formatNepaliCurrency(taxableAmount)}
                </td>
              </tr>
              <tr className="font-bold">
                <td colSpan={6} className="px-6 py-3 text-right uppercase text-[10px] tracking-widest text-orange-500 font-black">
                  VAT (13%)
                </td>
                <td className="px-6 py-3 text-right font-black text-orange-600 border-l border-white">
                  {formatNepaliCurrency(vatAmount)}
                </td>
              </tr>
              <tr className="font-black bg-gray-100">
                <td colSpan={6} className="px-6 py-4 text-right uppercase text-[11px] tracking-widest text-gray-900">
                   Total Amount
                </td>
                <td className="px-6 py-4 text-right font-black text-gray-900 text-lg border-l border-white">
                   {formatNepaliCurrency(grossAmount + vatAmount)}
                </td>
              </tr>
              {discountAmount > 0 && (
                <tr className="font-black italic bg-red-50/50">
                  <td colSpan={6} className="px-6 py-3 text-right uppercase text-[10px] tracking-widest text-red-600">
                    Overall Discount
                    <span className="ml-2 text-[9px] text-gray-400 font-black NOT-italic">({overallDiscountPercent.toFixed(1)}%)</span>
                  </td>
                  <td className="px-6 py-3 text-right text-red-700 font-black border-l border-white">
                    ({formatNepaliCurrency(discountAmount)})
                  </td>
                </tr>
              )}
              <tr className="font-black bg-gray-900 text-white">
                <td colSpan={6} className="px-6 py-6 text-right uppercase text-sm tracking-[0.3em] font-black">
                  Net Payable
                </td>
                <td className="px-6 py-6 text-right text-3xl font-black tracking-tighter shadow-inner">
                  {formatNepaliCurrency(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ======== AMOUNT IN WORDS ======== */}
        <div className="border-4 border-gray-900 px-8 py-6 mb-12 bg-gray-50 rounded-3xl flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-4">
              <div className="bg-gray-900 p-2 rounded-xl text-white">
                 <Info size={24} />
              </div>
              <div>
                 <span className="font-black text-[10px] uppercase text-gray-400 block mb-1 tracking-widest">Amount in Words</span>
                 <span className="text-xl font-black italic text-gray-900">
                    Rupees {numberToWords(totalAmount)}.
                 </span>
              </div>
           </div>
           <div className="text-gray-100 select-none">
              <FileText size={48} />
           </div>
        </div>

        {/* ======== SIGNATURES ======== */}
        <div className="grid grid-cols-3 gap-16 mt-24 text-center">
          <div>
            <div className="border-t-4 border-gray-900 pt-3 mt-12 bg-gray-50/30 rounded-t-xl group">
              <p className="font-black uppercase tracking-widest text-gray-400 text-[10px] mb-1 group-hover:text-gray-900 transition-colors">Prepared By</p>
              <p className="text-gray-900 font-black text-sm">{sale.creator?.name || "—"}</p>
            </div>
          </div>
          <div>
            <div className="border-t-4 border-gray-900 pt-3 mt-12 bg-gray-50/30 rounded-t-xl">
              <p className="font-black uppercase tracking-widest text-gray-400 text-[10px] mb-1">Checked By</p>
              <p className="text-gray-200 font-black text-sm">—————</p>
            </div>
          </div>
          <div>
            <div className="border-t-4 border-gray-900 pt-3 mt-12 bg-gray-900/5 rounded-t-xl px-4">
              <p className="font-black uppercase tracking-widest text-gray-900 text-[10px] mb-1">Authorized Signatory</p>
              <p className="text-[10px] text-gray-400 font-bold italic lowercase truncate">({systemSettings?.firm_name || "firm"})</p>
            </div>
          </div>
        </div>

        {/* ======== FOOTER ======== */}
        <div className="text-center text-[10px] text-gray-300 mt-20 border-t border-gray-50 pt-6 space-y-1 font-black uppercase tracking-[0.2em]">
          <p>This is a computer-generated TAX INVOICE. Generated by BBMedx ERP System.</p>
          <p className="text-[9px] text-gray-200">Session ID: {sale.id} • Printed on {dayjs().format("YYYY-MM-DD HH:mm:ss")}</p>
        </div>

      </div>

    </div>
  );
}
