/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Checkbox, DatePicker, Modal, Select, TreeSelect } from "antd";
import dayjs from "dayjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { formatDate, generateId } from "@/utils/utils";
import ProductFormContent from "@/components/products/ProductForm";
import { resolveExpiryDate } from "@/utils/expiryCalculation";
import { buildLocationTree, LocationNode } from "@/utils/locationTree";

const VAT_RATE = 0.13;

export default function PurchaseItemsSection({
  value,
  onChange,
  products,
  refreshProducts,
}: {
  value: any[];
  onChange: (v: any[]) => void;
  products: any[];
  refreshProducts?: () => Promise<void>;
}) {
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, any>>({});
  
  // Margin Settings
  const [marginSettings, setMarginSettings] = useState<any>({
    carrier_cost_percentage: 7, // default fallback
    retail_margin: 0,
    distributor_margin: 0,
    firm_margin: 0,
  });
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);

  /* ---------------- Load Locations ---------------- */
  useEffect(() => {
    let cancelled = false;
    api
      .get("/locations")
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setLocations(buildLocationTree(list));
      })
      .catch(() => {
        if (!cancelled) setLocations([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingLocations(false);
      });
      
    api
      .get("/margin-settings")
      .then((res) => {
        if (!cancelled && res.data) {
          setMarginSettings({
            carrier_cost_percentage: Number(res.data.carrier_cost_percentage) || 0,
            retail_margin: Number(res.data.retail_margin) || 0,
            distributor_margin: Number(res.data.distributor_margin) || 0,
            firm_margin: Number(res.data.firm_margin) || 0,
          });
        }
      })
      .catch(() => {});
      
    return () => { cancelled = true; };
  }, []);

  const openAddModal = () => {
    setEditingRow({
      id: generateId(),
      product_id: null,
      location_id: null,
      batch_no: "",
      hs_code: "",
      manufactured_date: null,
      expiry_mode: "date",
      expiry_date: null,
      shelf_life_value: null,
      shelf_life_unit: null,
      quantity: 1,
      free_qty: 0,
      carrier_cost: 0,
      mrp: 0,
      cost_price: 0,
      selling_price: 0,
      profit_margin: null,
      vat_included: false,
      auto_calculate: true,
      include_cc: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (row: any) => {
    setEditingRow({ ...row });
    // Pre-fetch availability if needed
    if (row.product_id && !availabilityMap[row.id]) {
        fetchAvailability(row.product_id, row.id);
    }
    setIsModalOpen(true);
  };

  const fetchAvailability = async (productId: number, rowId: string) => {
    try {
      const res = await api.get(`/products/${productId}/availability`);
      setAvailabilityMap(prev => ({ ...prev, [rowId]: res.data }));
      return res.data;
    } catch {
      setAvailabilityMap(prev => ({ ...prev, [rowId]: null }));
      return null;
    }
  };

  const saveRow = () => {
    if (!editingRow.product_id) return;
    
    // Calculate adjusted unit cost
    const qty = Number(editingRow.quantity) || 0;
    const cost = Number(editingRow.cost_price) || 0;
    const free = Number(editingRow.free_qty) || 0;
    const carrier = Number(editingRow.carrier_cost) || 0;
    
    const baseAdjusted = (qty + free) > 0 ? ((qty * cost) + carrier) / (qty + free) : cost;
    const rPct = Number(marginSettings.retail_margin) || 16;
    const dPct = Number(marginSettings.distributor_margin) || 10;
    const fPct = Number(marginSettings.firm_margin) || 7;
    const ccAmount = editingRow.include_cc ? (Number(editingRow.mrp || 0) / (1 + rPct / 100) / (1 + dPct / 100) / (1 + fPct / 100)) * 0.07 : 0;
    const adjustedCost = baseAdjusted + ccAmount;
    
    const rowToSave = {
      ...editingRow,
      profit_margin: 16,
      adjusted_unit_cost: Number(adjustedCost.toFixed(2))
    };

    const exists = value.find(r => r.id === editingRow.id);
    if (exists) {
      onChange(value.map(r => r.id === editingRow.id ? rowToSave : r));
    } else {
      onChange([...value, rowToSave]);
    }
    setIsModalOpen(false);
    setEditingRow(null);
  };

  const removeRow = (id: string) => {
    onChange(value.filter((r) => r.id !== id));
  };

  const calcLineBase = (r: any) => {
    return Number(r.quantity || 0) * Number(r.cost_price || 0);
  };

  const calcLineVAT = (r: any) => {
    if (!r.vat_included) return 0;
    const base = calcLineBase(r);
    return Number((base * VAT_RATE).toFixed(2));
  };

  const calcLineTotal = (r: any) => {
    return calcLineBase(r) + calcLineVAT(r);
  };

  const grandTotal = useMemo(
    () => value.reduce((sum, r) => sum + calcLineTotal(r), 0),
    [value]
  );

  const calculateSellingPrice = (mrp: number) => {
    if (!mrp) return 0;
    const rPct = Number(marginSettings.retail_margin) || 16;
    return Number((mrp / (1 + rPct / 100)).toFixed(2));
  };

  const calculateCarrierCost = (costPrice: number, freeQty: number) => {
    const margin = marginSettings.carrier_cost_percentage || 0;
    if (margin === 0) return 0;
    const baseAmount = costPrice / (1 + (margin / 100));
    return Math.round(baseAmount * (margin / 100) * freeQty);
  };

  const onProductSelect = async (productId: number) => {
    if (!editingRow) return;
    const avail = await fetchAvailability(productId, editingRow.id);
    const defaultUnit = avail?.units?.find((u: any) => u.level === 1) || avail?.units?.[0];
    setEditingRow((prev: any) => {
      if (!prev) return null;
      return { 
        ...prev, 
        product_id: productId,
        quantity_unit_id: defaultUnit ? defaultUnit.unit_id : null
      };
    });
  };

  const handleBatchSelect = (batchNo: string) => {
    if (!editingRow) return;
    const availability = availabilityMap[editingRow.id];
    const batch = availability?.batches?.find((b: any) => b.batch_no === batchNo);

    if (batch) {
      setEditingRow({
        ...editingRow,
        batch_no: batch.batch_no,
        hs_code: batch.hs_code ?? "",
        manufactured_date: batch.manufactured_at ?? null,
        expiry_date: batch.expiry_date ?? null,
        cost_price: batch.cost_price ?? 0,
        selling_price: batch.selling_price ?? 0,
        profit_margin: batch.profit_margin ?? null,
        vat_included: batch.vat_included ?? false,
        auto_calculate: batch.is_auto_calculated,
        quantity_unit_id: batch.unit_id || editingRow.quantity_unit_id,
      });
    } else {
      setEditingRow({
        ...editingRow,
        batch_no: batchNo,
        hs_code: "",
        manufactured_date: null,
        expiry_date: null,
        cost_price: 0,
        selling_price: 0,
        profit_margin: null,
        vat_included: false,
        auto_calculate: true,
      });
    }
  };

  return (
    <section className="pt-6 border-t space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Package size={18} className="text-primary" />
            Purchase Items
          </h4>
          <p className="text-[11px] text-gray-500">
            List of products included in this purchase
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={openAddModal}
          className="border-primary/20 text-primary hover:bg-primary/5"
        >
          <Plus size={14} className="mr-1" />
          Add Product
        </Button>
      </div>

      {/* IRD Style Table */}
      <div className="overflow-x-auto border rounded-xl bg-white shadow-sm ring-1 ring-black ring-opacity-5">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase tracking-tighter font-extrabold border-b">
              <th className="px-2 py-3 text-left w-8">S.N.</th>
              <th className="px-2 py-3 text-left">Product / Description</th>
              <th className="px-2 py-3 text-center">HS Code</th>
              <th className="px-2 py-3 text-center">Batch / Expiry</th>
              <th className="px-2 py-3 text-right">Qty</th>
              <th className="px-2 py-3 text-right">Rate</th>
              <th className="px-2 py-3 text-right">Amount</th>
              <th className="px-2 py-3 text-right">VAT (13%)</th>
              <th className="px-2 py-3 text-right font-black bg-green-50/50">Total</th>
              <th className="px-2 py-3 text-center w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {value.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-400 italic bg-gray-50/20">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle size={24} className="opacity-10" />
                    No items added. Click "Add Product" to begin.
                  </div>
                </td>
              </tr>
            ) : (
              value.map((row, idx) => {
                const base = calcLineBase(row);
                const vat = calcLineVAT(row);
                const total = calcLineTotal(row);
                const product = products.find(p => p.id === row.product_id);

                return (
                  <tr key={row.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-2 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-2 py-3">
                      <p className="font-bold text-gray-900 leading-tight">{product?.name || "Unknown Product"}</p>
                      <p className="text-[9px] text-gray-400">ID: {product?.code || "—"}</p>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <span className="text-[10px] text-gray-600">
                        {row.hs_code || "—"}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <div className="inline-flex flex-col">
                        <span className="text-[10px] text-primary bg-primary/10 px-1 rounded">
                          {row.batch_no || "—"}
                        </span>
                        <span className="text-[9px] text-gray-400 mt-0.5">
                          {formatDate(row.expiry_date) || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right">
                       <span className="font-bold text-gray-900">{row.quantity}</span>
                       {row.free_qty > 0 && (
                         <span className="text-green-600 font-medium ml-1">+{row.free_qty} Free</span>
                       )}
                       <span className="text-[9px] text-gray-500 ml-0.5">
                         {availabilityMap[row.id]?.units?.find((u: any) => u.unit_id === row.quantity_unit_id)?.unit_name
                           || product?.unit_name || "pcs"}
                       </span>
                    </td>
                    <td className="px-2 py-3 text-right text-gray-600">
                      {formatNepaliCurrency(row.cost_price)}
                    </td>
                    <td className="px-2 py-3 text-right text-gray-600">
                      {formatNepaliCurrency(base)}
                    </td>
                    <td className="px-2 py-3 text-right text-orange-600">
                      {vat > 0 ? formatNepaliCurrency(vat) : "0.00"}
                    </td>
                    <td className="px-2 py-3 text-right font-black text-green-700 bg-green-50/10">
                      {formatNepaliCurrency(total)}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => openEditModal(row)}
                          className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button 
                          onClick={() => removeRow(row.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {value.length > 0 && (
              <tfoot>
                  <tr className="bg-gray-100 font-black text-gray-800 border-t-2 border-gray-200">
                    <td colSpan={8} className="px-4 py-3 text-right text-xs uppercase tracking-widest">Grand Total (Incl. VAT)</td>
                    <td className="px-2 py-3 text-right text-sm text-green-900 bg-green-200/50">
                        {formatNepaliCurrency(grandTotal)}
                    </td>
                    <td></td>
                  </tr>
              </tfoot>
          )}
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={
            <div className="flex items-center gap-2 text-emerald-700 text-lg font-bold border-b pb-3 mb-1">
                <Plus size={20} className="bg-emerald-50 p-1 rounded-lg text-emerald-700" />
                <span>{editingRow?.id && value.find(r => r.id === editingRow.id) ? "Edit Purchase Item" : "Add Purchase Item"}</span>
            </div>
        }
        open={isModalOpen}
        style={{ top: 20 }}
        onCancel={() => setIsModalOpen(false)}
        onOk={saveRow}
        width={1000}
        okText="Confirm & Add"
        okButtonProps={{ 
            style: { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' },
            className: "hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg shadow-sm" 
        }}
        cancelButtonProps={{ 
            style: { color: 'var(--primary)', borderColor: 'var(--primary)' },
            className: "hover:bg-primary/5 font-semibold py-2 px-4 rounded-lg border-gray-200" 
        }}
      >
        {editingRow && (
          <div className="space-y-6 pt-2">
            {/* Availability Info (If exists) */}
            {availabilityMap[editingRow.id] && (
              <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-emerald-200/40 pb-2.5">
                    <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      Current Availability
                    </h5>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-100/50 px-3 py-1 rounded-full border border-emerald-200/50">
                        Total Stock: {formatNepaliCurrency(availabilityMap[editingRow.id].total_base_qty)}
                    </span>
                </div>
                
                <div className="flex gap-3 flex-wrap">
                    {availabilityMap[editingRow.id].units.map((u: any) => (
                        <div key={u.unit_id} className="bg-white px-3.5 py-2 rounded-xl border border-emerald-100/65 shadow-sm flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500" />
                             <span className="text-[11px] font-semibold text-gray-700">{formatNepaliCurrency(u.available)} {u.unit_name}</span>
                        </div>
                    ))}
                </div>

                {availabilityMap[editingRow.id].batches.length > 0 && (
                  <div className="space-y-2">
                      <p className="text-[10px] text-emerald-800/60 font-black uppercase tracking-wider">FEFO Batches in Stock</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                          {availabilityMap[editingRow.id].batches.map((b: any) => (
                              <div key={b.id} className="bg-white p-2.5 rounded-xl border border-emerald-100/35 text-[10px] flex justify-between shadow-sm">
                                  <span className="text-gray-600 font-medium">{b.batch_no}</span>
                                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">{formatNepaliCurrency(b.current_stock)}</span>
                              </div>
                          ))}
                      </div>
                  </div>
                )}
              </div>
            )}

            {/* Section 1: Product Identification */}
            <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">1</span>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest">Product Details</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Product</label>
                      <button 
                          type="button"
                          onClick={() => setQuickAddModalOpen(true)}
                          className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 border border-emerald-200/50 bg-emerald-50/50 px-2 py-0.5 rounded-md transition-all"
                      >
                          <Plus size={10} /> New Product
                      </button>
                  </div>
                  <Select
                    showSearch
                    allowClear
                    className="w-full h-10"
                    placeholder="Choose a product..."
                    optionFilterProp="label"
                    value={editingRow.product_id ?? undefined}
                    onChange={onProductSelect}
                    options={products.map((p) => ({
                      value: p.id,
                      label: p.name,
                    }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Batch No / Selector</label>
                  <Select
                    showSearch
                    mode="tags"
                    className="w-full"
                    placeholder="Enter or select batch"
                    value={editingRow.batch_no ? [editingRow.batch_no] : []}
                    onChange={(vals) => handleBatchSelect(vals[vals.length - 1])}
                    options={(availabilityMap[editingRow.id]?.batches || []).map((b: any) => ({
                      value: b.batch_no,
                      label: `${b.batch_no} (Exp: ${formatDate(b.expiry_date)})`,
                    }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">HS Code</label>
                  <Input
                    placeholder="e.g. 3004.90.29"
                    className="h-10"
                    value={editingRow.hs_code ?? ""}
                    onChange={(e) => setEditingRow({ ...editingRow, hs_code: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Physical Storage Location</label>
                  <TreeSelect
                    treeData={locations}
                    value={editingRow.location_id ?? undefined}
                    placeholder="Select warehouse/rack/shelf"
                    className="w-full h-10"
                    onChange={(v) => setEditingRow({...editingRow, location_id: v ? Number(v) : null})}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Expiry Settings */}
            <div className="bg-blue-50/30 border border-blue-100/50 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">2</span>
                  <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest">Expiry & Shelf Life</h4>
                </div>
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={editingRow.expiry_mode === "date"}
                    onChange={() => setEditingRow({ ...editingRow, expiry_mode: "date", shelf_life_value: null, shelf_life_unit: null })}
                    className="accent-blue-600"
                  >
                    <span className="text-xs font-semibold text-blue-900">Standard Date</span>
                  </Checkbox>
                  <Checkbox
                    checked={editingRow.expiry_mode === "shelf_life"}
                    onChange={() => setEditingRow({ ...editingRow, expiry_mode: "shelf_life", expiry_date: null })}
                    className="accent-blue-600"
                  >
                    <span className="text-xs font-semibold text-blue-900">Shelf Life Calculation</span>
                  </Checkbox>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Manufactured Date</label>
                    <DatePicker
                      className="w-full h-10"
                      format="YYYY-MM-DD"
                      value={editingRow.manufactured_date ? dayjs(editingRow.manufactured_date) : null}
                      onChange={(d) => setEditingRow({ ...editingRow, manufactured_date: d ? d.format("YYYY-MM-DD") : null })}
                    />
                 </div>

                 {editingRow.expiry_mode === "date" ? (
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expiry Date</label>
                      <DatePicker
                        className="w-full h-10"
                        format="YYYY-MM-DD"
                        value={editingRow.expiry_date ? dayjs(editingRow.expiry_date) : null}
                        onChange={(d) => setEditingRow({ ...editingRow, expiry_date: d ? d.format("YYYY-MM-DD") : null })}
                      />
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Life Value</label>
                        <Input
                          type="number"
                          className="h-10"
                          value={editingRow.shelf_life_value ?? ""}
                          onChange={(e) => setEditingRow({ ...editingRow, shelf_life_value: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unit</label>
                        <select
                          className="w-full border border-gray-200 rounded-md h-10 text-xs px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white font-medium"
                          value={editingRow.shelf_life_unit ?? ""}
                          onChange={(e) => setEditingRow({ ...editingRow, shelf_life_unit: e.target.value })}
                        >
                          <option value="">Choose...</option>
                          <option value="days">Days</option>
                          <option value="months">Months</option>
                          <option value="years">Years</option>
                        </select>
                      </div>
                   </div>
                 )}
              </div>
              
              {resolveExpiryDate(editingRow) && (
                  <div className="bg-blue-100/50 border border-blue-200/40 rounded-xl px-4 py-2 text-xs font-bold text-blue-800 inline-block">
                      Resolved Expiry: {dayjs(resolveExpiryDate(editingRow)).format("YYYY-MM-DD")}
                  </div>
              )}
            </div>

            {/* Section 3: Quantity & Costing Grid */}
            <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">3</span>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest">Quantities & Costing</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Purchased Qty</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={0}
                      className="flex-1 h-10 font-semibold"
                      value={editingRow.quantity}
                      onChange={(e) => setEditingRow({...editingRow, quantity: Number(e.target.value)})}
                    />
                    <Select
                      className="w-32 h-10"
                      placeholder="Unit"
                      value={editingRow.quantity_unit_id ?? undefined}
                      onChange={(v) => setEditingRow({...editingRow, quantity_unit_id: v})}
                      options={(availabilityMap[editingRow.id]?.units || []).map((u: any) => ({
                        value: u.unit_id,
                        label: u.unit_name,
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Free Qty</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    className="w-full h-10 font-semibold"
                    value={editingRow.free_qty ?? ""}
                    onChange={(e) => {
                      const fQty = Number(e.target.value);
                      const isCcEnabled = fQty > 0 ? editingRow.include_cc : false;
                      const newCarrierCost = isCcEnabled ? calculateCarrierCost(editingRow.cost_price, fQty) : 0;
                      setEditingRow({
                        ...editingRow, 
                        free_qty: fQty,
                        include_cc: isCcEnabled,
                        carrier_cost: newCarrierCost
                      });
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Cost Price</label>
                  <Input
                    type="number"
                    className="h-10 font-semibold"
                    value={editingRow.cost_price}
                    onChange={(e) => {
                      const cost = Number(e.target.value);
                      const isCcEnabled = (editingRow.free_qty || 0) > 0 ? editingRow.include_cc : false;
                      const newCarrierCost = isCcEnabled ? calculateCarrierCost(cost, editingRow.free_qty || 0) : 0;
                      setEditingRow({
                        ...editingRow,
                        cost_price: cost,
                        include_cc: isCcEnabled,
                        carrier_cost: newCarrierCost,
                        selling_price: editingRow.auto_calculate 
                          ? calculateSellingPrice(editingRow.mrp) 
                          : editingRow.selling_price
                      });
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase">Maximum Retail Price (MRP)</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    className="w-full h-10 font-semibold"
                    value={editingRow.mrp ?? ""}
                    onChange={(e) => {
                      const newMrp = Number(e.target.value);
                      setEditingRow({
                        ...editingRow, 
                        mrp: newMrp,
                        selling_price: editingRow.auto_calculate
                          ? calculateSellingPrice(newMrp)
                          : editingRow.selling_price
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Taxes & Selling Price Calculation */}
            <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
              <div className="flex gap-6 flex-wrap">
                 <Checkbox
                     checked={editingRow.auto_calculate}
                     onChange={(e) => setEditingRow({
                         ...editingRow,
                         auto_calculate: e.target.checked,
                         selling_price: e.target.checked ? calculateSellingPrice(editingRow.mrp) : editingRow.selling_price
                     })}
                     className="accent-primary"
                 >
                     <span className="text-xs font-semibold text-gray-700">Auto Calculate Selling Price</span>
                 </Checkbox>
                 <Checkbox
                     checked={editingRow.vat_included}
                     onChange={(e) => setEditingRow({ ...editingRow, vat_included: e.target.checked })}
                     className="accent-primary"
                 >
                     <span className="text-xs font-semibold text-gray-700">13% VAT Included</span>
                 </Checkbox>
                 <Checkbox
                     checked={((editingRow.free_qty || 0) > 0) && editingRow.include_cc}
                     disabled={!((editingRow.free_qty || 0) > 0)}
                     onChange={(e) => {
                        const checked = e.target.checked;
                        setEditingRow({ 
                          ...editingRow, 
                          include_cc: checked,
                          carrier_cost: checked 
                            ? (editingRow.carrier_cost || calculateCarrierCost(editingRow.cost_price, editingRow.free_qty || 0)) 
                            : 0 
                        });
                      }}
                     className="accent-primary"
                 >
                     <span className="text-xs font-semibold text-gray-700">
                         Include Carrier Cost
                     </span>
                 </Checkbox>
              </div>

              <div className="text-right w-full md:w-auto">
                 <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">Selling Price</p>
                 <Input 
                     type="number" 
                     disabled={editingRow.auto_calculate}
                     className={`text-right font-black w-full md:w-48 h-10 text-lg ${editingRow.auto_calculate ? "bg-gray-50 border-gray-100 text-gray-500" : "bg-white border-primary/20 text-emerald-600"}`}
                     value={editingRow.selling_price}
                     onChange={(e) => setEditingRow({...editingRow, selling_price: Number(e.target.value)})}
                 />
              </div>
            </div>

            {/* Line Summary (Standard Level Dashboard Layout) */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start shadow-sm">
                {/* Left/Middle Column: Bill Format Summary */}
                <div className="md:col-span-2 bg-white/40 p-4 rounded-xl border border-emerald-100/50 space-y-3">
                    <div className="space-y-2 text-sm font-semibold text-emerald-950">
                        {/* Gross Total Row */}
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Gross Total</span>
                            <span className="font-bold text-gray-800">{formatNepaliCurrency(calcLineBase(editingRow))}</span>
                        </div>
                        {/* VAT Row (Shows always, but only calculates if clicked) */}
                        {/* VAT & Subtotal Rows (Only displayed if VAT is clicked/included) */}
                        {editingRow.vat_included && (
                            <>
                                <div className="flex justify-between items-center py-1 border-t border-emerald-100/30">
                                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Total VAT (13%)</span>
                                    <span className="font-bold text-gray-800">{formatNepaliCurrency(calcLineVAT(editingRow))}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-t border-emerald-100/30">
                                    <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Subtotal (Gross + VAT)</span>
                                    <span className="font-bold text-gray-800">{formatNepaliCurrency(calcLineTotal(editingRow))}</span>
                                </div>
                            </>
                        )}
                        {/* Carrier Cost Row (Only calculated/displayed if Include CC is checked) */}
                        {editingRow.include_cc && (
                            <div className="flex justify-between items-center py-1 border-t border-emerald-100/30 bg-emerald-50 px-2 py-1.5 rounded">
                                <span className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">Total Item Carrier Cost</span>
                                <span className="font-bold text-emerald-700">{formatNepaliCurrency(Number(editingRow.carrier_cost) || 0)}</span>
                            </div>
                        )}
                        {/* Divider */}
                        <div className="border-t border-emerald-200/60 my-2"></div>
                        {/* Net Payable Row */}
                        <div className="flex justify-between items-baseline pt-1 px-1">
                            <span className="text-emerald-900 font-black uppercase tracking-wider text-xs">Net Payable Amount</span>
                            <span className="text-2xl sm:text-3xl font-black text-emerald-900">
                                {formatNepaliCurrency(
                                    calcLineTotal(editingRow) + (editingRow.include_cc ? (Number(editingRow.carrier_cost) || 0) : 0)
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Carrier Cost Input */}
                <div className="md:col-span-1 bg-white/60 p-4 rounded-xl border border-emerald-100/50 space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-emerald-850 uppercase tracking-wide">Carrier Cost</label>
                        <span className="text-[9px] font-black text-emerald-750 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-250/20">
                            Auto: {calculateCarrierCost(editingRow.cost_price, editingRow.free_qty || 0)} NPR
                        </span>
                    </div>
                    <Input
                        type="number"
                        min={0}
                        disabled={!editingRow.include_cc}
                        placeholder="0"
                        className="w-full h-10 font-bold bg-white border-emerald-200/50 focus:border-emerald-500 focus:ring-emerald-500 text-emerald-800 disabled:bg-emerald-50/50 disabled:text-emerald-800/40"
                        value={editingRow.include_cc ? (editingRow.carrier_cost ?? "") : 0}
                        onChange={(e) => setEditingRow({...editingRow, carrier_cost: Number(e.target.value)})}
                    />
                </div>            </div>
          </div>
        )}
      </Modal>

      {/* Quick Add Product Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-primary">
            <Package size={18} />
            <span>Quick Add New Product</span>
          </div>
        }
        open={quickAddModalOpen}
        style={{ top: 20 }}
        onCancel={() => setQuickAddModalOpen(false)}
        footer={null} // ProductFormContent has its own footer
        width={900}
        destroyOnHidden
      >
        <div className="max-h-[70vh] overflow-y-auto px-1">
            <ProductFormContent 
                isQuickAdd={true}
                onClose={() => setQuickAddModalOpen(false)}
                refresh={async () => {
                    if (refreshProducts) await refreshProducts();
                }}
            />
        </div>
      </Modal>
    </section>
  );
}
