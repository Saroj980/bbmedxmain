/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Category } from "@/types/category";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TreeSelect } from "antd";

interface Props {
  open: boolean;
  onClose: () => void;
  refresh: () => Promise<void>;
  editData: Category | null;
  parentForNew?: Category | null;
}

type CategoryTreeNode = {
  title: string;
  value: number;
  key: number;
  disabled?: boolean;
  children?: CategoryTreeNode[];
};


/* ---------------- Helpers ---------------- */

// Get all descendant IDs of a category (for circular prevention)
const getDescendantIds = (
  list: Category[],
  parentId: number
): number[] => {
  const children = list.filter((c) => c.parent_id === parentId);
  let ids: number[] = [];

  for (const child of children) {
    ids.push(child.id);
    ids = ids.concat(getDescendantIds(list, child.id));
  }

  return ids;
};

// Build TreeSelect data & disable invalid parents
const buildTreeWithDisable = (
  list: Category[],
  parentId: number | null,
  disabledIds: number[]
): CategoryTreeNode[] => {
  return list
    .filter((c) => c.parent_id === parentId)
    .map((c) => ({
      title: c.name,
      value: c.id,
      key: c.id,
      disabled: disabledIds.includes(c.id),
      children: buildTreeWithDisable(list, c.id, disabledIds),
    }));
};


/* ---------------- Component ---------------- */

export default function CategoryForm({
  open,
  onClose,
  refresh,
  editData,
  parentForNew,
}: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  /* Load categories */
  useEffect(() => {
    api.get("/categories").then((res) => {
      setCategories(res.data || []);
    });
  }, []);

  /* Populate form on open */
  useEffect(() => {
    if (!open) return;

    if (editData) {
      setName(editData.name ?? "");
      setCode(editData.code ?? "");
      setParentId(editData.parent_id ?? null);
      setIsActive(Boolean(editData.is_active));
    } else {
      setName("");
      setCode("");
      setParentId(parentForNew?.id ?? null);
      setIsActive(true);
    }
  }, [open, editData, parentForNew]);

  /* Disabled parent IDs (self + descendants) */
  const disabledParentIds = editData
    ? [editData.id, ...getDescendantIds(categories, editData.id)]
    : [];

  /* Submit */
  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Category name is required");
    if (!code.trim()) return toast.error("Category code is required");

    setLoading(true);
    try {
      const payload = {
        name,
        code: code.toUpperCase(),
        parent_id: parentId,
        is_active: isActive,
      };

      if (editData) {
        await api.put(`/categories/${editData.id}`, payload);
        toast.success("Category updated");
      } else {
        await api.post("/save-category", payload);
        toast.success("Category created");
      }

      await refresh();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 bg-white h-full w-full sm:w-[480px] shadow-xl z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-lg font-semibold">
            {editData ? "Edit Category" : "New Category"}
          </h3>
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-sm">
          <div>
            <label className="font-medium">Name *</label>
            <Input
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
            />
          </div>

          <div>
            <label className="font-medium">Code *</label>
            <Input
              className="mt-1 uppercase"
              value={code}
              maxLength={50}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ELE, STA"
            />
          </div>

          <div>
            <label className="font-medium">Parent Category</label>
            <TreeSelect
              className="w-full mt-2"
              treeData={buildTreeWithDisable(
                categories,
                null,
                disabledParentIds
              )}
              value={parentId ?? undefined}
              placeholder="Select parent category"
              allowClear
              showSearch
              treeDefaultExpandAll
              onChange={(v) => setParentId(v ? Number(v) : null)}
              filterTreeNode={(input, node) =>
                (node.title as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label>Active</label>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-[#009966] text-white"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : editData ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
