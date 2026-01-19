/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Select, Checkbox, DatePicker, TreeSelect } from "antd";
import dayjs from "dayjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Package } from "lucide-react";
import { resolveExpiryDate } from "@/utils/expiryCalculation";
import { buildLocationTree, LocationNode } from "@/utils/locationTree";
import { api } from "@/lib/api";
import { formatDate } from "@/utils/utils";
import { useProductAvailability } from "@/hooks/useProductAvailability";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";


const VAT_RATE = 0.13;

export default function PurchaseItemsSection({
  value,
  onChange,
  products,
}: {
  value: any[];
  onChange: (v: any[]) => void;
  products: any[];
}) {

  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  const [availabilityMap, setAvailabilityMap] = useState<Record<string, any>>({});
  // const [availability, setAvailability] = useState<any>(null);
  


  // const fetchAvailability = async (productId: number) => {
  //   if (!productId) return;

  //   try {
  //     const res = await api.get(`/products/${productId}/availability`);
  //     setAvailability(prev => ({
  //       ...prev,
  //       [productId]: res.data,
  //     }));
  //   } catch {
  //     // silent fail (non-blocking UX)
  //   }
  // };
  const onProductSelect = async (productId: number, rowId: string) => {
    updateRow(rowId, { product_id: productId });

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



  const calculateSellingPrice = (cost: number, margin?: number | null) => {
    if (!margin) return 0;
    return Number((cost * (1 + margin / 100)).toFixed(2));
  };

  const handleBatchSelect = (batchNo: string, rowId: string) => {
    const availability = availabilityMap[rowId];
    if (!availability) {
      updateRow(rowId, { batch_no: batchNo });
      return;
    }

    const batch = availability.batches.find(
      (b: any) => b.batch_no === batchNo
    );

    console.log("Selected batch:", batch);

    // Existing batch → auto fill
    if (batch) {
      updateRow(rowId, {
        batch_no: batch.batch_no,
        manufactured_date: batch.manufactured_at ?? null,
        expiry_date: batch.expiry_date ?? null,
        cost_price: batch.cost_price ?? 0,
        selling_price: batch.selling_price ?? 0,
        profit_margin: batch.profit_margin ?? null,
        vat_included: batch.vat_included ?? false,
        auto_calculate: batch.is_auto_calculated, // IMPORTANT: don't override prices
      });
    } 
    // New batch → clean slate
    else {
      updateRow(rowId, {
        batch_no: batchNo,
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
  
      return () => {
        cancelled = true;
      };
    }, []);

  const addRow = () => {
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        product_id: null,
        location_id: null,
        batch_no: "",
        manufactured_date: null,
        expiry_mode: "date",
        expiry_date: null,
        shelf_life_value: null,
        shelf_life_unit: null,
        quantity: 1,
        cost_price: 0,
        selling_price: 0,
        profit_margin: null,
        vat_included: false,
        auto_calculate: true,
      },
    ]);
  };

  const updateRow = (id: string, patch: any) => {
    onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    onChange(value.filter((r) => r.id !== id));
  };

  const calcPurchaseTotal = (r: any) => {
    const base = r.quantity * r.cost_price;
    return r.vat_included ? base * (1 + VAT_RATE) : base;
  };

  const grandTotal = useMemo(
    () => value.reduce((sum, r) => sum + calcPurchaseTotal(r), 0),
    [value]
  );

  

  return (
    <section className="pt-6 border-t space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-gray-700 flex items-center gap-2">
            <Package size={18} />
            Purchase Items
          </h4>
          <p className="text-xs text-gray-400">
            Add purchased products batch-wise
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus size={14} className="mr-1" />
          Add Item
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-gray-400 italic">
          No purchase items added yet.
        </p>
      )}

      {/* Cards */}
      <div className="space-y-4">
        {value.map((row) => {
            const purchaseTotal = calcPurchaseTotal(row);

            const resolvedExpiry = resolveExpiryDate(row);

            const availability = availabilityMap[row.id];

          return (
            <div
              key={row.id}
              className="rounded-xl border shadow-sm p-5 space-y-5 bg-white"
            >
              {availability && (
                <div className="mt-3 bg-gray-50 border rounded-lg p-3 space-y-2 text-xs">

                  {/* Total Stock */}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Available</span>
                    <span className="font-semibold">
                      {formatNepaliCurrency(availability.total_base_qty)}
                    </span>
                  </div>

                  {/* Unit-wise */}
                  {availability && (
                    <div className="bg-blue-50 border rounded-lg p-3 text-xs space-y-1">
                      <p className="font-semibold text-blue-700">
                        Available Stock
                      </p>

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


                  {/* Batch-wise */}
                  <div>
                    <p className="text-gray-500 mb-1">Batches (FEFO)</p>
                    <div className="space-y-1">
                      {availability.batches.map((b: any) => (
                        <div
                          key={b.id}
                          className={`flex justify-between px-2 py-1 rounded border
                            ${b.expired ? "bg-red-50 border-red-300 text-red-700" : "bg-white"}
                          `}
                        >
                          <span>
                            {b.batch_no} | Exp: {formatDate(b.expiry_date) ?? "N/A"}
                          </span>
                          <span className="font-semibold">
                            {formatNepaliCurrency(b.current_stock)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Product
                  </label>
                  <Select
                    showSearch
                    allowClear
                    className="w-full mt-1"
                    placeholder="Select product"
                    optionFilterProp="label"
                    value={row.product_id ?? undefined}
                    onChange={(v) => onProductSelect(v, row.id)}
                    options={products.map((p) => ({
                      value: p.id,
                      label: p.name,
                    }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Batch No
                  </label>

                  <Select
                    showSearch
                    mode="tags"              // <-- allows typing new batch
                    className="w-full mt-1"
                    placeholder="Select or type batch"
                    value={row.batch_no ? [row.batch_no] : []}
                    optionFilterProp="label"
                    onChange={(vals) => {
                      const batchNo = vals[vals.length - 1]; // last typed/selected
                      handleBatchSelect(batchNo, row.id);
                    }}
                    options={(availability?.batches || []).map((b: any) => ({
                      value: b.batch_no,
                      label: `${b.batch_no} (Exp: ${formatDate(b.expiry_date)})`,
                      batch: b, // attach full batch object
                    }))}
                  />
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-600">
                        Storage Location
                    </label>
                    <div style={{ width: '100%' }}>
                    <TreeSelect
                        treeData={locations}
                        value={row.location_id ?? undefined}
                        placeholder="Select storage"
                        showSearch
                        allowClear
                        onChange={(v) =>
                            updateRow(row.id, { location_id: v ? Number(v) : null })
                        }
                        style={{ width: '100%' }}
                    />
                    </div>
                </div>
                {/* <div>
                  <label className="text-xs font-medium text-gray-600">
                    Batch No
                  </label>
                  <Input
                    className="mt-1"
                    placeholder="Enter batch no"
                    value={row.batch_no}
                    onChange={(e) =>
                      updateRow(row.id, { batch_no: e.target.value })
                    }
                  />
                </div> */}

                {/* <div>
                  <label className="text-xs font-medium text-gray-600">
                    Expiry Date
                  </label>
                  <DatePicker
                    className="w-full mt-1"
                    format="YYYY-MM-DD"
                    placeholder="Select expiry date"
                    value={row.expiry_date ? dayjs(row.expiry_date) : null}
                    onChange={(d) =>
                      updateRow(row.id, {
                        expiry_date: d ? d.format("YYYY-MM-DD") : null,
                      })
                    }
                  />
                </div> */}
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="text-xs font-medium text-gray-600">
                    Expiry Method
                </label>

                <div className="flex gap-6 mt-2">
                    <Checkbox
                    checked={row.expiry_mode === "date"}
                    onChange={() =>
                        updateRow(row.id, {
                        expiry_mode: "date",
                        shelf_life_value: null,
                        shelf_life_unit: null,
                        })
                    }
                    >
                    Exact Expiry Date
                    </Checkbox>

                    <Checkbox
                    checked={row.expiry_mode === "shelf_life"}
                    onChange={() =>
                        updateRow(row.id, {
                        expiry_mode: "shelf_life",
                        expiry_date: null,
                        })
                    }
                    >
                    Manufactured + Shelf Life
                    </Checkbox>
                </div>
              </div>

              {row.expiry_mode === "date" && (
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-medium text-gray-600">
                            Manufactured Date
                        </label>
                        <DatePicker
                            className="w-full mt-1"
                            format="YYYY-MM-DD"
                            placeholder="Select manufactured date"
                            value={
                            row.manufactured_date
                                ? dayjs(row.manufactured_date)
                                : null
                            }
                            onChange={(d) =>
                            updateRow(row.id, {
                                manufactured_date: d ? d.format("YYYY-MM-DD") : null,
                            })
                            }
                        />
                    </div>
                    <div>
                    <label className="text-xs font-medium text-gray-600">
                        Expiry Date
                    </label>
                    <DatePicker
                        className="w-full mt-1"
                        format="YYYY-MM-DD"
                        placeholder="Select expiry date"
                        value={row.expiry_date ? dayjs(row.expiry_date) : null}
                        onChange={(d) =>
                        updateRow(row.id, {
                            expiry_date: d ? d.format("YYYY-MM-DD") : null,
                        })
                        }
                    />
                    </div>
                </div>
              )}

              {row.expiry_mode === "shelf_life" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-600">
                            Manufactured Date
                        </label>
                        <DatePicker
                            className="w-full mt-1"
                            format="YYYY-MM-DD"
                            placeholder="Select manufactured date"
                            value={
                            row.manufactured_date
                                ? dayjs(row.manufactured_date)
                                : null
                            }
                            onChange={(d) =>
                            updateRow(row.id, {
                                manufactured_date: d ? d.format("YYYY-MM-DD") : null,
                            })
                            }
                        />
                    </div>

                    <div>
                    <label className="text-xs font-medium text-gray-600">
                        Shelf Life Value
                    </label>
                    <Input
                        type="number"
                        min={1}
                        className="mt-1"
                        placeholder="e.g. 24"
                        value={row.shelf_life_value ?? ""}
                        onChange={(e) =>
                        updateRow(row.id, {
                            shelf_life_value: Number(e.target.value),
                        })
                        }
                    />
                    </div>

                    <div>
                    <label className="text-xs font-medium text-gray-600">
                        Shelf Life Unit
                    </label>
                    <select
                        className="border rounded px-3 py-2 mt-1 w-full text-sm"
                        value={row.shelf_life_unit ?? ""}
                        style={{ fontSize: '12px' }}
                        onChange={(e) =>
                        updateRow(row.id, {
                            shelf_life_unit: e.target.value,
                        })
                    }
                    >
                        <option value="">Select unit</option>
                        <option value="days">Days</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                    </select>
                    </div>
                </div>
            )}

            {resolvedExpiry && (
                <p className="text-sm text-gray-500">
                    Resolved Expiry Date: <span className="font-medium">{dayjs(resolvedExpiry).format("YYYY-MM-DD")}</span>
                </p>
            )}


              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Cost Price (VAT excl.)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="mt-1"
                    value={row.cost_price}
                    onChange={(e) => {
                      const cost = Number(e.target.value);
                      updateRow(row.id, {
                        cost_price: cost,
                        selling_price: row.auto_calculate
                          ? calculateSellingPrice(cost, row.profit_margin)
                          : row.selling_price,
                      });
                    }}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Profit Margin (%)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="mt-1"
                    value={row.profit_margin ?? ""}
                    placeholder="e.g. 20"
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      updateRow(row.id, {
                        profit_margin: m,
                        selling_price: row.auto_calculate
                          ? calculateSellingPrice(row.cost_price, m)
                          : row.selling_price,
                      });
                    }}
                  />
                </div>

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
                        updateRow(row.id, { quantity: Number(e.target.value) })
                      }
                    />

                    <Select
                      className="w-100"
                      size="middle"
                      placeholder="Unit"
                      value={row.quantity_unit_id ?? undefined}
                      onChange={(v) =>
                        updateRow(row.id, { quantity_unit_id: v })
                      }
                      options={(availability?.units || []).map((u: any) => ({
                        value: u.unit_id,
                        label: u.unit_name,
                      }))}
                      allowClear
                    />
                  </div>
                </div>


                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Selling Price
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="mt-1"
                    disabled={row.auto_calculate}
                    value={row.selling_price}
                    onChange={(e) =>
                      updateRow(row.id, {
                        selling_price: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center">
                <Checkbox
                  checked={row.auto_calculate}
                  onChange={(e) =>
                    updateRow(row.id, {
                      auto_calculate: e.target.checked,
                      selling_price: e.target.checked
                        ? calculateSellingPrice(
                            row.cost_price,
                            row.profit_margin
                          )
                        : row.selling_price,
                    })
                  }
                >
                  Auto price from margin
                </Checkbox>

                <Checkbox
                  checked={row.vat_included}
                  onChange={(e) =>
                    updateRow(row.id, { vat_included: e.target.checked })
                  }
                >
                  13% VAT included
                </Checkbox>

                <Button
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => removeRow(row.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Line Total</p>
                <p className="font-semibold">
                  {formatNepaliCurrency(purchaseTotal)}
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
                {formatNepaliCurrency(  grandTotal)}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
