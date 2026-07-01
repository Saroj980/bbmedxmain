/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { Modal, Select } from "antd";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { generateId } from "@/utils/utils";
import { AlertCircle, AlertTriangle, Info, Package, Minus, Plus } from "lucide-react";

const VAT_RATE = 0.13;

const EMPTY_FORM = {
  product_id: null,
  batch_id: null,
  quantity: 1,
  quantity_unit_id: null,
  base_unit_id: null,
  base_price: 0,
  original_price: 0,
  discount_percent: 0,
  discount_amount: 0,
  vat_included: false,
  hs_code: "",
  mrp: 0,
  base_cost: 0,
  landed_cost: 0,
  retail_margin_pct: 16,
  distributor_margin_pct: 10,
  firm_margin_pct: 7,
  cc_margin_pct: 7,
  distributor_margin_basis: "retail_margin",
  apply_retail_margin: false,
  apply_distributor_margin: false,
  apply_firm_margin: false,
  free_qty: 0,
  pricing_mode: 'FREE',
  cost_plus_percent: 0,
  custom_price: 0,
  include_free_cc: false,
};

export default function SaleItemModal({
  open,
  onClose,
  onSave,
  editItem,
  parentItem,
}: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [marginSettings, setMarginSettings] = useState<any>({
    retail_margin: 16,
    distributor_margin: 0,
    firm_margin: 0,
  });

  const qtyRef = useRef<HTMLInputElement>(null);
  const freeQtyRef = useRef<HTMLInputElement>(null);
  const unitPriceRef = useRef<HTMLInputElement>(null);
  const discountPctRef = useRef<HTMLInputElement>(null);
  const discountAmtRef = useRef<HTMLInputElement>(null);
  const finalPriceRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLInputElement | null> | 'submit') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef === 'submit') {
        handleSave();
      } else {
        nextRef.current?.focus();
        nextRef.current?.select();
      }
    }
  };

  /* ---------------- Load Products ---------------- */
  useEffect(() => {
    api.get("/products", { params: { available_only: 1 } })
      .then(res => setProducts(res.data || []));

    api.get("/margin-settings")
      .then(res => {
        if (res.data) {
          setMarginSettings({
            retail_margin: Number(res.data.retail_margin) || 16,
            distributor_margin: Number(res.data.distributor_margin) || 10,
            firm_margin: Number(res.data.firm_margin) || 7,
            cc_margin: 7, // Default fallback
          });
        }
      })
      .catch(() => {});
  }, []);

  /* ---------------- Reset / Prefill Form ---------------- */
  useEffect(() => {
    if (!open) return;

    if (editItem) {
      setForm({
        ...EMPTY_FORM,
        retail_margin_pct: marginSettings.retail_margin || 16,
        distributor_margin_pct: marginSettings.distributor_margin || 10,
        firm_margin_pct: marginSettings.firm_margin || 7,
        cc_margin_pct: marginSettings.cc_margin || 7,
        distributor_margin_basis: "retail_margin",
                      pricing_mode: "FREE",
        apply_retail_margin: false,
        ...editItem,
      });
    } else if (parentItem) {
      setAvailability(null);
      setForm({
        ...EMPTY_FORM,
        retail_margin_pct: marginSettings.retail_margin || 16,
        distributor_margin_pct: marginSettings.distributor_margin || 10,
        firm_margin_pct: marginSettings.firm_margin || 7,
        cc_margin_pct: marginSettings.cc_margin || 7,
        distributor_margin_basis: "retail_margin",
                      pricing_mode: "FREE",
        apply_retail_margin: false,
        is_bonus_item: true,
        bonus_parent_item_id: parentItem.id,
        quantity: 0,
      });
    } else {
      setAvailability(null);
      setForm({
        ...EMPTY_FORM,
        retail_margin_pct: marginSettings.retail_margin || 16,
        distributor_margin_pct: marginSettings.distributor_margin || 10,
        firm_margin_pct: marginSettings.firm_margin || 7,
        cc_margin_pct: marginSettings.cc_margin || 7,
        distributor_margin_basis: "retail_margin",
                      pricing_mode: "FREE",
        apply_retail_margin: false,
        is_bonus_item: false,
        bonus_parent_item_id: null,
      });
    }
  }, [open, editItem, parentItem, marginSettings]);

  /* ---------------- Fetch Availability ---------------- */
  const fetchAvailability = async (productId: number) => {
    try {
      const res = await api.get(`/products/${productId}/availability`);
      setAvailability(res.data);
      
      if (res.data?.product?.hs_code) {
        setForm((prev: any) => ({
          ...prev,
          hs_code: res.data.product.hs_code
        }));
      }
    } catch {
      setAvailability(null);
    }
  };

  const handleSelectBatch = (b: any) => {
    setForm((prev: any) => {
      const newForm = {
        ...prev,
        batch_id: b.id,
        quantity_unit_id: b.unit_id,
        base_unit_id: b.unit_id,
        hs_code: b.hs_code || "",
        mrp: Number(b.mrp || 0),
        base_cost: Number(b.base_cost || b.cost_price || 0),
        landed_cost: Number(b.landed_cost || b.cost_price || 0),
        retail_margin_pct: marginSettings.retail_margin || 16,
        distributor_margin_pct: marginSettings.distributor_margin || 10,
        firm_margin_pct: marginSettings.firm_margin || 7,
        cc_margin_pct: marginSettings.cc_margin || 7,
        distributor_margin_basis: "retail_margin",
        pricing_mode: "FREE",
        apply_retail_margin: false,
        apply_distributor_margin: false,
        apply_firm_margin: false,
        base_price: Number(b.selling_price),
        original_price: Number(b.selling_price),
        discount_percent: 0,
        discount_amount: 0,
        selling_price: Number(b.selling_price),
        vat_included: b.vat_included ?? false,
        include_free_cc: b.has_carrier_cost ?? false,
      };
      return updatePrices(newForm);
    });
  };

  useEffect(() => {
    if (!open) return;
    if (!form.product_id) return;

    fetchAvailability(form.product_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form.product_id]);

  /* ---------------- Unit Conversion ---------------- */
  const convertPrice = (
    basePrice: number,
    baseUnitId: number,
    targetUnitId: number,
    units: any[]
  ) => {
    if (!basePrice || baseUnitId === targetUnitId) return basePrice;

    const base = units.find(u => u.unit_id === baseUnitId);
    const target = units.find(u => u.unit_id === targetUnitId);
    if (!base || !target) return basePrice;

    let factor = 1;

    if (base.level < target.level) {
      units.forEach((u: any) => {
        if (u.level > base.level && u.level <= target.level) {
          factor *= u.conversion_factor;
        }
      });
      return +(basePrice / factor).toFixed(2);
    }

    if (base.level > target.level) {
      units.forEach((u: any) => {
        if (u.level > target.level && u.level <= base.level) {
          factor *= u.conversion_factor;
        }
      });
      return +(basePrice * factor).toFixed(2);
    }

    return basePrice;
  };

  /* ---------------- Custom Pricing Calculation ---------------- */
  const updatePrices = (currentForm: any) => {
    const mrp = Number(currentForm.mrp || 0);
    const rPct = Number(currentForm.retail_margin_pct ?? 16);
    const dPct = Number(currentForm.distributor_margin_pct ?? 10);
    const fPct = Number(currentForm.firm_margin_pct ?? 7);

    const rmPrice = mrp / (1 + rPct / 100);
    const dmPrice = rmPrice / (1 + dPct / 100);
    const ccaPrice = dmPrice / (1 + fPct / 100);

    const retailAmt = mrp - rmPrice;
    const distAmt = rmPrice - dmPrice;
    const firmAmt = dmPrice - ccaPrice;

    let baseSellingPrice = mrp;
    if (currentForm.apply_retail_margin) baseSellingPrice -= retailAmt;
    if (currentForm.apply_distributor_margin) baseSellingPrice -= distAmt;
    if (currentForm.apply_firm_margin) baseSellingPrice -= firmAmt;

    const originalPrice = baseSellingPrice;
    let finalSellingPrice = originalPrice - (currentForm.discount_amount || 0);

    return {
      ...currentForm,
      original_price: Number(originalPrice.toFixed(2)),
      selling_price: Number(finalSellingPrice.toFixed(2)),
      discount_percent: originalPrice > 0 ? ((currentForm.discount_amount || 0) / originalPrice) * 100 : 0,
    };
  };

  /* ---------------- Computed Margin & Analytical Values ---------------- */
  const mrp = Number(form.mrp || 0);
  const landedCost = Number(form.landed_cost || 0);

  const rPct = Number(form.retail_margin_pct ?? 16);
  const dPct = Number(form.distributor_margin_pct ?? 10);
  const fPct = Number(form.firm_margin_pct ?? 7);
  const ccPct = Number(form.cc_margin_pct ?? 7);

  const rmPrice = mrp / (1 + rPct / 100);
  const dmPrice = rmPrice / (1 + dPct / 100);
  const ccaPrice = dmPrice / (1 + fPct / 100);
  const ccAmount = ccaPrice * (ccPct / 100);

  const retailAmt = mrp - rmPrice;
  const distAmt = rmPrice - dmPrice;
  const firmAmt = dmPrice - ccaPrice;

  const totalMarginAmt = retailAmt + distAmt + firmAmt;
  const totalMarginPct = mrp > 0 ? (totalMarginAmt / mrp) * 100 : 0;
  
  const profitAmt = (form.selling_price || 0) - landedCost;
  const profitPct = landedCost > 0 ? (profitAmt / landedCost) * 100 : 0;

  // Scenarios
  const breakEvenPrice = landedCost;
  const fullMarginPrice = mrp - retailAmt - distAmt - firmAmt;
  const mspNoRetail = mrp - distAmt - firmAmt;
  const mspNoDist = mrp - retailAmt - firmAmt;
  const mspNoFirm = mrp - retailAmt - distAmt;
  const mspNoRetailDist = mrp - firmAmt;
  const mspNoRetailFirm = mrp - distAmt;
  const mspNoDistFirm = mrp - retailAmt;
  const mspNoMargins = mrp;

  /* ---------------- Line Total & Bonus Calculations ---------------- */
  const freeQty = Number(form.free_qty || 0);
  const baseQty = Number(form.quantity || 0);
  const totalOutgoingQty = baseQty + freeQty;

  let bonusRevenue = 0;
  if (form.pricing_mode === 'COST_ONLY' || form.pricing_mode === 'LANDING_COST_ONLY') {
    bonusRevenue = freeQty * landedCost;
  } else if (form.pricing_mode === 'COST_PLUS') {
    const markup = Number(form.cost_plus_percent || 0);
    bonusRevenue = freeQty * (landedCost * (1 + markup / 100));
  } else if (form.pricing_mode === 'MRP') {
    bonusRevenue = freeQty * mrp;
  } else if (form.pricing_mode === 'CUSTOM') {
    bonusRevenue = freeQty * Number(form.custom_price || 0);
  }

  const baseRevenue = baseQty * Number(form.selling_price || 0);
  const totalRevenue = baseRevenue + bonusRevenue;
  
  const cogsAmount = totalOutgoingQty * landedCost;
  const paidCogs = baseQty * landedCost;
  const freeCogs = freeQty * landedCost;

  const totalProfitAmount = totalRevenue - cogsAmount;
  const totalProfitPct = cogsAmount > 0 ? (totalProfitAmount / cogsAmount) * 100 : 0;

  const freeCarrierCost = useMemo(() => {
    if (!form.include_free_cc || freeQty <= 0) return 0;
    const rPct = Number(form.retail_margin_pct ?? 16);
    const dPct = Number(form.distributor_margin_pct ?? 10);
    const A = mrp / (1 + rPct / 100);
    const B = A / (1 + dPct / 100);
    const C = B / 1.07;
    return freeQty * (C * 0.07);
  }, [form.include_free_cc, freeQty, mrp, form.retail_margin_pct, form.distributor_margin_pct]);

  const vatAmount = useMemo(() => {
    return form.vat_included ? (totalRevenue + freeCarrierCost) * VAT_RATE : 0;
  }, [totalRevenue, freeCarrierCost, form.vat_included]);

  const lineTotal = useMemo(() => {
    return totalRevenue + vatAmount + freeCarrierCost;
  }, [totalRevenue, vatAmount, freeCarrierCost]);

  const totalDiscount = (form.discount_amount || 0) * baseQty;

  /* ---------------- Validation & Warnings ---------------- */
  const selectedBatch = availability?.batches?.find((b: any) => b.id === form.batch_id);
  const daysToExpiry = selectedBatch ? dayjs(selectedBatch.expiry_date).diff(dayjs(), 'day') : null;
  const isNearExpiry = daysToExpiry !== null && daysToExpiry < 180;
  
  const isSellingBelowCost = form.selling_price < landedCost && form.selling_price > 0;
  const isLowMargin = totalProfitPct > 0 && totalProfitPct < 5;
  const isBonusReducingProfit = totalProfitAmount < 0;

  /* ---------------- Save ---------------- */
  const handleSave = () => {
    const product = products.find(p => p.id === form.product_id);
    const unit = availability?.units?.find(
      (u: any) => u.unit_id === form.quantity_unit_id
    );
    const batch = availability?.batches?.find(
      (b: any) => b.id === form.batch_id
    );

    onSave({
      ...form,
      id: editItem?.id || generateId(),
      product_name: product?.name,
      unit_name: unit?.unit_name,
      batch_no: batch?.batch_no,
      charged_qty: baseQty,
      free_qty: freeQty,
      pricing_mode: form.pricing_mode,
      cost_plus_percent: form.cost_plus_percent,
      batch_unit_cost: landedCost,
      cogs_amount: cogsAmount,
      profit_amount: totalProfitAmount,
      inventory_value: totalRevenue + freeCarrierCost,
      free_carrier_cost: freeCarrierCost,
      profit_margin: totalMarginPct,
      is_bonus_item: form.is_bonus_item || false,
      bonus_parent_item_id: form.bonus_parent_item_id || null,
    });

    onClose();
  };

  return (
    <Modal
      open={open}
      title={<span className="text-xl font-bold text-gray-800 tracking-tight">Add Sale Item</span>}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={1000}
      style={{ top: 20 }}
      className="sale-item-modal"
    >
      <div className="space-y-6 pt-2">
        {/* ======================================== */}
        {/* SECTION 1: PRODUCT & BATCH             */}
        {/* ======================================== */}
        <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm">1</div>
            <h3 className="font-bold text-gray-800 tracking-tight text-[15px]">Product & Batch</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
             <div className="md:col-span-8">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product</label>
              <Select
                showSearch
                className="w-full mt-1.5"
                placeholder="Search product..."
                value={form.product_id ?? undefined}
                onChange={v => {
                  setAvailability(null);
                  setForm({ ...EMPTY_FORM, ...form, product_id: v });
                }}
                options={products.map(p => ({
                  value: p.id,
                  label: p.name,
                }))}
              />
            </div>

            <div className="md:col-span-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">HS Code (Optional)</label>
              <Input
                className="mt-1.5 h-9 bg-gray-50/50"
                placeholder="Enter HS Code"
                value={form.hs_code ?? ""}
                onChange={e => setForm({ ...form, hs_code: e.target.value })}
              />
            </div>

            {availability && availability.batches && availability.batches.length > 0 && (
              <div className="md:col-span-12 mt-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 block">
                  Select Batch (FEFO Ordered)
                </label>
                <div className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold">
                        <th className="p-3 pl-4">Batch Number</th>
                        <th className="p-3">Expiry Date</th>
                        <th className="p-3 text-right">Regular Stock</th>
                        <th className="p-3 text-right">Free Stock</th>
                        <th className="p-3 text-right font-black">Total Stock</th>
                        <th className="p-3 text-center">Status / Selection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {availability.batches.map((b: any) => {
                        const isSelected = form.batch_id === b.id;
                        const isExpired = b.expired;
                        const expiryDateStr = b.expiry_date && dayjs(b.expiry_date).isValid()
                          ? dayjs(b.expiry_date).format("YYYY-MM-DD")
                          : "No Expiry";
                        
                        // Find unit name
                        const uName = availability.units?.find((u: any) => u.unit_id === b.unit_id)?.unit_name || "Units";

                        return (
                          <tr
                            key={b.id}
                            onClick={() => {
                              if (isExpired || b.current_stock <= 0) return;
                              handleSelectBatch(b);
                            }}
                            className={`transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? "bg-emerald-50/50 hover:bg-emerald-50/70"
                                : isExpired || b.current_stock <= 0
                                ? "opacity-50 cursor-not-allowed bg-slate-50/30"
                                : "hover:bg-slate-50/60"
                            }`}
                          >
                            <td className="p-3 pl-4 font-bold text-slate-800">{b.batch_no}</td>
                            <td className="p-3">
                              {isExpired ? (
                                <span className="text-red-600 font-bold flex items-center gap-1">
                                  ⚠️ Expired ({expiryDateStr})
                                </span>
                              ) : (
                                <span className="text-slate-600 font-medium">{expiryDateStr}</span>
                              )}
                            </td>
                            <td className="p-3 text-right text-slate-600 font-medium">
                              {b.regular_stock || 0} {uName}
                            </td>
                            <td className="p-3 text-right text-slate-600 font-medium">
                              {b.free_stock || 0} {uName}
                            </td>
                            <td className="p-3 text-right text-slate-900 font-bold">
                              {b.current_stock} {uName}
                            </td>
                            <td className="p-3 text-center">
                              {isSelected ? (
                                <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                                  Selected
                                </span>
                              ) : isExpired ? (
                                <span className="text-red-500 text-[10px] font-bold">Unavailable</span>
                              ) : (
                                <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 hover:text-emerald-700 transition-colors text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                                  Select Batch
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================== */}
        {/* SECTION 2: PRICING & MARGIN ENGINE       */}
        {/* ======================================== */}
        <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm">2</div>
              <h3 className="font-bold text-gray-800 tracking-tight text-[15px]">Pricing & Margin Engine</h3>
            </div>
          </div>

          {/* Warnings Bar */}
          {(isSellingBelowCost || isLowMargin || isNearExpiry || (freeQty > 0 && isBonusReducingProfit)) && (
            <div className="flex flex-col gap-2">
              {isSellingBelowCost && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold">
                  <AlertCircle size={14} /> Selling Below Cost! (Selling Price &lt; Batch Unit Cost)
                </div>
              )}
              {isLowMargin && !isSellingBelowCost && !isBonusReducingProfit && (
                <div className="bg-orange-50 border border-orange-200 text-orange-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold">
                  <AlertTriangle size={14} /> Low Margin Warning: Profit is below 5%.
                </div>
              )}
              {isNearExpiry && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold">
                  <Info size={14} /> Batch is nearing expiry ({daysToExpiry} days remaining).
                </div>
              )}
              {freeQty > 0 && isBonusReducingProfit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold">
                  <AlertTriangle size={14} /> Free Qty Causing Loss!
                </div>
              )}
            </div>
          )}

          {/* Core Prices */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Commented out Landed Cost card as requested
            <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Landed Cost</label>
              <div className="text-xl font-bold text-gray-800 mt-1">{formatNepaliCurrency(landedCost)}</div>
            </div>
            */}
            <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">MRP</label>
              <div className="text-xl font-bold text-gray-800 mt-1">{formatNepaliCurrency(mrp)}</div>
            </div>
          </div>

          {/* Interactive Sales Target Tier Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Select Sales Target Tier</label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              
              {/* Consumer Tier */}
              <div 
                onClick={() => setForm(updatePrices({
                  ...form,
                  apply_retail_margin: false,
                  apply_distributor_margin: false,
                  apply_firm_margin: false
                }))}
                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between h-36 ${
                  !form.apply_retail_margin && !form.apply_distributor_margin && !form.apply_firm_margin
                    ? "border-emerald-500 bg-emerald-50/20 shadow-sm"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    !form.apply_retail_margin && !form.apply_distributor_margin && !form.apply_firm_margin
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-600"
                  }`}>Consumer</span>
                  <p className="text-[11px] font-medium text-gray-400 mt-2">Full retail price (no margins deducted)</p>
                </div>
                <div className="text-lg font-black text-gray-800">
                  {formatNepaliCurrency(mrp)}
                </div>
              </div>

              {/* Retailer Tier */}
              <div 
                onClick={() => setForm(updatePrices({
                  ...form,
                  apply_retail_margin: true,
                  apply_distributor_margin: false,
                  apply_firm_margin: false
                }))}
                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between h-36 ${
                  form.apply_retail_margin && !form.apply_distributor_margin && !form.apply_firm_margin
                    ? "border-emerald-500 bg-emerald-50/20 shadow-sm"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    form.apply_retail_margin && !form.apply_distributor_margin && !form.apply_firm_margin
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-600"
                  }`}>Retailer</span>
                  <p className="text-[11px] font-medium text-gray-400 mt-2">Deducts {form.retail_margin_pct ?? 16}% Retail Margin (-{formatNepaliCurrency(retailAmt)})</p>
                </div>
                <div className="text-lg font-black text-gray-800">
                  {formatNepaliCurrency(rmPrice)}
                </div>
              </div>

              {/* Distributor Tier */}
              <div 
                onClick={() => setForm(updatePrices({
                  ...form,
                  apply_retail_margin: true,
                  apply_distributor_margin: true,
                  apply_firm_margin: false
                }))}
                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between h-36 ${
                  form.apply_retail_margin && form.apply_distributor_margin && !form.apply_firm_margin
                    ? "border-emerald-500 bg-emerald-50/20 shadow-sm"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    form.apply_retail_margin && form.apply_distributor_margin && !form.apply_firm_margin
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-600"
                  }`}>Distributor</span>
                  <p className="text-[11px] font-medium text-gray-400 mt-2">Deducts {form.retail_margin_pct ?? 16}% RM + {form.distributor_margin_pct ?? 10}% DM (-{formatNepaliCurrency(retailAmt + distAmt)})</p>
                </div>
                <div className="text-lg font-black text-gray-800">
                  {formatNepaliCurrency(dmPrice)}
                </div>
              </div>

              {/* Hospital / Firm Tier */}
              <div 
                onClick={() => setForm(updatePrices({
                  ...form,
                  apply_retail_margin: true,
                  apply_distributor_margin: true,
                  apply_firm_margin: true
                }))}
                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between h-36 ${
                  form.apply_retail_margin && form.apply_distributor_margin && form.apply_firm_margin
                    ? "border-emerald-500 bg-emerald-50/20 shadow-sm"
                    : "border-gray-100 hover:border-gray-200 bg-white"
                }`}
              >
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    form.apply_retail_margin && form.apply_distributor_margin && form.apply_firm_margin
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-600"
                  }`}>Firm / CCA</span>
                  <p className="text-[11px] font-medium text-gray-400 mt-2">Deducts {form.retail_margin_pct ?? 16}% RM + {form.distributor_margin_pct ?? 10}% DM + {form.firm_margin_pct ?? 7}% Firm (-{formatNepaliCurrency(retailAmt + distAmt + firmAmt)})</p>
                </div>
                <div className="text-lg font-black text-gray-800">
                  {formatNepaliCurrency(ccaPrice)}
                </div>
              </div>

              {/* Fallback Custom Card if state doesn't match standard tiers */}
              {!((!form.apply_retail_margin && !form.apply_distributor_margin && !form.apply_firm_margin) ||
                 (form.apply_retail_margin && !form.apply_distributor_margin && !form.apply_firm_margin) ||
                 (form.apply_retail_margin && form.apply_distributor_margin && !form.apply_firm_margin) ||
                 (form.apply_retail_margin && form.apply_distributor_margin && form.apply_firm_margin)) && (
                <div className="border-2 border-amber-500 bg-amber-50/10 rounded-2xl p-4 flex flex-col justify-between h-36">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-100 text-amber-800">Custom Tier</span>
                    <p className="text-[11px] font-medium text-gray-400 mt-2">Custom margin selection active</p>
                  </div>
                  <div className="text-lg font-black text-gray-800">
                    {formatNepaliCurrency(form.original_price)}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Detailed Margin Mathematical Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Retail Card */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4">
              <div>
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block mb-2.5">
                  Retail Level
                </span>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Retail Margin (RM)
                </label>
                <div className="relative flex items-center max-w-[120px]">
                  <input
                    type="number"
                    value={form.retail_margin_pct ?? 16}
                    onChange={e => setForm(updatePrices({ ...form, retail_margin_pct: Number(e.target.value) }))}
                    className="w-full h-9 pl-3 pr-8 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                  <span className="absolute right-3 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Margin Amount</span>
                <span className="text-base font-extrabold text-orange-600">
                  {formatNepaliCurrency(retailAmt)}
                </span>
              </div>
            </div>

            {/* Distributor Card */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4">
              <div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2.5">
                  Distributor Level
                </span>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Distributor Margin (DM)
                </label>
                <div className="relative flex items-center max-w-[120px]">
                  <input
                    type="number"
                    value={form.distributor_margin_pct ?? 10}
                    onChange={e => setForm(updatePrices({ ...form, distributor_margin_pct: Number(e.target.value) }))}
                    className="w-full h-9 pl-3 pr-8 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <span className="absolute right-3 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Margin Amount</span>
                <span className="text-base font-extrabold text-blue-600">
                  {formatNepaliCurrency(distAmt)}
                </span>
              </div>
            </div>

            {/* Firm Card */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4">
              <div>
                <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest block mb-2.5">
                  Firm Level
                </span>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Firm Margin (CCA)
                </label>
                <div className="relative flex items-center max-w-[120px]">
                  <input
                    type="number"
                    value={form.firm_margin_pct ?? 7}
                    onChange={e => setForm(updatePrices({ ...form, firm_margin_pct: Number(e.target.value) }))}
                    className="w-full h-9 pl-3 pr-8 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                  <span className="absolute right-3 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Margin Amount</span>
                <span className="text-base font-extrabold text-purple-600">
                  {formatNepaliCurrency(firmAmt)}
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center bg-gray-50/50">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">Selling Price</span>
              <span className="text-lg font-black text-emerald-600">{formatNepaliCurrency(form.original_price)}</span>
            </div>
            <div className="border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center bg-gray-50/50">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-center">Total Margin Deducted</span>
              <span className="text-lg font-bold text-gray-800">{formatNepaliCurrency(Math.max(0, mrp - form.original_price))}</span>
            </div>
          </div>
        </div>

        {/* ======================================== */}
        {/* SECTION 3: SALE DETAILS & SUMMARY        */}
        {/* ======================================== */}
        <div className="space-y-5">
          <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm">3</div>
              <h3 className="font-bold text-gray-800 tracking-tight text-[15px]">Sale Details & Summary</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Quantity</label>
                <div className={`flex items-center border border-slate-200 rounded-xl overflow-hidden h-10 w-full focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all bg-white ${form.is_bonus_item ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button 
                    type="button"
                    className="w-10 h-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors border-r border-slate-200/60"
                    onClick={() => setForm({ ...form, quantity: Math.max(1, (form.quantity || 1) - 1) })}
                    disabled={form.is_bonus_item}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    ref={qtyRef}
                    type="number"
                    min={1}
                    className="w-full flex-1 h-full text-center text-sm font-extrabold text-slate-800 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={form.quantity ?? 1}
                    onChange={e => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })}
                    disabled={form.is_bonus_item}
                    onKeyDown={e => handleKeyDown(e, freeQtyRef)}
                  />
                  <button 
                    type="button"
                    className="w-10 h-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors border-l border-slate-200/60"
                    onClick={() => setForm({ ...form, quantity: (form.quantity || 1) + 1 })}
                    disabled={form.is_bonus_item}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Free Qty</label>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden h-10 w-full focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all bg-white">
                  <button 
                    type="button"
                    className="w-10 h-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors border-r border-slate-200/60"
                    onClick={() => setForm({ ...form, free_qty: Math.max(0, (form.free_qty || 0) - 1) })}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    ref={freeQtyRef}
                    type="number"
                    min={0}
                    className="w-full flex-1 h-full text-center text-sm font-extrabold text-slate-800 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={form.free_qty ?? 0}
                    onChange={e => setForm({ ...form, free_qty: Math.max(0, Number(e.target.value)) })}
                    onKeyDown={e => handleKeyDown(e, unitPriceRef)}
                  />
                  <button 
                    type="button"
                    className="w-10 h-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors border-l border-slate-200/60"
                    onClick={() => setForm({ ...form, free_qty: (form.free_qty || 0) + 1 })}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {freeQty > 0 && (
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer select-none mt-2">
                    <input
                      type="checkbox"
                      checked={!!form.include_free_cc}
                      onChange={e => setForm({ ...form, include_free_cc: e.target.checked })}
                      className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
                    />
                    Includes Carrier Cost (CC)
                  </label>
                )}
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Unit</label>
                <Select
                  className="w-full h-10 custom-select"
                  value={form.quantity_unit_id ?? undefined}
                  onChange={u => {
                    if (!availability?.units) return;
                    const price = convertPrice(form.base_price, form.base_unit_id, u, availability.units);
                    setForm(updatePrices({ ...form, quantity_unit_id: u, base_price: price }));
                  }}
                  options={(availability?.units || []).map((u: any) => ({
                    value: u.unit_id,
                    label: u.unit_name,
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Unit Price (Before Discount)</label>
                <input 
                  ref={unitPriceRef}
                  type="number" 
                  className="w-full h-10 px-3 text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  value={form.original_price ?? 0} 
                  onChange={e => {
                    const newPrice = Number(e.target.value);
                    const discountAmt = form.discount_amount || 0;
                    const sellingPrice = newPrice - discountAmt;
                    const pct = newPrice > 0 ? (discountAmt / newPrice) * 100 : 0;
                    setForm({ ...form, original_price: newPrice, selling_price: sellingPrice, discount_percent: pct });
                  }}
                  onKeyDown={e => handleKeyDown(e, discountPctRef)}
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Discount %</label>
                <div className="relative flex items-center w-full">
                  <input
                    ref={discountPctRef}
                    type="number" 
                    min={0} 
                    max={100} 
                    className="w-full h-10 pl-3 pr-8 text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={form.discount_percent ?? 0}
                    onChange={e => {
                      const pct = Number(e.target.value);
                      const amt = (form.original_price * pct) / 100;
                      setForm({ ...form, discount_percent: pct, discount_amount: amt, selling_price: form.original_price - amt });
                    }}
                    onKeyDown={e => handleKeyDown(e, discountAmtRef)}
                  />
                  <span className="absolute right-3 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Discount Amount</label>
                <input
                  ref={discountAmtRef}
                  type="number" 
                  min={0} 
                  className="w-full h-10 px-3 text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={form.discount_amount ?? 0}
                  onChange={e => {
                    const amt = Number(e.target.value);
                    const pct = form.original_price > 0 ? (amt / form.original_price) * 100 : 0;
                    setForm({ ...form, discount_amount: amt, discount_percent: pct, selling_price: form.original_price - amt });
                  }}
                  onKeyDown={e => handleKeyDown(e, finalPriceRef)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50/70 border border-slate-200/50 rounded-2xl p-4 gap-4 w-full">
              <div className="flex flex-col flex-1 max-w-[240px]">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Final Selling Price (Per Unit)</label>
                <div className="relative flex items-center w-full">
                  <span className="absolute left-3.5 text-sm font-extrabold text-emerald-600">रु</span>
                  <input
                    ref={finalPriceRef}
                    type="number"
                    className="w-full h-10 pl-8 pr-3 text-base font-extrabold text-emerald-600 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={form.selling_price ?? 0}
                    onKeyDown={e => handleKeyDown(e, 'submit')}
                    onChange={e => {
                      const finalPrice = Number(e.target.value);
                      const orig = form.original_price || 0;
                      const discountAmt = Math.max(0, orig - finalPrice);
                      const pct = orig > 0 ? (discountAmt / orig) * 100 : 0;
                      
                      if (finalPrice > orig) {
                         // If they increase final price above unit price, update unit price instead
                         setForm({ ...form, original_price: finalPrice, selling_price: finalPrice, discount_amount: 0, discount_percent: 0 });
                      } else {
                         setForm({ ...form, selling_price: finalPrice, discount_amount: discountAmt, discount_percent: pct });
                      }
                    }}
                  />
                </div>
              </div>
              
              <label className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm select-none mt-5">
                <input
                  type="checkbox"
                  checked={form.vat_included}
                  onChange={e => setForm({ ...form, vat_included: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                VAT Included (13%)
              </label>
            </div>
          </div>

          {/* Line Summary (Standard Level Dashboard Layout) */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start shadow-sm">
            {/* Column 1: Quantities & Sales Value */}
            <div className="bg-white/40 p-4 rounded-xl border border-emerald-100/50 space-y-3">
              <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest border-b border-emerald-100/50 pb-1.5">Quantities & Sales Value</h4>
              <div className="space-y-2 text-xs font-semibold text-emerald-950">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Sold Items</span>
                  <span className="font-bold text-gray-800">{baseQty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Free Items</span>
                  <span className="font-bold text-gray-800">{freeQty}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-emerald-200/30">
                  <span className="text-emerald-800 font-bold uppercase tracking-wider text-[10px]">Total Items Out</span>
                  <span className="font-black text-emerald-700">{totalOutgoingQty}</span>
                </div>
                <div className="border-t border-emerald-200/30 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Sales Value</span>
                  <span className="font-bold text-gray-800">{formatNepaliCurrency(totalRevenue)}</span>
                </div>
                {freeQty > 0 && (
                  <div className="pl-3 space-y-1 border-l border-emerald-150/70 ml-1 text-[10px] text-gray-400">
                    <div className="flex justify-between">
                      <span>Value of Sold Items ({baseQty}):</span>
                      <span>{formatNepaliCurrency(baseRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Value of Free Items ({freeQty}):</span>
                      <span>{formatNepaliCurrency(bonusRevenue)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Net Receivable & Receipt Details */}
            <div className="bg-white/40 p-4 rounded-xl border border-emerald-100/50 space-y-3">
              <div className="flex items-start gap-3 border-b border-emerald-200/50 pb-2">
                <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>
                </div>
                <div>
                  <span className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest block">Net Receivable Amt</span>
                  <span className="text-xl font-black text-emerald-700">{formatNepaliCurrency(lineTotal)}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs font-semibold text-emerald-950">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Total Items</span>
                  <span className="font-bold text-gray-800">{totalOutgoingQty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Free Items</span>
                  <span className="font-bold text-gray-800">{freeQty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Selling Price (Per Unit)</span>
                  <span className="font-bold text-gray-800">{formatNepaliCurrency(form.selling_price)}</span>
                </div>
                {form.include_free_cc && freeCarrierCost > 0 && (
                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="font-medium">Carrier Cost (Free Items)</span>
                    <span className="font-bold">{formatNepaliCurrency(freeCarrierCost)}</span>
                  </div>
                )}
                {form.vat_included && (
                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="font-medium">13% VAT Included</span>
                    <span className="font-bold">{formatNepaliCurrency(vatAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-emerald-200/30">
                  <span className="text-gray-500 font-medium">Total Retail Margin %</span>
                  <span className="font-bold text-gray-800">{totalMarginPct.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================== */}
        {/* FOOTER                                   */}
        {/* ======================================== */}
        <div className="flex justify-end gap-3 pt-6 pb-2">
          <Button variant="outline" className="h-10 px-6 font-bold" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="h-10 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            onClick={handleSave}
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            Save Item
          </Button>
        </div>
      </div>
    </Modal>
  );
}
