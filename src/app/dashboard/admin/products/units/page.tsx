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
    () => columns(setEditUnit, setOpenForm),
    []
  );

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Breadcrumb */}
      {/* <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Products", href: "/dashboard/admin/products" },
          { label: "Units" },
        ]}
      /> */}

      {/* Header */}
      <div className="flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Products", href: "/dashboard/admin/products" },
            { label: "Units" },
          ]}
        />

        <Button
          className="bg-[#009966] text-white hover:bg-[#008456] rounded-lg"
          onClick={() => {
            setEditUnit(null);
            setOpenForm(true);
          }}
        >
          <Plus size={18} className="mr-2" /> Add Unit
        </Button>
      </div>

      {/* DataTable with loading */}
      <DataTable
        title="Units List"
        columns={unitColumns}
        data={units}
        loading={loading}
      />

      {/* Drawer Form */}
      <UnitForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        editData={editUnit}
        refresh={loadUnits}
      />
    </div>
  );
}
