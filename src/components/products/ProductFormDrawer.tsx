/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ProductFormContent from "./ProductForm";
import { api } from "@/lib/api";

export default function ProductFormDrawer({ open, onClose, refresh, editData }: any) {
  const [fullData, setFullData] = useState<any>(null);
  useEffect(() => {
    if (open && editData?.id) {
      api.get(`/products/${editData.id}`).then(res => {
        setFullData({
          ...res.data.product, // 🔥 FLATTEN PRODUCT
          meta: res.data.meta, // 🔥 ATTACH META
        });
      });
    } else {
      try{
      setFullData(null);
      } finally {}
    }
  }, [open, editData]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 right-0 z-50 h-full w-full sm:w-[750px] bg-white 
          shadow-2xl transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold">
            {editData ? "Edit Product" : "Add Product"}
          </h3>
          <button className="p-2 hover:bg-gray-100 rounded" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-70px)] overflow-y-auto p-6 pt-0">
          <ProductFormContent
            editData={fullData}
            refresh={refresh}
            onClose={onClose}
          />
        </div>
      </aside>
    </>
  );
}
