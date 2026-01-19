/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { TreeSelect, Checkbox,DatePicker } from "antd";
// import { DatePicker } from "antd";
import dayjs from "dayjs";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Warehouse } from "lucide-react";
import { api } from "@/lib/api";
import { buildLocationTree, LocationNode } from "@/utils/locationTree";

const VAT_RATE = 0.13;
const EXPIRY_WARNING_DAYS = 90;

function getExpiryInfo(expiryDate: string | null) {
  if (!expiryDate) return null;

  const today = dayjs().startOf("day");
  const expiry = dayjs(expiryDate).startOf("day");

  const diffDays = expiry.diff(today, "day");

  if (diffDays < 0) {
    return { status: "expired", days: diffDays };
  }

  if (diffDays <= EXPIRY_WARNING_DAYS) {
    return { status: "warning", days: diffDays };
  }

  return { status: "ok", days: diffDays };
}


export type OpeningStockItem = {
  id: string;
  location_id: number | null;
  batch_no: string;
  expiry_date: string | null;
  manufactured_date: string | null;
  quantity: number;
  purchase_price: number;
  profit_margin?: number | null; // %;
  selling_price: number;
  auto_calculate: boolean;
  vat_included: boolean;
};

type Props = {
  value: OpeningStockItem[];
  onChange: (val: OpeningStockItem[]) => void;
};

