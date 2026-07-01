/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import PurchasePaymentDrawer from "@/components/purchases/PurchasePaymentDrawer";
import PurchaseReturnDialog from "@/components/purchases/PurchaseReturnDialog";
import { toast } from "sonner";
import { 
  RotateCcw, 
  Printer, 
  ArrowLeft, 
  ChevronRight, 
  WalletCards, 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Hash, 
  Info, 
  Package, 
  FileText 
} from "lucide-react";
import NepaliDate from "nepali-date";
import { numberToWords } from "@/utils/numberToWords";

// import { useRouter } from "next/navigation";
// import router from "next/router";

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openPayment, setOpenPayment] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [reverseModalOpen, setReverseModalOpen] = useState(false);
  const [reverseReason, setReverseReason] = useState("");
  const [reversePaymentId, setReversePaymentId] = useState<number | null>(null);


  useEffect(() => {
    setIsClient(true);
    Promise.all([
      api.get(`/purchases/${id}`),
      api.get("/system-settings"),
    ])
      .then(([purchaseRes, settingsRes]) => {
        setData(purchaseRes.data);
        setSystemSettings(settingsRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Not found</p>;

  const { purchase, summary, journals} = data;
  const supplierAccountId = purchase.supplier.account_id;

  const reversePayment = async (paymentId: number) => {

    setReversePaymentId(paymentId);
    setReverseReason("");
    setReverseModalOpen(true);

    // console.log("Reversing payment", paymentId);
    // if (!confirm("Are you sure you want to reverse this payment?")) return;

    // try {
    //   await api.post(`/purchase/${paymentId}/reverse`);
    //   toast.success("Payment reversed");

    //   const res = await api.get(`/purchases/${purchase.id}`);
    //   setData(res.data);
    // } catch (err: any) {
    //   toast.error(err?.response?.data?.message || "Failed to reverse payment");
    // }
  };

  const confirmReversePayment = async () => {
    if (!reverseReason.trim()) {
      toast.error("Please provide a reason for reversal");
      return;
    }

    try {
      await api.post(`/purchase/${reversePaymentId}/reverse`, {
        reason: reverseReason,
      });

      toast.success("Payment reversed successfully");

      setReverseModalOpen(false);
      setReversePaymentId(null);

      const res = await api.get(`/purchases/${purchase.id}`);
      setData(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reverse payment");
    }
  };



  const ledgerRows = (() => {
    const rows: any[] = [];

    // Purchase journal
    if (journals?.purchase?.entries?.length) {
      journals.purchase.entries.forEach((e: any) => {
        rows.push({
          date: journals.purchase.journal_date,
          journal_no: journals.purchase.journal_no,
          source: "Purchase",
          account: `${e.account.code} – ${e.account.name}`,
          debit: Number(e.debit),
          credit: Number(e.credit),
        });
      });
    }

    // Payment journals
    journals?.payments?.forEach((pj: any) => {
      pj.entries.forEach((e: any) => {
        rows.push({
          date: pj.journal_date,
          journal_no: pj.journal_no,
          payment_id: pj.payment_id, 
          is_reversed: pj.is_reversed, 
          description: pj.description,
          source: "Payment",
          account: `${e.account.code} – ${e.account.name}`,
          debit: Number(e.debit),
          credit: Number(e.credit),
        });
      });
    });

    // console.log(journals?.payments);

    // Sort by date (ledger rule)
    rows.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Running balance
    let balance = 0;
      return rows.map(r => {
        balance += r.debit - r.credit;
        return { ...r, balance };
      });
    })();

    // const outstandingBalance = ledgerRows.length > 0
    //   ? ledgerRows[ledgerRows.length - 1].balance
    //   : summary.total_amount;
  const outstandingBalance = (() => {
    let balance = 0;

    // Purchase journal
    journals?.purchase?.entries?.forEach((e: any) => {
      if (e.account_id === supplierAccountId) {
        balance += Number(e.debit) - Number(e.credit);
      }
    });

    // Payment journals
    journals?.payments?.forEach((j: any) => {
      j.entries.forEach((e: any) => {
        if (e.account_id === supplierAccountId) {
          balance += Number(e.debit) - Number(e.credit);
        }
      });
    });

    return balance;
  })();

  const payableAmount = Math.abs(outstandingBalance);
  const isPayable = outstandingBalance < 0;
  const defaultPaymentAmount = Math.abs(outstandingBalance);

  const groupedLedger = ledgerRows.reduce((acc: any, row: any) => {
    if (!acc[row.journal_no]) {
      acc[row.journal_no] = {
        journal_no: row.journal_no,
        date: row.date,
        source: row.source,
        payment_id: row.payment_id, 
        is_reversed: row.is_reversed,
        rows: [],
        description: row.description,
      };
    }

    acc[row.journal_no].rows.push(row);
    return acc;
  }, {});
  const groupedLedgerList = Object.values(groupedLedger);

  const purchaseData = purchase || {};
  const supplier = purchaseData.supplier || {};
  const items = purchaseData.items || [];
  
  const grossAmount = Number(summary.gross_amount || purchaseData.gross_amount || 0);
  const vatAmount = Number(summary.vat_amount || purchaseData.vat_amount || 0);
  const discountAmount = Number(summary.discount_amount || purchaseData.discount_amount || 0);
  const carrierCost = Number(purchaseData.carrier_cost || 0);
  const totalAmount = Number(summary.total_amount || purchaseData.total_amount || 0);

  const nepaliDate = purchaseData.invoice_date ? new NepaliDate(new Date(purchaseData.invoice_date)).format("YYYY-MM-DD") : "—";
  const invoiceTime = purchaseData.created_at ? dayjs(purchaseData.created_at).format("HH:mm A") : dayjs().format("HH:mm A");

  const returnedAmount = Number(summary.returned_amount || 0);
  const finalPayable = Number(summary.final_payable ?? totalAmount);
  const returns = purchaseData.returns || [];

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto pb-12" style={{ fontFamily: "var(--font-outfit), sans-serif" }}>

      {/* ================= TOP NAVIGATION & ACTIONS ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => router.push("/dashboard/admin/purchases")} className="hover:text-[#009966] flex items-center gap-1 transition-colors border-none bg-transparent p-0 cursor-pointer">
            <ArrowLeft size={16} /> Purchases
          </button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="font-semibold text-gray-900">{purchaseData.invoice_no}</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsReturnOpen(true)}
            className="rounded-xl border-gray-200 hover:border-orange-500 hover:text-orange-500 group h-10 px-6 font-bold"
          >
            <RotateCcw size={18} className="mr-2 text-gray-400 group-hover:text-orange-500" />
            Record Return
          </Button>

          <Button 
            variant="outline" 
            onClick={() => window.open(`/dashboard/admin/purchases/${id}/print`, "_blank")}
            className="rounded-xl border-gray-200 hover:border-[#009966] hover:text-[#009966] group h-10 px-6 font-bold"
          >
            <Printer size={18} className="mr-2 text-gray-400 group-hover:text-[#009966]" />
            Print Invoice
          </Button>

          <Button
            onClick={() => router.push(`/dashboard/admin/accounting/parties/${supplier.id}/ledger`)}
            className="bg-[#009966] hover:bg-[#008055] text-white rounded-xl px-6 h-10 shadow-md shadow-green-100 font-bold"
          >
            <WalletCards size={18} className="mr-2" />
            Supplier Ledger
          </Button>
        </div>
      </div>

      {/* ================= MAIN INVOICE CONTAINER ================= */}
      <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-10 relative overflow-hidden">
        
        {/* Status Watermark */}
        <div className="absolute top-8 right-10 opacity-5 font-black text-6xl uppercase pointer-events-none -rotate-12 select-none">
          {purchaseData.status}
        </div>

        {/* ======== HEADER ======== */}
        <div className="flex justify-between items-center mb-6">
          <div className="w-[20%]">
             <div className="w-20 h-20 bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-100 overflow-hidden shadow-inner font-bold text-gray-300 text-[10px]">
                {systemSettings?.logo ? (
                  <img
                    src={`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "")}/storage/${systemSettings.logo}`}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  "LOGO"
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
              Purchase Invoice
            </span>
          </div>
        </div>

        {/* ======== INFO SECTION ======== */}
        <div className="grid grid-cols-2 gap-12 mb-10">
          {/* Supplier Info */}
          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-50/50">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
               <User size={14} className="text-[#009966]" />
               <h4 className="font-black uppercase text-[10px] tracking-widest">Supplier:</h4>
            </div>
            <div className="text-xl font-black text-gray-900 mb-2">{supplier.name}</div>
            <div className="space-y-1.5 text-sm text-gray-600 font-medium">
               <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-gray-300" />
                  <span>{supplier.address || "Address: —"}</span>
               </div>
               <div className="flex items-center gap-2">
                  <Hash size={14} className="text-gray-300" />
                  <span>PAN/VAT No: <span className="font-black text-gray-900 ml-1">{supplier.pan_no || "—"}</span></span>
               </div>
               <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-300" />
                  <span>Contact: {supplier.phone || supplier.email || "—"}</span>
               </div>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="space-y-3 pt-4">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="font-bold uppercase text-[10px] text-gray-400 tracking-wider">Invoice No:</span>
              <span className="font-black text-gray-900 tracking-tight text-lg">{purchaseData.invoice_no}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 py-2">
              <span className="font-bold uppercase text-[10px] text-gray-400 tracking-wider">Date (A.D.):</span>
              <div className="text-right">
                 <span className="font-bold text-gray-900">{dayjs(purchaseData.invoice_date).format("YYYY-MM-DD")}</span>
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
            <div className="flex justify-between py-2 items-center">
              <span className="font-bold uppercase text-[10px] text-gray-400 tracking-wider">Supplier Invoice:</span>
              <span className="font-black text-gray-900">{purchaseData.supplier_invoice_no || "—"}</span>
            </div>
          </div>
        </div>

        {/* ======== ITEMS TABLE ======== */}
        <div className="overflow-hidden border border-gray-100 rounded-2xl mb-10">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white font-black uppercase text-[10px] tracking-widest">
                <th className="px-4 py-4 text-center w-12 border-r border-white/10 text-[9px]">S.N.</th>
                <th className="px-4 py-4 text-center w-20 border-r border-white/10 text-[9px]">HS Code</th>
                <th className="px-4 py-4 text-left border-r border-white/10">Particulars</th>
                <th className="px-4 py-4 text-center border-r border-white/10">Batch / Exp</th>
                <th className="px-4 py-4 text-right border-r border-white/10">Qty</th>
                <th className="px-4 py-4 text-right border-r border-white/10">Rate</th>
                <th className="px-4 py-4 text-right border-r border-white/10">VAT</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[11px]">
              {items.map((item: any, idx: number) => {
                const lineAmount = Number(item.inventory_value || 0) + Number(item.vat_amount || 0);
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 text-center font-bold text-gray-400 border-r border-gray-50">{idx + 1}</td>
                    <td className="px-4 py-4 text-center font-bold text-gray-500 border-r border-gray-50 text-[10px]">
                      {item.batch?.hs_code || "—"}
                    </td>
                    <td className="px-4 py-4 border-r border-gray-50">
                      <div className="font-black text-gray-900 text-sm leading-tight">{item.product?.name}</div>
                    </td>
                    <td className="px-4 py-4 text-center border-r border-gray-50">
                      <div className="font-bold text-gray-700">{item.batch?.batch_no || "—"}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 uppercase font-medium">
                        {item.batch?.expiry_date ? dayjs(item.batch.expiry_date).format("YYYY MMM") : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right border-r border-gray-50">
                      <div className="font-black text-[#009966]">
                        {item.unit_breakdown?.[0]?.qty ?? item.quantity}
                        <span className="text-[8px] ml-1 text-gray-400 uppercase">{item.unit_breakdown?.[0]?.unit}</span>
                      </div>
                      {item.free_unit_breakdown && item.free_unit_breakdown.length > 0 && (
                        <div className="text-blue-600 font-bold text-[10px] mt-1">
                          +{item.free_unit_breakdown[0].qty} <span className="text-[8px] uppercase">{item.free_unit_breakdown[0].unit} (Free)</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right border-r border-gray-50">
                      <div className="bg-gray-50 px-2 py-1 rounded inline-block font-bold text-gray-600">
                         {formatNepaliCurrency(item.cost_price)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right border-r border-gray-50">
                      {Number(item.vat_amount) > 0 ? (
                        <div className="leading-tight">
                          <div className="text-orange-500 font-bold">{formatNepaliCurrency(item.vat_amount)}</div>
                          <div className="text-[9px] text-gray-400 italic">(13%)</div>
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
            <tfoot className="bg-gray-50/50 border-t border-gray-100">
              <tr className="font-bold">
                <td colSpan={7} className="px-6 py-3 text-right uppercase text-[10px] tracking-widest text-gray-400 font-black">
                  Gross Total
                </td>
                <td className="px-6 py-3 text-right font-bold text-gray-900 border-l border-white">
                  {formatNepaliCurrency(grossAmount)}
                </td>
              </tr>
              {vatAmount > 0 && (
                <tr className="font-bold">
                  <td colSpan={7} className="px-6 py-3 text-right uppercase text-[10px] tracking-widest text-orange-500 font-black">
                    VAT (13%)
                  </td>
                  <td className="px-6 py-3 text-right font-black text-orange-600 border-l border-white">
                    {formatNepaliCurrency(vatAmount)}
                  </td>
                </tr>
              )}
              {carrierCost > 0 && (
                <tr className="font-bold">
                  <td colSpan={7} className="px-6 py-3 text-right uppercase text-[10px] tracking-widest text-gray-500 font-black">
                    Carrier / Transport Cost
                  </td>
                  <td className="px-6 py-3 text-right font-black text-gray-600 border-l border-white">
                    {formatNepaliCurrency(carrierCost)}
                  </td>
                </tr>
              )}
              <tr className="font-black bg-gray-100">
                <td colSpan={7} className="px-6 py-4 text-right uppercase text-[11px] tracking-widest text-gray-900">
                   Sub-Total
                </td>
                <td className="px-6 py-4 text-right font-black text-gray-900 text-lg border-l border-white">
                   {formatNepaliCurrency(grossAmount + vatAmount + carrierCost)}
                </td>
              </tr>
              {discountAmount > 0 && (
                <tr className="font-black italic bg-red-50/50">
                  <td colSpan={7} className="px-6 py-3 text-right uppercase text-[10px] tracking-widest text-red-600">
                    Overall Discount
                  </td>
                  <td className="px-6 py-3 text-right text-red-700 font-black border-l border-white">
                    ({formatNepaliCurrency(discountAmount)})
                  </td>
                </tr>
              )}
              <tr className="font-black bg-gray-900 text-white">
                <td colSpan={7} className="px-6 py-6 text-right uppercase text-sm tracking-[0.3em] font-black">
                  Net Payable
                </td>
                <td className="px-6 py-6 text-right text-3xl font-black tracking-tighter shadow-inner">
                  {formatNepaliCurrency(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ======== RETURNS SECTION ======== */}
        {returns.length > 0 && (
          <div className="mb-8">
            <div className="overflow-hidden rounded-2xl border border-orange-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-orange-50">
                    <th className="px-6 py-3 text-left font-black text-[10px] uppercase tracking-wider text-orange-800" colSpan={5}>
                      Debit Notes / Returns
                    </th>
                    <th className="px-6 py-3 text-right font-black text-[10px] uppercase tracking-wider text-orange-800">
                      Items
                    </th>
                    <th className="px-6 py-3 text-right font-black text-[10px] uppercase tracking-wider text-orange-800">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((ret: any) => (
                    <tr key={ret.id} className="border-t border-orange-100">
                      <td className="px-6 py-3 font-black text-gray-900" colSpan={5}>
                        <div>{ret.return_no}</div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          {ret.return_date ? dayjs(ret.return_date).format("YYYY-MM-DD") : "—"}
                          {ret.remarks && <span className="ml-2 italic text-orange-600 font-bold">({ret.remarks})</span>}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right text-[10px] text-orange-700 font-bold">
                        {ret.items?.map((ri: any) => (
                          <div key={ri.id}>
                            {ri.product?.name}: {Math.round(Number(ri.quantity))} Reg + {Math.round(Number(ri.free_qty))} {ri.unit?.name || "Unit"} (Free)
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-red-600">
                        ({formatNepaliCurrency(ret.total_amount)})
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-orange-50 border-t border-orange-200">
                    <td colSpan={6} className="px-6 py-3 text-right uppercase text-[10px] tracking-wider text-orange-800 font-black">
                      Total Returns
                    </td>
                    <td className="px-6 py-3 text-right font-black text-red-700">
                      ({formatNepaliCurrency(returnedAmount)})
                    </td>
                  </tr>
                  <tr className="bg-emerald-900 text-white">
                    <td colSpan={6} className="px-6 py-5 text-right uppercase text-sm tracking-[0.3em] font-black">
                      Final Net Payable
                    </td>
                    <td className="px-6 py-5 text-right text-2xl font-black tracking-tighter">
                      {formatNepaliCurrency(finalPayable)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ======== AMOUNT IN WORDS ======== */}
        <div className="border-4 border-gray-900 px-8 py-6 mb-12 bg-gray-50 rounded-3xl flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-4">
              <div className="bg-gray-900 p-2 rounded-xl text-white">
                 <Info size={24} />
              </div>
              <div>
                 <span className="font-black text-[10px] uppercase text-gray-400 block mb-1 tracking-widest">Amount in Words</span>
                 <span className="text-xl font-black italic text-gray-900">
                    Rupees {numberToWords(finalPayable)}.
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
              <p className="text-gray-900 font-black text-sm">{purchaseData.creator?.name || "—"}</p>
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
          <p>This is a computer-generated PURCHASE INVOICE. Generated by BBMedx ERP System.</p>
          <p className="text-[9px] text-gray-200">Session ID: {purchaseData.id} • Printed on {isClient ? dayjs().format("YYYY-MM-DD HH:mm:ss") : "—"}</p>
        </div>
      </div>


      {/* ================= JOURNAL ================= */}
      <div className="overflow-hidden border border-gray-100 rounded-3xl bg-white shadow-xl mt-10">
        <div className="px-8 py-5 border-b bg-gray-50/50 flex items-center gap-3">
          <div className="bg-gray-900 p-2 rounded-lg text-white">
            <FileText size={18} />
          </div>
          <h4 className="text-sm font-black uppercase tracking-widest text-gray-700">
            Accounting Ledger
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-900 text-white font-black uppercase text-[10px] tracking-widest">
                <th className="px-4 py-4 text-left w-[110px] border-r border-white/10 uppercase">Date</th>
                <th className="px-4 py-4 text-left border-r border-white/10 italic">Journal #</th>
                <th className="px-4 py-4 text-left border-r border-white/10">Particulars</th>
                <th className="px-4 py-4 text-right w-[140px] border-r border-white/10">Debit (NPR)</th>
                <th className="px-4 py-4 text-right w-[140px] border-r border-white/10">Credit (NPR)</th>
                <th className="px-4 py-4 text-right w-[160px] border-r border-white/10">Balance</th>
                <th className="px-4 py-4 text-center w-[90px]">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {groupedLedgerList.map((group: any) => {
                const isPayment = group.source === "Payment";
                const rowCount = group.rows.length;
                const reversalReason = group.description?.includes("Reason:")
                    ? group.description.split("Reason:")[1]?.trim()
                    : null;
                return group.rows.map((r: any, idx: number) => (
                  <tr
                    key={`${group.journal_no}-${idx}`}
                    className={[
                      "hover:bg-[#009966]/5 transition-colors",
                      group.is_reversed ? "bg-red-50/30" : ""
                    ].join(" ")}
                  >

                    {/* DATE (once) */}
                    {idx === 0 && (
                      <td
                        rowSpan={rowCount}
                        className="px-4 py-4 align-top font-bold text-gray-500 border-r border-gray-50"
                      >
                        {dayjs(group.date).format("YYYY-MM-DD")}
                      </td>
                    )}

                    {/* JOURNAL (once) */}
                    {idx === 0 && (
                      <td
                        rowSpan={rowCount}
                        className="px-4 py-4 align-top border-r border-gray-50"
                      >
                        <div className="font-black text-gray-900 font-mono tracking-tighter">{group.journal_no}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase mt-1">
                          {group.source}
                        </div>

                         {/* Reversal Reason */}
                        {group.is_reversed && (
                          <div className="mt-2 p-2 bg-red-100/50 rounded-lg text-[9px] text-red-600 font-bold border border-red-200">
                            REVERSED {reversalReason && `| Reason: ${reversalReason}`}
                          </div>
                        )}
                      </td>
                    )}

                    {/* PARTICULARS */}
                    <td className="px-4 py-4 border-r border-gray-50">
                      <p className="font-black text-gray-900 text-sm leading-tight">{r.account}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 italic">
                        {r.source === "Purchase"
                          ? "To Purchase A/c"
                          : "By Payment"}
                      </p>
                    </td>

                    {/* DEBIT */}
                    <td className="px-4 py-4 text-right font-black text-[#009966] border-r border-gray-50">
                      {r.debit > 0 ? formatNepaliCurrency(r.debit) : ""}
                    </td>

                    {/* CREDIT */}
                    <td className="px-4 py-4 text-right font-black text-red-600 border-r border-gray-50">
                      {r.credit > 0 ? formatNepaliCurrency(r.credit) : ""}
                    </td>

                    {/* BALANCE */}
                    <td className="px-4 py-4 text-right border-r border-gray-50">
                      <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-black ${
                        r.balance >= 0 ? "bg-green-100 text-[#009966]" : "bg-red-100 text-red-600"
                      }`}>
                        {formatNepaliCurrency(Math.abs(r.balance))}{" "}
                        {r.balance >= 0 ? "Dr" : "Cr"}
                      </div>
                    </td>

                    {/* ACTION (once per journal) */}
                    {idx === 0 && (
                      <td
                        rowSpan={rowCount}
                        className="px-4 py-4 text-center align-top"
                      >
                        {isPayment && !group.is_reversed ? (
                          <button
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                            title="Reverse Payment"
                            onClick={() => reversePayment(group.payment_id)}
                          >
                            <RotateCcw size={18} />
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-300 font-black tracking-widest">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ));
              })}
            </tbody>

            <tfoot className="bg-gray-900 text-white">
              <tr className="font-black">
                <td colSpan={5} className="px-8 py-5 text-right uppercase text-xs tracking-[0.2em] border-r border-white/10">
                  Outstanding Balance
                </td>
                <td className="px-8 py-5 text-right text-xl tracking-tighter shadow-inner">
                  <span
                    className={
                      outstandingBalance < 0 ? "text-red-400" : "text-green-400"
                    }
                  >
                    {formatNepaliCurrency(Math.abs(outstandingBalance))}{" "}
                    {outstandingBalance < 0 ? "Cr" : "Dr"}
                  </span>
                </td>
                <td className="px-4 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {isPayable && (
          <div className="flex justify-end p-8 bg-gray-50/50 border-t border-gray-100">
            <Button
              className="bg-[#009966] hover:bg-[#008055] text-white rounded-2xl px-8 h-12 shadow-lg shadow-green-100 font-black uppercase tracking-widest text-xs"
              onClick={() => setOpenPayment(true)}
            >
              Add Payment
            </Button>
          </div>
        )}
      </div>

      {/* ================= ACTIONS ================= */}
   

      <PurchasePaymentDrawer
        open={openPayment}
        onClose={() => setOpenPayment(false)}
        purchase={purchase}
        outstandingAmount={Math.abs(outstandingBalance)}
        onSuccess={() => {
          api.get(`/purchases/${purchase.id}`).then(res => setData(res.data));
        }}
      />

      <PurchaseReturnDialog
        open={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        purchase={purchase}
        refresh={() => {
          api.get(`/purchases/${purchase.id}`).then(res => setData(res.data));
        }}
      />

      {reverseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800">
              Reverse Payment
            </h3>

            <p className="text-sm text-gray-500">
              Please provide a reason for reversing this payment.
            </p>

            <textarea
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              placeholder="e.g. Wrong bank selected, duplicate payment..."
              value={reverseReason}
              onChange={(e) => setReverseReason(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setReverseModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={confirmReversePayment}
              >
                Confirm Reverse
              </Button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
  

}

