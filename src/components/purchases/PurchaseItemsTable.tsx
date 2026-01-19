import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker, Select, Checkbox } from "antd";
import { Plus, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { PurchaseItem } from "@/types/purchase-item";
import { Product } from "@/types/product";

const VAT_RATE = 0.13;

export default function PurchaseItemsSection({
  value,
  onChange,
  products,
}: {
  value: PurchaseItem[];
  onChange: (v: PurchaseItem[]) => void;
  products: Product[];
}) {

  const addRow = () => {
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        product_id: null,
        batch_no: "",
        expiry_date: null,
        quantity: 1,
        cost_price: 0,
        vat_included: false,
        vat_amount: 0,
        profit_margin: null,
        selling_price: 0,
        location_id: null,
        manufactured_date: null,
        expiry_mode: "date",
        auto_calculate: false
      },
    ]);
  };

  const updateRow = (id: string, patch: Partial<PurchaseItem>) => {
    onChange(value.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const removeRow = (id: string) => {
    onChange(value.filter(r => r.id !== id));
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-700">Purchase Items</h4>
        <Button size="sm" variant="outline" onClick={addRow}>
          <Plus size={14} className="mr-1" /> Add Item
        </Button>
      </div>

      {value.map(row => (
        <div key={row.id} className="border rounded-xl p-4 space-y-4 bg-white">
          
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              showSearch
              placeholder="Select Product"
              className="w-full"
              optionFilterProp="label"
              value={row.product_id ?? undefined}
              onChange={(v) => updateRow(row.id, { product_id: v })}
              options={products.map(p => ({
                value: p.id,
                label: p.name,
              }))}
            />

            <Input
              placeholder="Batch No"
              value={row.batch_no}
              onChange={(e) =>
                updateRow(row.id, { batch_no: e.target.value })
              }
            />

            <DatePicker
              className="w-full"
              placeholder="Expiry Date"
              value={row.expiry_date ? dayjs(row.expiry_date) : null}
              onChange={(d) =>
                updateRow(row.id, {
                  expiry_date: d ? d.format("YYYY-MM-DD") : null,
                })
              }
            />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <Input
              type="number"
              min={1}
              placeholder="Qty"
              value={row.quantity}
              onChange={(e) =>
                updateRow(row.id, { quantity: Number(e.target.value) })
              }
            />

            <Input
              type="number"
              min={0}
              placeholder="Cost Price"
              value={row.cost_price}
              onChange={(e) => {
                const cost = Number(e.target.value);
                const vat = row.vat_included ? cost * VAT_RATE * row.quantity : 0;

                updateRow(row.id, {
                  cost_price: cost,
                  vat_amount: vat,
                });
              }}
            />

            <Input
              type="number"
              placeholder="Profit %"
              value={row.profit_margin ?? ""}
              onChange={(e) => {
                const m = Number(e.target.value);
                updateRow(row.id, {
                  profit_margin: m,
                  selling_price: costWithMargin(row.cost_price, m),
                });
              }}
            />

            <Input
              type="number"
              placeholder="Selling Price"
              value={row.selling_price}
              onChange={(e) =>
                updateRow(row.id, { selling_price: Number(e.target.value) })
              }
            />
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center">
            <Checkbox
              checked={row.vat_included}
              onChange={(e) =>
                updateRow(row.id, {
                  vat_included: e.target.checked,
                  vat_amount: e.target.checked
                    ? row.cost_price * VAT_RATE * row.quantity
                    : 0,
                })
              }
            >
              VAT Included
            </Checkbox>

            <Button
              variant="ghost"
              className="text-red-600"
              onClick={() => removeRow(row.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ))}
    </section>
  );
}

function costWithMargin(cost: number, margin?: number | null) {
  if (!margin) return 0;
  return Number((cost * (1 + margin / 100)).toFixed(2));
}
