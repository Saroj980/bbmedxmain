/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Tag, Tree } from "antd";
import DictionaryForm from "@/components/dictionaries/DictionaryForm";
import { toast } from "sonner";

import { X } from "lucide-react";

type DictCategory = {
  id: number;
  name: string;
  label: string;
  values: { id: number; value: string }[];
};

export default function DictionaryPage() {
  const [categories, setCategories] = useState<DictCategory[]>([]);
  const [loading, setLoading] = useState(false);

  // UI states
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<DictCategory | null>(null);

  /* ----------------------------------------------------------
   * LOAD ALL DICTIONARY CATEGORIES + VALUES
   * --------------------------------------------------------- */
  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dictionary/categories-with-values");
      setCategories(res.data || []);
    } catch {
      toast.error("Failed to load dictionary categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* ----------------------------------------------------------
   * Build Tree Data Structure (Flat → Tree)
   * --------------------------------------------------------- */
  const treeData = useMemo(() => {
    return categories.map((cat) => ({
      title: cat.label,
      key: cat.id,
    }));
  }, [categories]);

  const selectedCategory = categories.find((c) => c.id === selectedId) || null;

  const deleteCategory = async (id: number) => {
    if (!confirm("Delete this dictionary category? This action cannot be undone.")) return;

    await api.delete(`/dictionary/categories/${id}`);
    await loadCategories();
  };

  const clearAllValues = async (categoryId: number) => {
    if (!confirm("Remove ALL values from this dictionary?")) return;

    await api.delete(`/dictionary/values/clear/${categoryId}`);
    await loadCategories();
  };



  /* ----------------------------------------------------------
   * VALUE ACTIONS
   * --------------------------------------------------------- */

  const deleteValue = async (id: number) => {
    await api.delete(`/dictionary/values/${id}`);
    await loadCategories();
  };

  const addValue = async (categoryId: number, value: string) => {
    if (!value.trim()) return;

    await api.post("/dictionary/values", { category_id: categoryId, value });
    await loadCategories();
  };

  const [categorySearch, setCategorySearch] = useState("");
  const [valueSearch, setValueSearch] = useState("");

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Settings", href: "/dashboard/admin/settings" },
            { label: "Dictionaries" },
          ]}
        />

        <Button
          className="bg-[#009966] text-white"
          onClick={() => {
            setEditItem(null);
            setOpenForm(true);
          }}
        >
          <Plus size={16} className="mr-2" /> Add Category
        </Button>
      </div>

      {/* Split View */}
      <div className="grid grid-cols-12 gap-5">
        {/* LEFT SIDE – CATEGORY TREE */}
        <Card className="p-0 col-span-3 h-[80vh] overflow-y-auto border border-gray-200">
          <div className="p-4 border-b space-y-3">
            <h3 className="text-md font-semibold text-gray-700">Dictionary Categories</h3>

            {/* CATEGORY SEARCH */}
            <Input
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="text-sm mt-3"
            />
          </div>

          {/* FILTERED CATEGORY LIST */}
          <div className="flex flex-col">
            {categories
              .filter((c) =>
                c.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
                c.name.toLowerCase().includes(categorySearch.toLowerCase())
              )
              .map((cat) => {
                const active = selectedId === cat.id;

                return (
                 <button
                    key={cat.id}
                    onClick={() => setSelectedId(cat.id)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between border-l-4 transition ${
                      selectedId === cat.id
                        ? "bg-[#e6f7f1] border-l-[#009966] text-[#005c3b]"
                        : "border-transparent hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span>{cat.label}</span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          selectedId === cat.id ? "bg-[#009966] text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {cat.values.length}
                      </span>

                      {/* DELETE CATEGORY ICON IF EMPTY */}
                      {cat.values.length === 0 && (
                        <X
                          size={16}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation(); // prevent selecting category
                            deleteCategory(cat.id);
                          }}
                        />
                      )}
                    </div>
                  </button>

                );
              })}

            {categories.length === 0 && (
              <p className="text-gray-400 text-sm p-4">No dictionary categories found…</p>
            )}
          </div>
        </Card>



        {/* RIGHT SIDE – DETAILS PANEL */}
        <Card className="p-6 col-span-9 min-h-[80vh] border border-gray-200">
          {!selectedCategory ? (
            <p className="text-gray-400">Select a dictionary category →</p>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-0">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedCategory.label}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Key: {selectedCategory.name}
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-0">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditItem(selectedCategory);
                      setOpenForm(true);
                    }}
                  >
                    <Pencil size={16} className="mr-2" /> Edit
                  </Button>
                </div>
              </div>
               <div className="flex items-center"> 
                {/* VALUE SEARCH */}
                <Input
                  placeholder="Search values..."
                  value={valueSearch}
                  onChange={(e) => setValueSearch(e.target.value)}
                  className="text-sm mb-3"
                />
                </div>

              {/* Values */}
              <div>
                <h4 className="text-md font-medium mb-2">Values</h4>

                <div className="flex flex-wrap gap-2">
                  {selectedCategory.values
                    .filter((v) =>
                      v.value.toLowerCase().includes(valueSearch.toLowerCase())
                    )
                    .map((v) => (
                      <Tag
                        key={v.id}
                        closable
                        onClose={() => deleteValue(v.id)}
                        color={'success'}
                        variant="solid"
                        className="px-3 py-1 rounded-full border border-[#009966] bg-[#e6f7f1] text-[#005c3b]"
                      >
                        {v.value}
                      </Tag>

                    ))}

                  {selectedCategory.values.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No values yet…</p>
                  )}
                </div>
                <div className="my-2"></div>
                {selectedCategory.values.length > 0 && (
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2 bg-red-600 hover:bg-red-700 gap-1 space-y-1"
                    onClick={() => clearAllValues(selectedCategory.id)}
                  >
                    Clear All Values
                  </Button>

                )}



                {/* Add value */}
                <div className="flex gap-3 mt-4">
                  <Input
                    placeholder="Add new value"
                    value={(selectedCategory as any)._newValue || ""}
                    onChange={(e) => {
                      (selectedCategory as any)._newValue = e.target.value;
                      setCategories([...categories]);
                    }}
                    className="text-sm"
                  />

                  <Button
                    className="bg-[#009966] text-white"
                    onClick={() =>
                      addValue(
                        selectedCategory.id,
                        (selectedCategory as any)._newValue || ""
                      )
                    }
                  >
                    <Plus size={16} className="mr-2" /> Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Drawer Form */}
      <DictionaryForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={loadCategories}
        editData={editItem}
      />
    </div>
  );
}
