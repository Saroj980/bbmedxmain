"use client";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, AlertCircle } from "lucide-react";

export default function SaleItemsTable({ items, onEdit, onRemove, onAddBonus }: any) {
  const VAT_RATE = 0.13;

  if (!items?.length) {
    return (
      <div className="border rounded-xl p-12 bg-gray-50/20 text-center text-gray-400 italic">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle size={24} className="opacity-10" />
          No sale items added yet. Click "Add Item" to begin.
        </div>
      </div>
    );
  }

  const grandTotal = items.reduce((sum: number, item: any) => {
    const lineBase = item.inventory_value ?? ((Number(item.quantity) || 0) * (Number(item.selling_price) || 0));
    const lineVat = item.vat_included ? lineBase * VAT_RATE : 0;
    return sum + lineBase + lineVat;
  }, 0);

  return (
    <div className="overflow-x-auto border rounded-xl bg-white shadow-sm ring-1 ring-black ring-opacity-5">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase tracking-tighter font-extrabold border-b">
            <th className="px-2 py-3 text-left w-8">S.N.</th>
            <th className="px-2 py-3 text-left">Product / Description</th>
            <th className="px-2 py-3 text-center">HS Code</th>
            <th className="px-2 py-3 text-center">Batch</th>
            <th className="px-2 py-3 text-right">MRP</th>
            <th className="px-2 py-3 text-right">Landed</th>
            <th className="px-2 py-3 text-right">Margin</th>
            <th className="px-2 py-3 text-right">Qty</th>
            <th className="px-2 py-3 text-right">Orig. Rate</th>
            <th className="px-2 py-3 text-right">Discount</th>
            <th className="px-2 py-3 text-right">Final Rate</th>
            <th className="px-2 py-3 text-right">Amount</th>
            <th className="px-2 py-3 text-right">VAT (13%)</th>
            <th className="px-2 py-3 text-right font-black bg-green-50/50">Total</th>
            <th className="px-2 py-3 text-center w-20">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item: any, idx: number) => {
            const lineBase = item.inventory_value ?? (item.quantity * item.selling_price);
            const lineVat = item.vat_included ? lineBase * VAT_RATE : 0;
            const lineTotal = lineBase + lineVat;

            return (
              <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                <td className="px-2 py-3 text-gray-400">{idx + 1}</td>
                <td className="px-2 py-3">
                  <p className="font-bold text-gray-900 leading-tight">{item.product_name}</p>
                </td>
                <td className="px-2 py-3 text-center">
                  <span className="text-[10px] text-gray-600">
                    {item.hs_code || "—"}
                  </span>
                </td>
                <td className="px-2 py-3 text-center">
                  <span className="text-[10px] text-primary bg-primary/10 px-1 rounded">
                    {item.batch_no || "—"}
                  </span>
                </td>
                <td className="px-2 py-3 text-right text-gray-600 font-medium">
                  {item.mrp > 0 ? formatNepaliCurrency(item.mrp) : "—"}
                </td>
                <td className="px-2 py-3 text-right text-gray-500">
                  {item.landed_cost > 0 ? formatNepaliCurrency(item.landed_cost) : "—"}
                </td>
                <td className="px-2 py-3 text-right text-[10px] text-blue-600 font-semibold bg-blue-50/30">
                  {item.profit_margin ? `${Number(item.profit_margin).toFixed(1)}%` : "—"}
                </td>
                <td className="px-2 py-3 text-right">
                  <span className="font-bold text-gray-900">{item.quantity}</span>
                  <span className="text-[9px] text-gray-500 ml-0.5">
                    {item.unit_name}
                  </span>
                  {item.free_qty > 0 && (
                    <div className="text-[9px] font-bold text-indigo-600 mt-0.5 bg-indigo-50 rounded px-1 inline-block">
                      + {item.free_qty} Free
                    </div>
                  )}
                </td>
                <td className="px-2 py-3 text-right text-gray-400 line-through">
                  {formatNepaliCurrency(item.original_price || item.selling_price)}
                </td>
                <td className="px-2 py-3 text-right">
                  {item.discount_amount > 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="text-red-500 font-bold">-{formatNepaliCurrency(item.discount_amount)}</span>
                      <span className="text-[9px] text-gray-400">({(item.discount_percent || 0).toFixed(1)}%)</span>
                    </div>
                  ) : "—"}
                </td>
                <td className="px-2 py-3 text-right text-gray-900 font-bold">
                  {formatNepaliCurrency(item.selling_price)}
                </td>
                <td className="px-2 py-3 text-right text-gray-600">
                  {formatNepaliCurrency(lineBase)}
                </td>
                <td className="px-2 py-3 text-right text-orange-600">
                  {lineVat > 0 ? formatNepaliCurrency(lineVat) : "0.00"}
                </td>
                <td className="px-2 py-3 text-right font-black text-green-700 bg-green-50/10">
                  {formatNepaliCurrency(lineTotal)}
                </td>
                <td className="px-2 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                      title="Edit Item"
                    >
                      <Pencil size={13} />
                    </button>
                    {!item.is_bonus_item && (
                      <button
                        onClick={() => onAddBonus && onAddBonus(item)}
                        className="p-1 text-indigo-500 hover:bg-indigo-100 rounded transition-colors"
                        title="Add Bonus Product"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect width="20" height="5" x="2" y="7"></rect><line x1="12" x2="12" y1="22" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                      </button>
                    )}
                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50/50 font-medium text-gray-500 border-t border-gray-200">
            <td colSpan={13} className="px-4 py-2 text-right text-[10px] uppercase tracking-wider">
              Taxable Amount
            </td>
            <td className="px-2 py-2 text-right text-xs text-gray-900">
              {formatNepaliCurrency(
                items.reduce((sum: number, i: any) => i.vat_included ? sum + (i.inventory_value ?? (i.quantity * i.selling_price)) : sum, 0)
              )}
            </td>
            <td></td>
          </tr>
          <tr className="bg-gray-100 font-black text-gray-800 border-t-2 border-gray-200">
            <td colSpan={13} className="px-4 py-3 text-right text-[10px] uppercase tracking-widest">
              Grand Total (Incl. VAT)
            </td>
            <td className="px-2 py-3 text-right text-xs text-green-900 bg-green-200/50">
              {formatNepaliCurrency(grandTotal)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
