"use client";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export default function SaleItemsTable({ items, onEdit, onRemove }: any) {
  if (!items?.length) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 text-center text-gray-500 italic">
        No sale items added yet.
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Batch</th>
            <th className="p-3 text-right">Qty</th>
            <th className="p-3 text-right">Price</th>
            <th className="p-3 text-right">Total</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, idx: number) => (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{idx + 1}</td>
              <td className="p-3">{item.product_name}</td>
              <td className="p-3">{item.batch_no || "-"}</td>
              <td className="p-3 text-right">
                {item.quantity} {item.unit_name}
              </td>
              <td className="p-3 text-right">
                {formatNepaliCurrency(item.selling_price)}
              </td>
              <td className="p-3 text-right font-semibold">
                {formatNepaliCurrency(
                  item.quantity * item.selling_price * (item.vat_included ? 1.13 : 1)
                )}
              </td>
              <td className="p-3 text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