export default function OpeningStockSection({ value, onChange }: Props) {
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  const calculateSellingPrice = (
    cost: number,
    margin?: number | null
  ) => {
    if (!margin) return 0;
    return Number((cost * (1 + margin / 100)).toFixed(2));
  };
  
  console.log("Opening Stock Value:", value);


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



  /* ---------------- Helpers ---------------- */
  const addRow = () => {
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        location_id: null,
        batch_no: "",
        expiry_date: null,
        manufactured_date: null,
        quantity: 1,
        purchase_price: 0,
        selling_price: 0,
        vat_included: false,
        auto_calculate: true
      },
    ]);
  };

  const updateRow = (id: string, patch: Partial<OpeningStockItem>) => {
    onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    onChange(value.filter((r) => r.id !== id));
  };

  const getPurchaseUnitPrice = (row: OpeningStockItem) => {
    return row.vat_included
      ? row.purchase_price * (1 + VAT_RATE)
      : row.purchase_price;
  };

  const getSellingUnitPrice = (row: OpeningStockItem) => {
    return row.vat_included
      ? row.selling_price * (1 + VAT_RATE)
      : row.selling_price;
  };

  /* ---------------- Calculations ---------------- */
  const calcPurchaseTotal = (r: OpeningStockItem) => {
    // const base = r.quantity * r.purchase_price;
    // return r.vat_included ? base * (1 + VAT_RATE) : base;
    return r.quantity * getPurchaseUnitPrice(r);
  };

  const calcSellingTotal = (r: OpeningStockItem) => {
      // const base = r.quantity * r.selling_price;
      // return r.vat_included ? base * (1 + VAT_RATE) : base;
      return r.quantity * getSellingUnitPrice(r);
  };

  const grandTotals = useMemo(() => {
    return value.reduce(
      (acc, r) => {
        acc.purchase += calcPurchaseTotal(r);
        acc.selling += calcSellingTotal(r);
        return acc;
      },
      { purchase: 0, selling: 0 }
    );
  }, [value]);
  
  


  /* ---------------- Render ---------------- */
  return (
    <section className="pt-6 border-t space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-gray-700 flex items-center gap-2">
            <Warehouse size={18} />
            Opening Stock & Storage
          </h4>
          <p className="text-xs text-gray-400">
            Define opening stock by location & batch (one-time setup)
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus size={14} className="mr-1" />
          Add Stock
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-gray-400 italic">
          No opening stock added yet.
        </p>
      )}

      {/* Cards */}
      <div className="space-y-4">
        {value.map((row) => {
          const purchaseTotal = calcPurchaseTotal(row);
          const sellingTotal = calcSellingTotal(row);

          const expiryInfo = getExpiryInfo(row.expiry_date);

{/* <div
  key={row.id}
  className={`
    rounded-xl border shadow-sm p-5 space-y-5 transition
    ${
      expiryInfo?.status === "expired"
        ? "border-red-400 bg-red-50"
        : expiryInfo?.status === "warning"
        ? "border-orange-400 bg-orange-50"
        : "bg-white"
    }
  `}
> */}


          return (
            <div
              key={row.id}
              className={`
                    rounded-xl border shadow-sm p-5 space-y-5 transition
                    ${
                      expiryInfo?.status === "expired"
                        ? "border-red-400 bg-red-50"
                        : expiryInfo?.status === "warning"
                        ? "border-orange-400 bg-orange-50"
                        : "bg-white"
                    }
                  `}
            >
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Storage Location
                  </label>
                  <TreeSelect
                    className="w-full mt-1"
                    treeData={locations}
                    value={row.location_id ?? undefined}
                    placeholder="Select location"
                    loading={loadingLocations}
                    allowClear
                    showSearch
                    treeDefaultExpandAll
                    onChange={(v) =>
                      updateRow(row.id, {
                        location_id: v ? Number(v) : null,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Batch No / ID
                  </label>
                  <Input
                    className="mt-1"
                    value={row.batch_no}
                    placeholder="Enter product batch id / no"
                    onChange={(e) =>
                      updateRow(row.id, { batch_no: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Manufactured Date
                  </label>
                  {/* <Input
                    type="date"
                    className="mt-1"
                    value={row.manufactured_date ?? ""}
                    onChange={(e) =>
                      updateRow(row.id, { manufactured_date: e.target.value })
                    }
                  /> */}

                  <DatePicker
                    className="w-full mt-1"
                    format="YYYY-MM-DD"
                    placeholder="Select Manufactured Date"
                    value={row.manufactured_date ? dayjs(row.manufactured_date) : null}
                    onChange={(date) =>
                      updateRow(row.id, {
                        manufactured_date: date ? date.format("YYYY-MM-DD") : null,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Expiry Date
                  </label>
                  {/* <Input
                    type="date"
                    className="mt-1"
                    value={row.expiry_date ?? ""}
                    onChange={(e) =>
                      updateRow(row.id, { expiry_date: e.target.value })
                    }
                  /> */}
                  <DatePicker
                    className="w-full mt-1"
                    format="YYYY-MM-DD"
                    placeholder="Select Expiry Date"
                    value={row.expiry_date ? dayjs(row.expiry_date) : null}
                    onChange={(date) =>
                      updateRow(row.id, {
                        expiry_date: date ? date.format("YYYY-MM-DD") : null,
                      })
                    }
                  />
                  {expiryInfo && (
                    <div className="mt-1">
                      {expiryInfo.status === "expired" && (
                        <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">
                          Expired {Math.abs(expiryInfo.days)} days ago
                        </span>
                      )}

                      {expiryInfo.status === "warning" && (
                        <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                          Expires in {expiryInfo.days} days
                        </span>
                      )}

                      {expiryInfo.status === "ok" && (
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          {expiryInfo.days} days remaining
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                {/* Purchase Price */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Purchase Price
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="mt-1"
                    value={row.purchase_price}
                    onChange={(e) => {
                      const cost = Number(e.target.value);
                      updateRow(row.id, {
                        purchase_price: cost,
                        selling_price: row.auto_calculate
                          ? calculateSellingPrice(cost, row.profit_margin)
                          : row.selling_price,
                      });
                    }}
                  />
                  {row.vat_included && (
                    <p className="text-xs text-gray-500 mt-1">
                      VAT incl. price: {(row.purchase_price * (1 + VAT_RATE)).toFixed(2)}
                    </p>
                  )}
                </div>
                
                {/* Profit Margin */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                   {row.profit_margin} Profit Margin (%)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="mt-1"
                    value={row.profit_margin ?? ""}
                    placeholder="e.g. 20"
                    onChange={(e) => {
                      const margin = Number(e.target.value);

                      updateRow(row.id, {
                        profit_margin: margin,
                        selling_price: row.auto_calculate
                          ? calculateSellingPrice(row.purchase_price, margin)
                          : row.selling_price,
                      });
                    }}
                  />
                  
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min={1}
                    className="mt-1"
                    value={row.quantity}
                    onChange={(e) =>
                      updateRow(row.id, {
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                </div>

                {/* ✅ Selling Price (RIGHT SIDE) */}
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

              {/* VAT + Auto + Remove */}
              <div className="flex justify-between items-center mt-3">
                <Checkbox
                  checked={row.auto_calculate}
                  onChange={(e) =>
                    updateRow(row.id, {
                      auto_calculate: e.target.checked,
                      selling_price: e.target.checked
                        ? calculateSellingPrice(
                            row.purchase_price,
                            row.profit_margin
                          )
                        : row.selling_price,
                    })
                  }
                >
                  <span className="text-sm text-gray-700">
                    Auto price from margin
                  </span>
                </Checkbox>

                <Checkbox
                  checked={row.vat_included}
                  onChange={(e) =>
                    updateRow(row.id, { vat_included: e.target.checked })
                  }
                >
                  <span className="text-sm">13% VAT included</span>
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
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Purchase</p>
                  <p className="font-semibold text-gray-800">
                    {purchaseTotal.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total Selling</p>
                  <p className="font-semibold text-gray-800">
                    {sellingTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand Totals */}
      {value.length > 0 && (
        <div className="mt-6 border-t pt-4 flex justify-end">
          <div className="bg-[#F6FAF8] border rounded-xl p-4 w-full md:w-1/2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Grand Purchase Total</span>
              <span className="font-semibold">
                {grandTotals.purchase.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Grand Selling Total</span>
              <span className="font-semibold">
                {grandTotals.selling.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
