"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { fieldColumns } from "./product-field-columns";
import FieldForm from "@/components/product-fields/FieldForm";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { ProductFieldDefinition } from "@/types/product-field";

export default function ProductFieldPage() {
  const [data, setData] = useState<ProductFieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<ProductFieldDefinition | null>(null);

  const loadFields = async () => {
    setLoading(true);
    try{
    const res = await api.get("/product-fields");
    setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const columns = useMemo(
    () => fieldColumns(setEditItem, setOpenForm, loadFields),
    []
  );

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Products", href: "/dashboard/admin/products" },
            { label: "Field Definitions" },
          ]}
        />

        <Button
          className="bg-[#009966] text-white"
          onClick={() => {
            setEditItem(null);
            setOpenForm(true);
          }}
        >
          <Plus className="mr-2" size={16} /> Add Field
        </Button>
      </div>

      <DataTable
        title="Field Definations"
        columns={columns}
        data={data}
        loading={loading}
        pageSize={9999}
        disablePagination
      />

      <FieldForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={loadFields}
        editData={editItem}
      />
    </div>
  );
}
