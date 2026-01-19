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

export default function CategoriesPage() {
  const [rawTree, setRawTree] = useState<Category[]>([]);
  const [flat, setFlat] = useState<Category[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [parentForNew, setParentForNew] = useState<Category | null>(null);

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
        async (c) => {
          if (!confirm("Delete this category?")) return;
          await api.delete(`/categories/${c.id}`);
          loadCategories();
        }
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
    </div>
  );
}
