"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { treeCategoryColumns } from "./category-columns";
import { flattenCategories } from "@/lib/tree-flatten";
import CategoryForm from "@/components/categories/CategoryForm";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Modal, Table } from "antd";
import { toast } from "sonner";
import Link from "next/link";

export default function CategoriesPage() {
  const [rawTree, setRawTree] = useState<Category[]>([]);
  const [flat, setFlat] = useState<Category[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [parentForNew, setParentForNew] = useState<Category | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const handleViewProducts = async (cat: Category) => {
    setSelectedCategory(cat);
    setShowProductsModal(true);
    setLoadingProducts(true);
    try {
      const res = await api.get(`/products?category_id=${cat.id}`);
      setCategoryProducts(res.data);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
    const res = await api.get("/categories/tree");
    const tree = res.data;

    const expandedMap: Record<number, boolean> = {};

    const markAllExpanded = (list: Category[]) => {
      list.forEach((c) => {
        if (c.children && c.children.length > 0) {
          expandedMap[c.id] = true;
          markAllExpanded(c.children);
        }
      });
    };

    markAllExpanded(tree);

    setExpanded(expandedMap);
    setRawTree(tree);
    setFlat(flattenCategories(tree));
  } finally{
    setLoading(false);
  }

  };

  useEffect(() => {
    loadCategories();
  }, []);

  const toggleRow = (id: number) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const visibleRows = useMemo(() => {
    return flat.filter((cat) => {
      if (!cat.parent_id) return true;
      return expanded[cat.parent_id];
    });
  }, [flat, expanded]);

  const columns = useMemo(
    () =>
      treeCategoryColumns(
        toggleRow,
        expanded,
        (c) => {
          setParentForNew(c);
          setEditCategory(null);
          setOpenForm(true);
        },
        (c) => {
          setEditCategory(c);
          setOpenForm(true);
        },
        (c) => {
          Modal.confirm({
            title: 'Delete Category',
            content: `Are you sure you want to delete "${c.name}"? This action cannot be undone.`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
              try {
                await api.delete(`/categories/${c.id}`);
                toast.success("Category deleted");
                loadCategories();
              } catch (err) {
                toast.error("Failed to delete category");
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
      

      <div className="flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Products", href: "/dashboard/admin/products" },
            { label: "Categories" },
          ]}
        />

        <Button
          className="bg-[#009966] text-white"
          onClick={() => {
            setEditCategory(null);
            setParentForNew(null);
            setOpenForm(true);
          }}
        >
          <Plus size={16} className="mr-2" /> Add Category
        </Button>
      </div>

      <DataTable
        title="Categories"
        columns={columns}
        data={visibleRows}
        loading={loading}
        pageSize={10000}
        disablePagination={true} 
        emptyMessage={'No categories found'}/>

      <CategoryForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={loadCategories}
        editData={editCategory}
        parentForNew={parentForNew || undefined}
      />

      <Modal
        title={selectedCategory ? `Products in ${selectedCategory.name}` : 'Category Products'}
        open={showProductsModal}
        onCancel={() => setShowProductsModal(false)}
        footer={null}
        width={800}
      >
        <Table 
          loading={loadingProducts}
          dataSource={categoryProducts}
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
              title: 'Available Stock', 
              key: 'stock', 
              align: 'right',
              render: (_, r: any) => {
                const totalStock = (r.batches || []).reduce((sum: number, b: any) => sum + (Number(b.current_stock) || 0), 0);
                return (
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-gray-900">{totalStock}</span>
                    <span className="text-[10px] text-gray-400 leading-tight">incl. free/bonus</span>
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
