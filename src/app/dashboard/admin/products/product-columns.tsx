"use client";

import type { Product, ProductUnit } from "@/types/product";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2, Package, Barcode } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Checkbox, Tooltip } from "antd";

export function formatUnitChain(units: ProductUnit[]): string {
  if (!units || units.length === 0) return "-";
  if (units.length === 1) return units[0].unit;

  const sorted = [...units].sort((a, b) => a.level - b.level);
  const chainParts: string[] = [];
  const mathFactors: number[] = [];
  let cumulativeFactor = 1;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    if (i === 0) {
      chainParts.push(`1 ${current.unit}`);
      cumulativeFactor = 1;
    } else {
      cumulativeFactor *= current.conversion_factor;
      mathFactors.push(current.conversion_factor);

      if (i === sorted.length - 1 && mathFactors.length > 1) {
        chainParts.push(`${cumulativeFactor} ${current.unit}(s)`);
      } else {
        chainParts.push(`${current.conversion_factor} ${current.unit}(s)`);
      }
    }
  }

  return chainParts.join(" - ");
}

export function formatStockBreakdown(totalBaseStock: number, units: ProductUnit[]): string {
  if (!units || units.length === 0) return String(totalBaseStock);
  if (units.length === 1) return `${totalBaseStock} ${units[0].unit}`;

  const sorted = [...units].sort((a, b) => a.level - b.level);
  const capacities: number[] = new Array(sorted.length).fill(1);
  
  for (let i = sorted.length - 2; i >= 0; i--) {
    capacities[i] = capacities[i + 1] * sorted[i + 1].conversion_factor;
  }

  let remaining = totalBaseStock;
  const breakdown: string[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const qty = Math.floor(remaining / capacities[i]);
    if (qty > 0) {
      breakdown.push(`${qty} ${sorted[i].unit}`);
      remaining = remaining % capacities[i];
    }
  }

  if (breakdown.length === 0) return `0 ${sorted[sorted.length - 1].unit}`;
  return breakdown.join(", ");
}

export const productColumns = (
  setEdit: (p: Product) => void,
  setOpen: (v: boolean) => void,
  refresh: () => void
): ColumnDef<Product>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <span className="font-semibold text-gray-800">{p.name}</span>
      );
    },
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => {
      return (
        <span className="font-medium text-gray-700">{row.original.sku}</span>
      );
    }
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => {
      const cat = row.original.category?.name;
      if (!cat) return "-";
      return (
        <Tooltip title={cat}>
          <span className="inline-block max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[11px] font-medium rounded-md">
            {cat}
          </span>
        </Tooltip>
      );
    },
  },
  {
    id: "brand",
    header: "Brand",
    cell: ({ row }) => <span className="text-gray-600 text-sm">{row.original.brand || "-"}</span>,
  },
  {
    id: "units",
    header: "Unit",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {formatUnitChain(row.original.units)}
      </span>
    ),
  },
  {
    id: "stock",
    header: () => (
      <div className="flex flex-col text-left">
        <span>Stock</span>
        <span className="text-[10px] text-gray-400 font-normal">Available</span>
      </div>
    ),
    cell: ({ row }) => {
      const batches = row.original.batches || [];
      const totalStock = batches.reduce((sum, b) => sum + (Number(b.current_stock) || 0), 0);
      
      let stockColor = "text-green-600";
      if (totalStock === 0) stockColor = "text-red-500";
      else if (totalStock < 50) stockColor = "text-orange-500";

      const units = row.original.units || [];
      const stockBreakdown = formatStockBreakdown(totalStock, units);

      return (
        <div className="flex flex-col">
          <span className={`font-semibold ${stockColor}`}>{totalStock}</span>
          <span className="text-[11px] text-gray-500 whitespace-nowrap">({stockBreakdown})</span>
        </div>
      );
    }
  },
  {
    id: "cost_price",
    header: () => (
      <div className="flex flex-col text-right">
        <span>Cost Price</span>
        <span className="text-[10px] text-gray-400 font-normal">(NPR)</span>
      </div>
    ),
    cell: ({ row }) => {
      const batches = row.original.batches || [];
      const cost = batches.length > 0 ? batches[0].purchase_price : 0;
      return (
        <div className="text-right font-medium text-gray-700">
          {Number(cost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      );
    }
  },
  {
    id: "sale_price",
    header: () => (
      <div className="flex flex-col text-right">
        <span>Sale Price</span>
        <span className="text-[10px] text-gray-400 font-normal">(NPR)</span>
      </div>
    ),
    cell: ({ row }) => {
      const batches = row.original.batches || [];
      const sale = batches.length > 0 ? batches[0].selling_price : 0;
      return (
        <div className="text-right font-medium text-gray-700">
          {Number(sale).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      );
    }
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const batches = row.original.batches || [];
      const totalStock = batches.reduce((sum, b) => sum + (Number(b.current_stock) || 0), 0);
      
      if (!row.original.is_active) {
         return <span className="whitespace-nowrap px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-medium rounded-md">Inactive</span>;
      }
      
      if (totalStock === 0) {
        return <span className="whitespace-nowrap px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 text-xs font-medium rounded-md">Out of Stock</span>;
      } else if (totalStock < 50) {
        return <span className="whitespace-nowrap px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 text-xs font-medium rounded-md">Low Stock</span>;
      }
      return <span className="whitespace-nowrap px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 text-xs font-medium rounded-md">Active</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;

      const handleDelete = async () => {
        if (!confirm("Delete this product?")) return;
        try {
          await api.delete(`/products/${item.id}`);
          toast.success("Product deleted");
          refresh();
        } catch {
          toast.error("Delete failed");
        }
      };

      return (
        <div className="flex items-center gap-2 text-gray-400">
          <Tooltip title="View Details">
            <Link href={`/dashboard/admin/products/${item.id}`} className="hover:text-blue-600 transition-colors cursor-pointer block">
              <Eye size={16} />
            </Link>
          </Tooltip>
          <Tooltip title="Edit Product">
            <button
              className="hover:text-blue-600 transition-colors cursor-pointer"
              onClick={() => {
                setEdit(item);
                setOpen(true);
              }}
            >
              <Pencil size={16} />
            </button>
          </Tooltip>
          <Tooltip title="Delete Product">
            <button
              className="hover:text-red-600 transition-colors cursor-pointer"
              onClick={handleDelete}
            >
              <Trash2 size={16} />
            </button>
          </Tooltip>
        </div>
      );
    },
  },
];
