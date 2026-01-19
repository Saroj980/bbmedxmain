/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Select } from "antd";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Package } from "lucide-react";
import { api } from "@/lib/api";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import dayjs from "dayjs";

const VAT_RATE = 0.13;

const resolveExpiry = (batch: any) => {
  if (!batch) return null;

  if (batch.expiry_date) {
    return dayjs(batch.expiry_date);
  }

  if (batch.manufactured_at && batch.shelf_life_value && batch.shelf_life_unit) {
    return dayjs(batch.manufactured_at).add(
      batch.shelf_life_value,
      batch.shelf_life_unit
    );
  }

  return null;
};


export default function SaleItemsSection({
  value,
  onChange,
  products,
}: {
  value: any[];
  onChange: (v: any[]) => void;
  products: any[];
}) {
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, any>>({});

  /* ---------------- Helpers ---------------- */

  const addRow = () => {
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        product_id: null,
        batch_id: null,
        quantity: 1,
        quantity_unit_id: null,
        selling_price: 0,
        vat_included: false,
      },
    ]);
  };

  const updateRow = (id: string, patch: any) => {
    onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    onChange(value.filter((r) => r.id !== id));
  };

  const fetchAvailability = async (productId: number, rowId: string) => {
    try {
      const res = await api.get(`/products/${productId}/availability`);
      setAvailabilityMap(prev => ({
        ...prev,
        [rowId]: res.data,
      }));
    } catch {
      setAvailabilityMap(prev => ({
        ...prev,
        [rowId]: null,
      }));
    }
  };

  /* ---------------- Calculations ---------------- */

  const calcLineTotal = (r: any) => {
    const base = r.quantity * r.selling_price;
    return r.vat_included ? base * (1 + VAT_RATE) : base;
  };

  const grandTotal = useMemo(
    () => value.reduce((sum, r) => sum + calcLineTotal(r), 0),
    [value]
  );

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

    // base → smaller unit (Box → Strip → Tablet)
    if (base.level < target.level) {
      units.forEach((u: any) => {
        if (u.level > base.level && u.level <= target.level) {
          factor *= u.conversion_factor;
        }
      });
      return +(basePrice / factor).toFixed(2);
    }

    // base → larger unit (Tablet → Strip → Box)
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



  /* ---------------- UI ---------------- */

  return (
    <section className="pt-6 border-t space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-gray-700 flex items-center gap-2">
            <Package size={18} />
            Sale Items
          </h4>
          <p className="text-xs text-gray-400">
            Select product → batch (FEFO) → quantity
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus size={14} className="mr-1" />
          Add Item
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-gray-400 italic">
          No sale items added yet.
        </p>
      )}

      {/* Items */}
      <div className="space-y-4">
        {value.map((row) => {
          const availability = availabilityMap[row.id];
          const lineTotal = calcLineTotal(row);

          return (
            <div
              key={row.id}
              className="rounded-xl border shadow-sm p-5 space-y-5 bg-white"
            >
              {/* Availability */}
              {availability && (
                <div className="bg-blue-50 border rounded-lg p-3 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>Total Available</span>
                    <span className="font-semibold">
                      {formatNepaliCurrency(availability.total_base_qty)}
                    </span>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    {availability.units.map((u: any) => (
                      <span
                        key={u.unit_id}
                        className="bg-white border px-2 py-1 rounded"
                      >
                        {formatNepaliCurrency(u.available)} {u.unit_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Product */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Product
                  </label>
                  <Select
                    showSearch
                    allowClear
                    className="w-full mt-1"
                    placeholder="Select product"
                    value={row.product_id ?? undefined}
                    onChange={(v) => {
                      updateRow(row.id, {
                        product_id: v,
                        batch_id: null,
                      });
                      fetchAvailability(v, row.id);
                    }}
                    options={products.map((p) => ({
                      value: p.id,
                      label: p.name,
                    }))}
                  />
                </div>

                {/* Batch (FEFO enforced) */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Batch (FEFO)
                  </label>
                  <Select
                    className="w-full mt-1"
                    placeholder="Select batch"
                    value={row.batch_id ?? undefined}
                    disabled={!availability}
                    onChange={(batchId) => {
                      const batch = availability?.batches.find(
                        (b: any) => b.id === batchId
                      );

                      if (!batch) return;

                      console.log(batch.unit_id);

                      updateRow(row.id, {
                        batch_id: batch.id,
                        quantity_unit_id: batch.unit_id,
                        base_unit_id: batch.unit_id,
                        base_price: Number(batch.selling_price),
                        selling_price: batch.selling_price ?? 0,
                        vat_included: batch.vat_included ?? false,
                      });
                    }}
                    options={(availability?.batches || [])
                      .filter((b: any) => !b.expired && b.current_stock > 0)
                      .map((b: any) => ({
                        value: b.id,
                        label: `${b.batch_no} | Exp ${dayjs(b.expiry_date).format(
                          "YYYY-MM-DD"
                        )} | ${b.current_stock}`,
                      }))}
                  />
                  {row.batch_id && availability && (() => {
                    const batch = availability.batches.find(
                      (b: any) => b.id === row.batch_id
                    );
                    const expiry = resolveExpiry(batch);

                    if (!expiry) return null;

                    const daysLeft = expiry.diff(dayjs(), "day");

                    return (
                      <p
                        className={`text-xs mt-1 ${
                          daysLeft <= 30 ? "text-red-600" : "text-gray-500"
                        }`}
                      >
                        Exp: {expiry.format("YYYY-MM-DD")}
                        {" • "}
                        {daysLeft >= 0
                          ? `${daysLeft} days remaining`
                          : "Expired"}
                      </p>
                    );
                  })()}


                </div>

                {/* Quantity */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Quantity
                  </label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) =>
                        updateRow(row.id, {
                          quantity: Number(e.target.value),
                        })
                      }
                    />

                    <Select
                      placeholder="Unit"
                      className="w-32"
                      value={row.quantity_unit_id ?? undefined}
                      onChange={(newUnitId) => {
                        if (!availability || !row.base_unit_id) {
                          updateRow(row.id, { quantity_unit_id: newUnitId });
                          return;
                        }

                        const newPrice = convertPrice(
                          row.base_price,
                          row.base_unit_id,
                          newUnitId,
                          availability.units
                        );

                        updateRow(row.id, {
                          quantity_unit_id: newUnitId,
                          selling_price: newPrice,
                        });
                      }}

                      options={(availability?.units || []).map((u: any) => ({
                        value: u.unit_id,
                        label: u.unit_name,
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Selling Price
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="mt-1"
                    value={row.selling_price}
                    onChange={(e) =>
                      updateRow(row.id, {
                        selling_price: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="flex items-end gap-4">
                  <label className="text-xs font-medium text-gray-600">
                    VAT 13%
                  </label>
                  <input
                    type="checkbox"
                    checked={row.vat_included}
                    onChange={(e) =>
                      updateRow(row.id, { vat_included: e.target.checked })
                    }
                  />
                </div>

                <div className="flex items-end justify-end">
                  <Button
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => removeRow(row.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {/* Line Total */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Line Total</p>
                <p className="font-semibold">
                  {formatNepaliCurrency(lineTotal)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand Total */}
      {value.length > 0 && (
        <div className="mt-6 border-t pt-4 flex justify-end">
          <div className="bg-[#F6FAF8] border rounded-xl p-4 w-full md:w-1/2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Grand Total</span>
              <span className="font-semibold">
                {formatNepaliCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
