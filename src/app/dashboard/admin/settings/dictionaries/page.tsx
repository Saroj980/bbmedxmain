/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, Download, Upload, MoreHorizontal, Link as LinkIcon, Tag, Pill, Factory, Activity, Box, Hexagon, Fingerprint, AlertCircle, Eye } from "lucide-react";
import DictionaryForm from "@/components/dictionaries/DictionaryForm";
import { toast } from "sonner";
import { Tooltip, Modal } from "antd";
import dayjs from "dayjs";

type DictValue = {
  id: number;
  value: string;
  linked_products_count?: number;
  updated_at?: string;
};

type DictCategory = {
  id: number;
  name: string;
  label: string;
  values: DictValue[];
};

export default function DictionaryPage() {
  const [categories, setCategories] = useState<DictCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<DictCategory | null>(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [valueSearch, setValueSearch] = useState("");
  const [newValue, setNewValue] = useState("");

  const [productsModalVisible, setProductsModalVisible] = useState(false);
  const [linkedProducts, setLinkedProducts] = useState<any[]>([]);
  const [selectedDictValue, setSelectedDictValue] = useState<DictValue | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [editValueModalVisible, setEditValueModalVisible] = useState(false);
  const [editingValue, setEditingValue] = useState<DictValue | null>(null);
  const [editingValueText, setEditingValueText] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dictionary/categories-with-values");
      setCategories(res.data || []);
      if (res.data?.length > 0 && !selectedId) {
        setSelectedId(res.data[0].id);
      }
    } catch {
      toast.error("Failed to load dictionary categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedId) || null;

  const deleteValue = (val: DictValue) => {
    if (val.linked_products_count && val.linked_products_count > 0) {
      toast.error(`Cannot delete. Value is linked with ${val.linked_products_count} products.`);
      return;
    }

    Modal.confirm({
      title: 'Delete Dictionary Value',
      content: `Are you sure you want to delete "${val.value}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/dictionary/values/${val.id}`);
          toast.success("Value deleted");
          loadCategories();
        } catch (e: any) {
          toast.error(e.response?.data?.message || "Delete failed");
        }
      }
    });
  };

  const deleteCategory = (category: DictCategory) => {
    if (category.values.length > 0) {
      toast.error(`Cannot delete category "${category.label}". It contains ${category.values.length} values. Delete them first.`);
      return;
    }

    Modal.confirm({
      title: 'Delete Dictionary Category',
      content: `Are you sure you want to delete the category "${category.label}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/dictionary/categories/${category.id}`);
          toast.success("Category deleted");
          setSelectedId(null);
          loadCategories();
        } catch (e: any) {
          toast.error(e.response?.data?.message || "Failed to delete category");
        }
      }
    });
  };

  const addValue = async () => {
    if (!newValue.trim() || !selectedCategory) return;
    try {
      await api.post("/dictionary/values", { category_id: selectedCategory.id, value: newValue });
      setNewValue("");
      loadCategories();
      toast.success("Value added");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to add value");
    }
  };

  const viewLinkedProducts = async (val: DictValue) => {
    setSelectedDictValue(val);
    setProductsModalVisible(true);
    setLoadingProducts(true);
    try {
      const res = await api.get(`/dictionary/values/${val.id}/products`);
      setLinkedProducts(res.data || []);
    } catch {
      toast.error("Failed to load linked products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const startEditValue = (val: DictValue) => {
    setEditingValue(val);
    setEditingValueText(val.value);
    setEditValueModalVisible(true);
  };

  const saveEditedValue = async () => {
    if (!editingValue || !editingValueText.trim()) return;
    try {
      await api.put(`/dictionary/values/${editingValue.id}`, { value: editingValueText });
      toast.success("Value updated successfully");
      setEditValueModalVisible(false);
      loadCategories();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update value");
    }
  };

  const getIconForCategory = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("brand")) return <Hexagon size={16} />;
    if (l.includes("generic")) return <Fingerprint size={16} />;
    if (l.includes("dosage") || l.includes("form")) return <Pill size={16} />;
    if (l.includes("manufactur")) return <Factory size={16} />;
    if (l.includes("strength")) return <Activity size={16} />;
    if (l.includes("leaf")) return <Box size={16} />;
    return <Tag size={16} />;
  };

  const filteredCategories = categories.filter((c) =>
    c.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredValues = selectedCategory?.values.filter((v) =>
    v.value.toLowerCase().includes(valueSearch.toLowerCase())
  ) || [];

  const totalGlobalValues = categories.reduce((sum, c) => sum + c.values.length, 0);
  const totalGlobalLinks = categories.reduce((sum, c) => sum + c.values.reduce((s, v) => s + (v.linked_products_count || 0), 0), 0);

  const totalValues = selectedCategory?.values.length || 0;
  const linkedProductsCount = selectedCategory?.values.reduce((sum, v) => sum + (v.linked_products_count || 0), 0) || 0;
  const activeValues = selectedCategory?.values.filter(v => (v.linked_products_count || 0) > 0).length || 0;
  const inactiveValues = selectedCategory?.values.filter(v => (v.linked_products_count || 0) === 0).length || 0;

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Settings", href: "/dashboard/admin/settings" },
            { label: "Dictionaries" },
          ]}
        />
        <Button
          className="bg-[#009966] text-white hover:bg-[#007f55]"
          onClick={() => {
            setEditItem(null);
            setOpenForm(true);
          }}
        >
          <Plus size={16} className="mr-2" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-150px)]">
        {/* LEFT PANEL */}
        <div className="col-span-3 bg-white border border-gray-200 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Dictionary Categories</h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-8 text-sm h-9 bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredCategories.map((cat) => {
              const active = selectedId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedId(cat.id)}
                  className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${
                    active ? "bg-[#f0f9f6] border border-[#a3e0c9]" : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-md ${active ? "bg-[#009966] text-white" : "bg-gray-100 text-gray-500"}`}>
                    {getIconForCategory(cat.label)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-semibold ${active ? "text-[#009966]" : "text-gray-700"}`}>
                        {cat.label}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${active ? "bg-[#009966] text-white" : "bg-gray-100 text-gray-500"}`}>
                        {cat.values.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{cat.name}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Dictionary Overview</h4>
            <div className="flex justify-between text-center">
              <div>
                <p className="text-lg font-bold text-gray-800">{categories.length}</p>
                <p className="text-[10px] text-gray-500">Categories</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{totalGlobalValues}</p>
                <p className="text-[10px] text-gray-500">Total Values</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#009966]">{totalGlobalLinks.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">Product Links</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-9 flex flex-col h-full gap-4 overflow-hidden">
          {selectedCategory ? (
            <>
              {/* Category Header & KPIs */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm shrink-0">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCategory.label}</h2>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-xs rounded-md flex items-center gap-1 font-mono">
                        <Tag size={12} /> {selectedCategory.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Manage {selectedCategory.label.toLowerCase()} values used across the product catalog.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditItem(selectedCategory); setOpenForm(true); }}>
                      <Pencil size={14} className="mr-2" /> Edit Category
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200" onClick={() => deleteCategory(selectedCategory)}>
                      <Trash2 size={14} className="mr-2" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Hexagon size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-500 uppercase">Total Values</p>
                      <h3 className="text-xl font-bold text-gray-900">{totalValues}</h3>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-blue-50 bg-blue-50/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <LinkIcon size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-blue-600 uppercase">Linked Products</p>
                      <h3 className="text-xl font-bold text-gray-900">{linkedProductsCount.toLocaleString()}</h3>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Box size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-500 uppercase">Active Values</p>
                      <h3 className="text-xl font-bold text-gray-900">{activeValues}</h3>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-500 uppercase">Inactive Values</p>
                      <h3 className="text-xl font-bold text-gray-900">{inactiveValues}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Area */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col min-h-0 flex-1 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                  <div className="relative w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search values..."
                      value={valueSearch}
                      onChange={(e) => setValueSearch(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 font-medium w-16">#</th>
                        <th className="px-6 py-3 font-medium">Value Name</th>
                        <th className="px-6 py-3 font-medium">Products Linked</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Last Used</th>
                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredValues.map((v, idx) => {
                        const isUnused = (v.linked_products_count || 0) === 0;
                        return (
                          <tr key={v.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-3 text-gray-400">{idx + 1}</td>
                            <td className="px-6 py-3 font-medium text-gray-900">{v.value}</td>
                            <td className="px-6 py-3">
                              <button 
                                onClick={() => viewLinkedProducts(v)}
                                className={`flex items-center gap-1.5 font-medium px-2 py-1 rounded-md transition-colors ${isUnused ? "text-gray-400 bg-gray-50 hover:text-gray-600" : "text-blue-600 hover:text-blue-800 hover:underline bg-blue-50"}`}
                              >
                                <LinkIcon size={14} />
                                {v.linked_products_count || 0} Products
                              </button>
                            </td>
                            <td className="px-6 py-3">
                              <span className={`px-2 py-0.5 border text-xs font-medium rounded-md ${isUnused ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}>
                                {isUnused ? 'Unused' : 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-gray-500">
                              {v.updated_at ? dayjs(v.updated_at).format('MMM DD, YYYY') : '-'}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex justify-end gap-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Tooltip title="View Linked Products">
                                  <button onClick={() => viewLinkedProducts(v)} className="hover:text-gray-700 transition-colors cursor-pointer">
                                    <Eye size={16} />
                                  </button>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <button onClick={() => startEditValue(v)} className="hover:text-blue-600 transition-colors cursor-pointer">
                                    <Pencil size={16} />
                                  </button>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <button className="hover:text-red-600 transition-colors cursor-pointer" onClick={() => deleteValue(v)}>
                                    <Trash2 size={16} />
                                  </button>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredValues.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                            No values found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Add New Value */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center gap-4 shrink-0">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Add New Value</p>
                    <p className="text-xs text-gray-500">Add a new {selectedCategory.label.toLowerCase()} value to this category.</p>
                  </div>
                  <div className="flex gap-2 w-[400px]">
                    <Input
                      placeholder={`Enter new ${selectedCategory.label.toLowerCase()}...`}
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addValue()}
                    />
                    <Button className="bg-[#009966] hover:bg-[#007f55] text-white shrink-0" onClick={addValue}>
                      <Plus size={16} className="mr-2" /> Add Value
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
              Select a category to view its dictionary values.
            </div>
          )}
        </div>
      </div>

      <DictionaryForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={loadCategories}
        editData={editItem}
      />

      {/* Linked Products Modal */}
      <Modal
        title={`Products Linked to "${selectedDictValue?.value}"`}
        open={productsModalVisible}
        onCancel={() => setProductsModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="max-h-[60vh] overflow-y-auto mt-4 pr-2">
          {loadingProducts ? (
            <div className="py-10 text-center text-gray-500">Loading products...</div>
          ) : linkedProducts.length > 0 ? (
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
              {linkedProducts.map((p) => (
                <div key={p.id} className="p-3 hover:bg-gray-50 flex items-center justify-between transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">SKU: {p.sku || '-'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md border ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {p.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-gray-100">
              <LinkIcon size={32} className="text-gray-300 mb-3" />
              <p>No products linked to this value.</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Value Modal */}
      <Modal
        title={`Edit Value: ${editingValue?.value}`}
        open={editValueModalVisible}
        onOk={saveEditedValue}
        onCancel={() => setEditValueModalVisible(false)}
        okText="Save Changes"
        cancelText="Cancel"
        okButtonProps={{ className: "bg-emerald-600 hover:bg-emerald-700 border-none" }}
      >
        <div className="py-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Value Name</label>
          <Input 
            value={editingValueText} 
            onChange={(e) => setEditingValueText(e.target.value)} 
            placeholder="Enter value name..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEditedValue();
            }}
          />
          {editingValue?.linked_products_count ? (
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm flex items-start gap-2 border border-blue-100">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-blue-600" />
              <p>This value is linked to <strong>{editingValue.linked_products_count} products</strong>. Changing this will automatically update all linked products to match the new spelling.</p>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
