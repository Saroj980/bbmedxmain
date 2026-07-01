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
import { Modal, Table } from "antd";
import Link from "next/link";

export default function LocationsPage() {
  const [tree, setTree] = useState<Location[]>([]);
  const [flat, setFlat] = useState<Location[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<Location | null>(null);
  const [parentForNew, setParentForNew] = useState<Location | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [locationProducts, setLocationProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const handleViewProducts = async (loc: Location) => {
    setSelectedLocation(loc);
    setShowProductsModal(true);
    setLoadingProducts(true);
    try {
      const res = await api.get(`/products?location_id=${loc.id}`);
      setLocationProducts(res.data);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

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
        (loc) => {
          Modal.confirm({
            title: 'Delete Location',
            content: `Are you sure you want to delete "${loc.name}"? This action cannot be undone.`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
              try {
                await api.delete(`/locations/${loc.id}`);
                toast.success("Location deleted");
                loadLocations();
              } catch (err: any) {
                toast.error(err?.response?.data?.message || "Delete failed");
              }
            }
          });
        },
        handleViewProducts
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
        emptyMessage='No location found'
      />

      <LocationForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={loadLocations}
        editData={editItem}
        parentForNew={parentForNew}
      />

      <Modal
        title={selectedLocation ? `Products at ${selectedLocation.name}` : 'Location Products'}
        open={showProductsModal}
        onCancel={() => setShowProductsModal(false)}
        footer={null}
        width={800}
      >
        <Table 
          loading={loadingProducts}
          dataSource={locationProducts}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
          className="erp-table mt-4"
          columns={[
            { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v) => <span className="font-mono text-gray-600">{v}</span> },
            { 
              title: 'Product Name', 
              dataIndex: 'name', 
              key: 'name', 
              render: (v, r) => (
                <Link href={`/dashboard/admin/products/${r.id}`} target="_blank" className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                  {v}
                </Link>
              ) 
            },
            { 
              title: 'Base Unit', 
              key: 'unit', 
              render: (_, r: any) => {
                const base = r.units?.find((u: any) => u.level === 1) || r.units?.[0];
                return <span className="text-gray-600 font-medium">{base?.unit || '-'}</span>;
              } 
            },
            { 
              title: 'Stock at Location', 
              key: 'stock', 
              align: 'right',
              render: (_, r: any) => {
                // Here we might just sum batches' current_stock, but since LocationController filters products that HAVE stock movements in this location,
                // the total stock shown is the global total stock of the product.
                const totalStock = (r.batches || []).reduce((sum: number, b: any) => sum + (Number(b.current_stock) || 0), 0);
                return (
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-gray-900">{totalStock}</span>
                    <span className="text-[10px] text-gray-400 leading-tight">total available</span>
                  </div>
                );
              }
            },
            { 
              title: 'Status', 
              dataIndex: 'is_active', 
              key: 'status', 
              render: (v) => v 
                ? <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700">Active</span>
                : <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700">Inactive</span>
            }
          ]}
        />
      </Modal>
    </div>
  );
}
