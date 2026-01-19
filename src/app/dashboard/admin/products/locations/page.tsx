/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { buildLocationTree } from "./tree-build-locations";
import { flattenLocations } from "./tree-flatten";
import { treeLocationColumns } from "./locations-tree-columns";
import LocationForm from "@/components/locations/LocationForm";
import type { Location } from "@/types/location";
import { DataTable } from "@/components/datatable/DataTable";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function LocationsPage() {
  const [tree, setTree] = useState<Location[]>([]);
  const [flat, setFlat] = useState<Location[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<Location | null>(null);
  const [parentForNew, setParentForNew] = useState<Location | null>(null);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/locations");

      // build nested tree from flat list
      const rawTree = buildLocationTree(res.data);

      // expand all nodes at start
      const expandedMap: Record<number, boolean> = {};
      const markExpanded = (nodes: Location[]) => {
        nodes.forEach((n) => {
          if (n.children && n.children.length) {
            expandedMap[n.id] = true;
            markExpanded(n.children);
          }
        });
      };
      markExpanded(rawTree);

      setTree(rawTree);
      setExpanded(expandedMap);
      setFlat(flattenLocations(rawTree));
    } catch {
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const toggleRow = (id: number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const visibleRows = useMemo(() => {
    return flat.filter((loc) => {
      if (!loc.parent_id) return true;
      return expanded[loc.parent_id];
    });
  }, [flat, expanded]);

  const columns = useMemo(
    () =>
      treeLocationColumns(
        toggleRow,
        expanded,
        (loc) => {
          setParentForNew(loc);
          setEditItem(null);
          setOpenForm(true);
        },
        (loc) => {
          setEditItem(loc);
          setOpenForm(true);
        },
        async (loc) => {
          if (!confirm("Delete this location?")) return;
          try {
            await api.delete(`/locations/${loc.id}`);
            toast.success("Location deleted");
            loadLocations();
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Delete failed");
          }
        }
      ),
    [expanded]
  );

  return (
    <div className="space-y-6">

      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Products", href: "/dashboard/admin/products" },
          { label: "Locations" },
        ]}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-heading font-semibold text-[#2F3E46]">
          Locations
        </h2>

        <Button
          className="bg-[#009966] text-white"
          onClick={() => {
            setEditItem(null);
            setParentForNew(null);
            setOpenForm(true);
          }}
        >
          <Plus className="mr-2" size={16} /> Add Location
        </Button>
      </div>

      <DataTable
        title="Location List"
        columns={columns}
        data={visibleRows}
        loading={loading}
        pageSize={9999}
        disablePagination
      />

      <LocationForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={loadLocations}
        editData={editItem}
        parentForNew={parentForNew}
      />
    </div>
  );
}
