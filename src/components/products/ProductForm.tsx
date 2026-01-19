/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
// import CategoryTreeSelect from "./CategoryTreeSelect";
import { TreeSelect } from "antd";
import { useCategoryTree } from "@/hooks/useCategoryTree";

import ProductUnitLevelsBuilder from "./ProductUnitLevelsBuilder";
import DynamicProductFields from "./DynamicProductFields";
import OpeningStockSection from "./OpeningStockSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ProductFormContent({ editData, refresh, onClose }: any) {
  const [name, setName] = useState(editData?.name ?? "");
  const [sku, setSku] = useState(editData?.sku ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(
    editData?.category_id ?? null
  );

  const [units, setUnits] = useState<any[]>([]);
  const [dynamicFields, setDynamicFields] = useState<Record<string, any>>({});


  const [loading, setLoading] = useState(false);

  const [openingStock, setOpeningStock] = useState<any[]>(
    editData?.opening_stock ?? []
  );

  useEffect(() => {
    if (!editData) {
      // NEW PRODUCT → RESET EVERYTHING
      setName("");
      setSku("");
      setCategoryId(null);
      setDynamicFields({});
      setUnits([]);
      setOpeningStock([]);
      return;
    }

    setName(editData.name ?? "");
    setSku(editData.sku ?? "");
    setCategoryId(editData.category_id ?? null);

    // meta may come as string "[]"
    let meta = {};
    if (editData.meta && typeof editData.meta === "object") {
      meta = editData.meta;
    }

    setDynamicFields(meta);


    // unit levels
    setUnits(editData.unit_levels ?? []);

    // opening stock
    setOpeningStock(editData.opening_stock ?? []);

    // MAP product_units → unit_levels
    setUnits(
      Array.isArray(editData.product_units)
        ? editData.product_units
            .sort((a: any, b: any) => a.level - b.level)
            .map((u: any) => ({
              id: u.id,
              level: u.level,
              unit_id: u.unit_id,
              conversion_factor: u.conversion_factor,
            }))
        : []
    );

     // MAP batches → opening_stock
    setOpeningStock(
      Array.isArray(editData.batches)
        ? editData.batches.map((b: any) => ({
            id: crypto.randomUUID(), // UI-only key
            location_id:
              b.stock_movements?.[0]?.location_id ?? null,
            batch_no: b.batch_no,
            manufactured_date: b.manufactured_at
              ? b.manufactured_at.slice(0, 10)
              : null,
            expiry_date: b.expiry_date
              ? b.expiry_date.slice(0, 10)
              : null,
            quantity: b.opening_stock ?? 0,
            purchase_price: Number(b.cost_price),
            selling_price: Number(b.selling_price),
            vat_included: Boolean(b.vat_included),
            profit_margin: Number(b.profit_margin),
            auto_calculate: Boolean(b.is_auto_calculated),
          }))
        : []
    );

  }, [editData]);

  // useEffect(() => {
  //   if (!editData?.meta) return;

  //   setDynamicFields(prev => {
  //     // preserve user edits
  //     if (Object.keys(prev).length > 0) return prev;
  //     return editData.meta;
  //   });
  // }, [editData]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Name required");
    const meta = dynamicFields && typeof dynamicFields === "object" && !Array.isArray(dynamicFields)
      ? dynamicFields
      : {};

    console.log("FINAL META:", meta);
    // if (!sku.trim()) return toast.error("SKU required");

    console.log("FINAL META:", dynamicFields);

    if (!dynamicFields || Object.keys(dynamicFields).length === 0) {
      toast.error("Dynamic fields are empty");
      return;
    }

    const payload = {
      name,
      category_id: categoryId,
      meta: dynamicFields, // dictionary + dynamic fields saved here
      unit_levels: units,
      opening_stock: openingStock
    };
    console.log(payload);

    try {
      setLoading(true);

      if (editData) {
        await api.put(`/products/${editData.id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post(`/product`, payload);
        toast.success("Product added");
      }

      refresh();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const { treeData } = useCategoryTree();


  return (
    <div className="space-y-6 text-sm">

      {/* ---------------- Basic Info ---------------- */}
      <section className="space-y-3 pt-0">
        {/* <h4 className="font-medium text-gray-700">Basic Information</h4> */}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Product Name" />
          </div>

          {/* <div>
            <label>SKU</label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Product SKU Value" />
          </div> */}
          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>

            <div className="mt-1">
              <TreeSelect
                className="w-full text-sm"
                treeData={treeData}
                value={categoryId ?? undefined}
                placeholder="Select category"
                allowClear
                showSearch
                treeDefaultExpandAll
                loading={loading}
                onChange={(v) => setCategoryId(v ? Number(v) : null)}
                filterTreeNode={(input, node) =>
                  (node.title as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </div>
          </div>

          {/* <div className="col-span-2">
            <label>Category</label>
            <CategoryTreeSelect value={categoryId} onChange={setCategoryId} />
          </div> */}
         

        </div>
      </section>

      {/* ---------------- Dynamic / Dictionary Fields ---------------- */}
      <section className="pt-4 border-t">
        {/* <h4 className="font-medium text-gray-700 mb-2">
          Additional Fields
        </h4> */}

        <DynamicProductFields
          categoryId={categoryId}     // FIXED
          value={dynamicFields}
          onChange={setDynamicFields}
        />
      </section>

      {/* ---------------- Unit Levels ---------------- */}
      <section className="pt-4 border-t space-y-3">
        <h4 className="font-medium text-gray-700">Unit Levels</h4>

        <ProductUnitLevelsBuilder
          productId={editData?.id ?? null}
          value={units}
          onChange={setUnits}
        />
      </section>

      <OpeningStockSection
        value={openingStock}
        onChange={setOpeningStock}
      />


      {/* ---------------- Footer ---------------- */}
      <div className="pt-5 border-t flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>

        <Button
          className="bg-[#009966] text-white"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving…" : editData ? "Update" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}
