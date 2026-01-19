"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { productColumns } from "./product-columns";
import ProductFormDrawer from "@/components/products/ProductFormDrawer";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try{
      const res = await api.get("/products");
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const columns = useMemo(
    () => productColumns(setEditItem, setOpenForm, loadProducts),
    []
  );

  return (
    <div className="space-y-6">
     

      <div className="flex justify-between items-center">
         <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Products" },
        ]}
      />

        <Button
          className="bg-[#009966] text-white"
          onClick={() => {
            setEditItem(null);
            setOpenForm(true);
          }}
        >
          <Plus className="mr-2" size={16} /> Add Product
        </Button>
      </div>

      <DataTable
        title="Product List"
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No products found."
        pageSize={9999}
        disablePagination
      />



      <ProductFormDrawer
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={loadProducts}
        editData={editItem}
      />
    </div>
  );
}
