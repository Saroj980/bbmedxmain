"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import PurchaseForm from "@/components/purchases/PurchaseForm";
import { purchaseColumns } from "./purchase-column";

export default function PurchasesPage() {
//   const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  
  const loadPurchases = async (page = 1) => {
    setLoading(true);
    try {
        const res = await api.get("/purchases", {
        params: { page },
        });

        setData(res.data.data || []);
        setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        per_page: res.data.per_page,
        total: res.data.total,
        });
    } finally {
        setLoading(false);
    }
};


//   const loadPurchases = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get("/purchases");
//       setData(res.data || []);
//     } finally {
//       setLoading(false);
//     }
//   };

  useEffect(() => {
    loadPurchases();
  }, []);

  const columns = useMemo(
    () => purchaseColumns(loadPurchases),
    [loadPurchases]
);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Accounting" },
            { label: "Purchases" },
          ]}
        />

        <Button
          className="bg-[#009966] text-white"
          onClick={() => setOpenForm(true)}
        >
          <Plus size={16} className="mr-2" />
          New Purchase
        </Button>
      </div>

      <DataTable
        title="Purchase Invoices"
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No purchases found."
        pagination={{
            currentPage: pagination?.current_page,
            pageSize: pagination?.per_page,
            total: pagination?.total,
            onPageChange: (page) => loadPurchases(page),
        }}
        />


      <PurchaseForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={loadPurchases}
      />
    </div>
  );
}
