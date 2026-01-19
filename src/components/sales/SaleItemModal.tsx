/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useMemo, useState } from "react";
import { Modal, Select } from "antd";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import dayjs from "dayjs";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";

const VAT_RATE = 0.13;

const EMPTY_FORM = {
  product_id: null,
  batch_id: null,
  quantity: 1,
  quantity_unit_id: null,
  base_unit_id: null,
  base_price: 0,
  selling_price: 0,
  vat_included: false,
};

export default function SaleItemModal({
  open,
  onClose,
  onSave,
  editItem,
}: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);

  /* ---------------- Load Products ---------------- */
  useEffect(() => {
    api.get("/products").then(res => setProducts(res.data || []));
  }, []);

  /* ---------------- Reset / Prefill Form ---------------- */
  useEffect(() => {
    if (!open) return;

    if (editItem) {
      // Merge with EMPTY_FORM to avoid undefined keys
      setForm({
        ...EMPTY_FORM,
        ...editItem,
      });
    } else {
      setAvailability(null);
      setForm(EMPTY_FORM);
    }
  }, [open, editItem]);

  /* ---------------- Fetch Availability ---------------- */
  const fetchAvailability = async (productId: number) => {
    try {
      const res = await api.get(`/products/${productId}/availability`);
      setAvailability(res.data);
    } catch {
      setAvailability(null);
    }
  };

  /* ---------------- Load Availability (EDIT + PRODUCT CHANGE) ---------------- */
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

  /* ---------------- Line Total ---------------- */
  const lineTotal = useMemo(() => {
    const base =
      Number(form.quantity || 0) * Number(form.selling_price || 0);
    return form.vat_included ? base * (1 + VAT_RATE) : base;
  }, [form.quantity, form.selling_price, form.vat_included]);

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
      id: editItem?.id || crypto.randomUUID(),
      product_name: product?.name,
      unit_name: unit?.unit_name,
      batch_no: batch?.batch_no,
    });

    onClose();
  };

  return (
    <Modal
      open={open}
      title={editItem ? "Edit Sale Item" : "Add Sale Item"}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={850}
    >
      <div className="space-y-5">
        {/* Product */}
        <div>
          <label className="text-xs font-medium text-gray-600">Product</label>
          <Select
            showSearch
            className="w-full mt-1"
            placeholder="Select product"
            value={form.product_id ?? undefined}
            onChange={v => {
              setAvailability(null);
              setForm({
                ...EMPTY_FORM,
                ...form,
                product_id: v,
              });
            }}
            options={products.map(p => ({
              value: p.id,
              label: p.name,
            }))}
          />
        </div>

        {/* Availability */}
        {availability && (
          <div className="bg-blue-50 border rounded-lg p-3 text-xs space-y-2">
            <div className="flex justify-between">
              <span>Total Available</span>
              <span className="font-semibold">
                {formatNepaliCurrency(availability.total_base_qty || 0)}
              </span>
            </div>

            <div className="flex gap-3 flex-wrap">
              {(availability.units || []).map((u: any) => (
                <span
                  key={u.unit_id}
                  className="bg-white border px-2 py-1 rounded"
                >
                  {formatNepaliCurrency(u.available || 0)} {u.unit_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Batch */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            Batch (FEFO)
          </label>
          <Select
            className="w-full mt-1"
            placeholder="Select batch"
            value={form.batch_id ?? undefined}
            disabled={!availability}
            onChange={id => {
              if (!availability?.batches) return;

              const b = availability.batches.find(
                (x: any) => x.id === id
              );
              if (!b) return;

              setForm(prev => ({
                ...prev,
                batch_id: b.id,
                quantity_unit_id: b.unit_id,
                base_unit_id: b.unit_id,
                base_price: Number(b.selling_price),
                selling_price: Number(b.selling_price),
                vat_included: b.vat_included ?? false,
              }));
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
        </div>

        {/* Quantity & Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Quantity</label>
            <Input
              type="number"
              min={1}
              value={form.quantity}
              onChange={e =>
                setForm({ ...form, quantity: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Unit</label>
            <Select
              className="w-full mt-1"
              value={form.quantity_unit_id ?? undefined}
              onChange={u => {
                if (!availability?.units) return;

                const price = convertPrice(
                  form.base_price,
                  form.base_unit_id,
                  u,
                  availability.units
                );

                setForm({
                  ...form,
                  quantity_unit_id: u,
                  selling_price: price,
                });
              }}
              options={(availability?.units || []).map((u: any) => ({
                value: u.unit_id,
                label: u.unit_name,
              }))}
            />
          </div>
        </div>

        {/* Price & VAT */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600">
              Selling Price
            </label>
            <Input
              type="number"
              min={0}
              value={form.selling_price}
              onChange={e =>
                setForm({
                  ...form,
                  selling_price: Number(e.target.value),
                })
              }
            />
          </div>

          <label className="flex items-end gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.vat_included}
              onChange={e =>
                setForm({ ...form, vat_included: e.target.checked })
              }
            />
            VAT Included (13%)
          </label>
        </div>

        {/* Line Total */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <p className="text-sm text-gray-500">Line Total</p>
          <p className="text-lg font-semibold">
            {formatNepaliCurrency(lineTotal)}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-[#009966] text-white"
            onClick={handleSave}
          >
            Save Item
          </Button>
        </div>
      </div>
    </Modal>
  );
}
