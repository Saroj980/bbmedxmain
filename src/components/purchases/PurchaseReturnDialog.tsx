/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { X, Calendar, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import dayjs from "dayjs";
import NepaliBsDatePicker from "@/components/common/NepaliBsDatePicker";
import NepaliDate from "nepali-date";

export default function PurchaseReturnDialog({
  open,
  onClose,
  purchase,
  refresh,
}: any) {
  const [loading, setLoading] = useState(false);
  const [returnDate, setReturnDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [bsDate, setBsDate] = useState(() => new NepaliDate(new Date()).format("YYYY-MM-DD"));
  const [remarks, setRemarks] = useState("");
  
  // Track quantities to return per purchaseItem id
  const [returnQtys, setReturnQtys] = useState<Record<number, string>>({});

  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [accountId, setAccountId] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      api.get("/accounts", { params: { can_make_payment: 1, active: 1 } })
        .then((res) => {
          setAccounts(res.data || []);
          if (res.data && res.data.length > 0) {
            setAccountId(res.data[0].id.toString());
          }
        })
        .catch(err => console.error("Failed to load accounts", err));
    }
  }, [open]);

  useEffect(() => {
    if (!accountId) {
      setBalance(null);
      return;
    }
    api.get(`/accounts/${accountId}/balance`)
      .then((res) => setBalance(res.data.balance))
      .catch(() => setBalance(null));
  }, [accountId]);

  const items = purchase?.items || [];

  // Dynamic Refund Calculation
  const refundSummary = (() => {
    let gross = 0;
    let vat = 0;
    let discount = 0;

    items.forEach((item: any) => {
      const regularBase = Number(item.quantity || 0);
      const freeBase = Number(item.free_qty || 0);
      const totalBase = regularBase + freeBase;

      const displayQty = Number(item.unit_breakdown?.[0]?.qty ?? regularBase);
      const factor = displayQty > 0 ? (regularBase / displayQty) : 1;

      const enteredVal = parseFloat(returnQtys[item.id] || "0");
      if (enteredVal > 0 && totalBase > 0) {
        const totalDisplay = totalBase / factor;
        const regularDisplay = regularBase / factor;

        const regRatio = regularDisplay / totalDisplay;
        const splitRegular = Math.round(enteredVal * regRatio);

        const itemGross = splitRegular * Number(item.cost_price || 0);
        gross += itemGross;
        
        if (regularDisplay > 0) {
          vat += (splitRegular / regularDisplay) * Number(item.vat_amount || 0);
        }

        const purchaseGross = Number(purchase.gross_amount || 0) > 0 ? Number(purchase.gross_amount || 0) : 1;
        discount += (itemGross / purchaseGross) * Number(purchase.discount_amount || 0);
      }
    });

    const netRefund = Math.max(0, gross + vat - discount);
    return {
      gross,
      vat,
      discount,
      netRefund
    };
  })();

  useEffect(() => {
    if (paymentMethod !== "credit") {
      setPaidAmount(refundSummary.netRefund.toFixed(2));
    } else {
      setPaidAmount("");
    }
  }, [paymentMethod, refundSummary.netRefund]);

  if (!open || !purchase) return null;

  const handleQtyChange = (itemId: number, val: string) => {
    const originalItem = items.find((i: any) => i.id === itemId);
    if (originalItem) {
      const regularBase = Number(originalItem.quantity || 0);
      const freeBase = Number(originalItem.free_qty || 0);
      const totalBase = regularBase + freeBase;
      
      const returnedRegularBase = Number(originalItem.returned_qty || 0);
      const returnedFreeBase = Number(originalItem.free_returned_qty || 0);
      const returnedTotalBase = returnedRegularBase + returnedFreeBase;

      const displayQty = Number(originalItem.unit_breakdown?.[0]?.qty ?? regularBase);
      const factor = displayQty > 0 ? (regularBase / displayQty) : 1;

      const totalDisplay = totalBase / factor;
      const returnedDisplay = returnedTotalBase / factor;
      const remainingDisplay = Math.max(0, totalDisplay - returnedDisplay);

      const enteredVal = parseFloat(val);
      if (enteredVal > remainingDisplay) {
        toast.warning(`Quantity capped at maximum remaining: ${remainingDisplay.toFixed(2)}`);
        setReturnQtys((prev) => ({
          ...prev,
          [itemId]: remainingDisplay.toString(),
        }));
        return;
      }
    }

    setReturnQtys((prev) => ({
      ...prev,
      [itemId]: val,
    }));
  };

  const handleSubmit = async () => {
    // Collect active items to return
    const returnItemsPayload = Object.entries(returnQtys)
      .map(([idStr, qtyStr]) => {
        const purchase_item_id = Number(idStr);
        const quantity = parseFloat(qtyStr);
        return { purchase_item_id, quantity };
      })
      .filter((item) => !isNaN(item.quantity) && item.quantity > 0);

    if (returnItemsPayload.length === 0) {
      toast.error("Please enter a return quantity for at least one item.");
      return;
    }

    // Validate quantities do not exceed remaining
    for (const payloadItem of returnItemsPayload) {
      const originalItem = items.find((i: any) => i.id === payloadItem.purchase_item_id);
      if (originalItem) {
        const regularBase = Number(originalItem.quantity || 0);
        const freeBase = Number(originalItem.free_qty || 0);
        const totalBase = regularBase + freeBase;
        
        const returnedRegularBase = Number(originalItem.returned_qty || 0);
        const returnedFreeBase = Number(originalItem.free_returned_qty || 0);
        const returnedTotalBase = returnedRegularBase + returnedFreeBase;

        const displayQty = Number(originalItem.unit_breakdown?.[0]?.qty ?? regularBase);
        const factor = displayQty > 0 ? (regularBase / displayQty) : 1;

        const totalDisplay = totalBase / factor;
        const returnedDisplay = returnedTotalBase / factor;
        const remainingDisplay = Math.max(0, totalDisplay - returnedDisplay);

        if (payloadItem.quantity > remainingDisplay) {
          toast.error(`Return quantity for ${originalItem.product?.name} cannot exceed remaining quantity of ${remainingDisplay.toFixed(2)}.`);
          return;
        }
      }
    }

    if (paymentMethod !== "credit") {
      if (!accountId) {
        toast.error("Please select a Cash/Bank account.");
        return;
      }
      const paid = parseFloat(paidAmount || "0");
      if (isNaN(paid) || paid < 0) {
        toast.error("Please enter a valid refund amount.");
        return;
      }
      if (paid > refundSummary.netRefund) {
        toast.error(`Refund amount cannot exceed total return amount of ${refundSummary.netRefund.toFixed(2)}.`);
        return;
      }
    }

    setLoading(true);
    try {
      await api.post("/purchase-returns", {
        purchase_id: purchase.id,
        return_date: returnDate,
        remarks,
        payment_method: paymentMethod,
        account_id: paymentMethod !== "credit" ? Number(accountId) : null,
        paid_amount: paymentMethod !== "credit" ? parseFloat(paidAmount || "0") : 0,
        items: returnItemsPayload,
      });

      toast.success("Purchase Return (Debit Note) created successfully.");
      setReturnQtys({});
      setRemarks("");
      refresh();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create purchase return.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside 
        className="fixed right-0 top-0 bottom-0 w-full max-w-[700px] bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        style={{ fontFamily: "var(--font-outfit), sans-serif" }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
              Create Purchase Return
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Invoice No: <span className="font-bold text-[#009966]">{purchase.invoice_no}</span> ({purchase.supplier?.name})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all border-none bg-transparent cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                Return Date (A.D.)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => {
                    const adVal = e.target.value;
                    setReturnDate(adVal);
                    if (adVal) {
                      setBsDate(new NepaliDate(new Date(adVal)).format("YYYY-MM-DD"));
                    }
                  }}
                  className="pl-9 rounded-xl border-gray-200 focus-visible:border-[#009966] focus-visible:ring-[1px] focus-visible:ring-[#009966]/30"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                Return Date (B.S.)
              </label>
              <NepaliBsDatePicker
                value={bsDate}
                onChange={(adDate) => {
                  if (adDate) {
                    setReturnDate(adDate);
                    setBsDate(new NepaliDate(new Date(adDate)).format("YYYY-MM-DD"));
                  } else {
                    setReturnDate("");
                    setBsDate("");
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
              Remarks / Reason
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Reason for return..."
                rows={3}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:border-[#009966] focus:ring-0 focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {/* Items Selector */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
              <AlertCircle size={14} className="text-orange-500" />
              Select Items to Return
            </h4>

            <div className="space-y-3">
              {items.map((item: any) => {
                const regularBase = Number(item.quantity || 0);
                const freeBase = Number(item.free_qty || 0);
                const totalBase = regularBase + freeBase;
                
                const returnedRegularBase = Number(item.returned_qty || 0);
                const returnedFreeBase = Number(item.free_returned_qty || 0);
                const returnedTotalBase = returnedRegularBase + returnedFreeBase;

                const displayQty = Number(item.unit_breakdown?.[0]?.qty ?? regularBase);
                const factor = displayQty > 0 ? (regularBase / displayQty) : 1;

                const totalDisplay = totalBase / factor;
                const returnedDisplay = returnedTotalBase / factor;
                const remainingDisplay = Math.max(0, totalDisplay - returnedDisplay);

                const unitName = item.unit?.name || "Unit";

                // Ratio calculation display
                const enteredVal = parseFloat(returnQtys[item.id] || "0");
                let splitRegular = 0;
                let splitFree = 0;
                if (enteredVal > 0 && totalBase > 0) {
                  const regRatio = regularBase / totalBase;
                  splitRegular = Math.round(enteredVal * regRatio);
                  splitFree = enteredVal - splitRegular;
                }

                return (
                  <div 
                    key={item.id} 
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors space-y-3"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="font-black text-gray-900 text-sm block">
                          {item.product?.name}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">
                          Batch: {item.batch?.batch_no || "—"} | Exp: {item.batch?.expiry_date ? dayjs(item.batch.expiry_date).format("YYYY MMM") : "—"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-500 block">
                          Rate: {item.cost_price}
                        </span>
                      </div>
                    </div>

                    {/* Stock overview */}
                    <div className="grid grid-cols-3 gap-2 bg-white border border-gray-100 p-2.5 rounded-xl text-center text-[10px]">
                      <div>
                        <span className="text-gray-400 block font-semibold uppercase">Purchased</span>
                        <span className="font-bold text-gray-900">
                          {totalDisplay.toFixed(2)} {unitName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-semibold uppercase">Returned</span>
                        <span className="font-bold text-orange-600">
                          {returnedDisplay.toFixed(2)} {unitName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-semibold uppercase">Remaining</span>
                        <span className="font-bold text-[#009966]">
                          {remainingDisplay.toFixed(2)} {unitName}
                        </span>
                      </div>
                    </div>

                    {/* Return Qty Input */}
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                          Return Quantity ({unitName})
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max={remainingDisplay}
                          step="any"
                          placeholder={`Max ${remainingDisplay.toFixed(2)}`}
                          value={returnQtys[item.id] || ""}
                          onChange={(e) => handleQtyChange(item.id, e.target.value)}
                          className="rounded-xl border-gray-200 focus-visible:border-[#009966] focus-visible:ring-[1px] focus-visible:ring-[#009966]/30"
                        />
                      </div>
                    </div>

                    {/* Real-time Ratio split preview */}
                    {enteredVal > 0 && (
                      <div className="bg-emerald-50/50 border border-emerald-100/50 p-2.5 rounded-xl flex items-center gap-2 text-[11px] text-emerald-800">
                        <RefreshCw size={12} className="animate-spin text-[#009966]" />
                        <span>
                          Ratio Split: <strong>{splitRegular} Regular</strong> &amp; <strong>{splitFree} Free</strong> items returned to stock.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Refund Summary and Payment Section */}
          {refundSummary.netRefund > 0 && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-4">
              <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                Refund Calculation &amp; Payment Options
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-500">Gross Return:</div>
                <div className="text-right font-semibold">Rs. {refundSummary.gross.toFixed(2)}</div>
                
                <div className="text-gray-500">VAT Return:</div>
                <div className="text-right font-semibold">Rs. {refundSummary.vat.toFixed(2)}</div>
                
                <div className="text-gray-500">Discount Reversal:</div>
                <div className="text-right font-semibold text-red-600">Rs. {refundSummary.discount.toFixed(2)}</div>
                
                <div className="text-gray-500 font-bold border-t border-gray-200 pt-2 text-sm text-gray-800">Net Refund:</div>
                <div className="text-right font-black border-t border-gray-200 pt-2 text-sm text-[#009966]">
                  Rs. {refundSummary.netRefund.toFixed(2)}
                </div>
              </div>

              <div className="border-t border-gray-200/60 my-2" />

              {/* Payment Option Selection */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                    Refund / Payment Option
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("credit")}
                      className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        paymentMethod === "credit"
                          ? "bg-emerald-50 border-[#009966] text-[#009966]"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Adjust Supplier Balance (Debit Note)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        paymentMethod === "cash"
                          ? "bg-emerald-50 border-[#009966] text-[#009966]"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Direct Cash/Bank Refund
                    </button>
                  </div>
                </div>

                {paymentMethod !== "credit" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                        Refunded To Account
                      </label>
                      <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full text-xs font-semibold bg-white rounded-xl border border-gray-200 p-2.5 h-10 focus:border-[#009966] focus:ring-0 focus:outline-none"
                      >
                        <option value="">Select Account</option>
                        {accounts.map((acc: any) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name}
                          </option>
                        ))}
                      </select>
                      {balance !== null && (
                        <div className="mt-1 flex justify-between items-center px-1">
                          <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Available Balance:</span>
                          <span className="text-xs font-black text-green-600">
                            Rs. {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1">
                        Refunded Amount
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max={refundSummary.netRefund}
                        step="any"
                        placeholder="Amount"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        className="rounded-xl border-gray-200 focus-visible:border-[#009966] focus-visible:ring-[1px] focus-visible:ring-[#009966]/30 h-10"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <Button variant="outline" onClick={onClose} className="rounded-xl font-bold px-6">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#009966] hover:bg-[#008055] text-white rounded-xl font-bold px-8 shadow-md shadow-green-100"
          >
            {loading ? "Submitting..." : "Submit Return"}
          </Button>
        </div>
      </aside>
    </>
  );
}
