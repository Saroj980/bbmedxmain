"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Plus } from "lucide-react";
import PartyLedgerForm from "@/components/parties/PartyLedgerForm";
import { supplierColumns } from "./supplier-columns";

export default function SuppliersPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch parties that are suppliers or both
      const res = await api.get("/parties", { params: { type: "supplier,both" } });
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (party: any) => {
    setEditData(party);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditData(null);
    setFormOpen(true);
  };

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQ = searchQuery.toLowerCase();
    return data.filter((item) =>
      item.name?.toLowerCase().includes(lowerQ) ||
      item.phone?.toLowerCase().includes(lowerQ)
    );
  }, [data, searchQuery]);

  const columns = useMemo(() => supplierColumns(handleEdit, router), [router]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Purchases", href: "/dashboard/admin/purchases" },
            { label: "Suppliers" },
          ]}
        />
        <button
          onClick={handleAdd}
          className="bg-[#009966] hover:bg-[#008055] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Supplier
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 w-64">
          <label className="text-xs font-medium text-gray-600">Search Suppliers</label>
          <input
            type="text"
            className="border rounded-md px-3 py-1.5 text-sm"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <DataTable
          title="Suppliers"
          columns={columns}
          data={filteredData}
          loading={loading}
        />
      </div>

      <PartyLedgerForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        refresh={loadData}
        editData={editData}
        defaultIsSupplier={true}
      />
    </div>
  );
}
