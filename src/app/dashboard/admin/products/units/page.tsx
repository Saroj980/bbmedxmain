"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { columns } from "./units-columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UnitForm from "@/components/units/UnitForm";
import type { Unit } from "@/types/unit";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUnits = async () => {
    try {
      const res = await api.get("/units");
      setUnits(res.data.units || res.data.data || res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const unitColumns = useMemo(
    () => columns(setEditUnit, setOpenForm, loadUnits),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Products", href: "/dashboard/admin/products" },
            { label: "Units" },
          ]}
        />

        <Button
          className="bg-[#009966] text-white"
          onClick={() => {
            setEditUnit(null);
            setOpenForm(true);
          }}
        >
          <Plus size={16} className="mr-2" /> Add Unit
        </Button>
      </div>

      <DataTable
        title="Units"
        columns={unitColumns}
        data={units}
        loading={loading}
        pageSize={10000}
        disablePagination={true}
        emptyMessage="No records found."
      />

      <UnitForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        editData={editUnit}
        refresh={loadUnits}
      />
    </div>
  );
}
