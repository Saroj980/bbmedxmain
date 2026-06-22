"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { productColumns } from "./product-columns";
import ProductFormDrawer from "@/components/products/ProductFormDrawer";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, MoreHorizontal, Search, Filter, Package, Box, AlertCircle, AlertTriangle, Clock, Banknote } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Select } from "antd";

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");

  const [dictBrands, setDictBrands] = useState<{label: string, value: string}[]>([]);
  const [apiCategories, setApiCategories] = useState<{label: string, value: string}[]>([]);

  const loadProducts = async () => {
    setLoading(true);
    try{
      const res = await api.get("/products");
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const loadDictionaries = async () => {
    try {
      const res = await api.get("/dictionary/categories-with-values");
      const brandDict = res.data?.find((c: any) => c.name === "brand_name" || c.name === "manufacturer" || c.name === "brand");
      if (brandDict && brandDict.values) {
        setDictBrands(brandDict.values.map((v: any) => ({ label: v.value, value: v.value })));
      }
    } catch (e) {
      console.error("Failed to load dictionaries", e);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setApiCategories(res.data?.map((c: any) => ({ label: c.name, value: c.id.toString() })) || []);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  useEffect(() => {
    loadProducts();
    loadDictionaries();
    loadCategories();
  }, []);

  const columns = useMemo(
    () => productColumns(setEditItem, setOpenForm, loadProducts),
    []
  );

  // KPIs
  const totalProducts = data.length;
  const activeProducts = data.filter(p => p.is_active).length;
  const activePercentage = totalProducts ? Math.round((activeProducts / totalProducts) * 100) : 0;
  
  const productsWithStock = data.map(p => {
    const stock = p.batches?.reduce((sum, b) => sum + (Number(b.current_stock) || 0), 0) || 0;
    const value = p.batches?.reduce((sum, b) => sum + ((Number(b.current_stock) || 0) * (Number(b.purchase_price) || 0)), 0) || 0;
    const isExpired = p.batches?.some(b => b.expiry_date && new Date(b.expiry_date) < new Date()) || false;
    return { ...p, _totalStock: stock, _stockValue: value, _isExpired: isExpired };
  });

  const lowStockItems = productsWithStock.filter(p => p._totalStock > 0 && p._totalStock < 50).length;
  const outOfStockItems = productsWithStock.filter(p => p._totalStock === 0).length;
  const expiredItems = productsWithStock.filter(p => p._isExpired).length;
  const totalStockValue = productsWithStock.reduce((sum, p) => sum + p._stockValue, 0);

  // Filter Data
  const filteredData = useMemo(() => {
    return productsWithStock.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        if (!matchesName && !matchesSku) return false;
      }
      
      if (categoryFilter !== "all" && p.category?.id?.toString() !== categoryFilter) return false;
      if (brandFilter !== "all" && p.brand !== brandFilter) return false;
      
      if (statusFilter === "active" && !p.is_active) return false;
      if (statusFilter === "inactive" && p.is_active) return false;

      if (stockStatusFilter === "in_stock" && p._totalStock === 0) return false;
      if (stockStatusFilter === "low_stock" && (p._totalStock === 0 || p._totalStock >= 50)) return false;
      if (stockStatusFilter === "out_of_stock" && p._totalStock > 0) return false;

      // simplified unit filtering
      if (unitFilter !== "all") {
        const hasUnit = p.units?.some(u => u.unit.toLowerCase() === unitFilter.toLowerCase());
        if (!hasUnit) return false;
      }

      return true;
    });
  }, [productsWithStock, search, categoryFilter, brandFilter, statusFilter, stockStatusFilter, unitFilter]);

  // Extract unique categories and brands for filters
  const categories = apiCategories.length > 0
    ? apiCategories
    : Array.from(new Set(data.map(p => p.category).filter(Boolean))).map(c => ({ label: c!.name, value: c!.id?.toString() }));
  const brands = dictBrands.length > 0 
    ? dictBrands 
    : Array.from(new Set(data.map(p => p.brand).filter(Boolean).filter(b => b !== '-'))).map(b => ({ label: b, value: b }));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4  border-b border-gray-200">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Products" },
          ]}
        />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product List</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your inventory items, medicines, and products in one place.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* 
            <Button variant="outline" className="h-9 px-4 shadow-sm bg-white border-gray-200">
              <Upload className="mr-2 h-4 w-4 text-gray-500" /> <span className="text-gray-700">Import</span>
            </Button>
            <Button variant="outline" className="h-9 px-4 shadow-sm bg-white border-gray-200">
              <Download className="mr-2 h-4 w-4 text-gray-500" /> <span className="text-gray-700">Export</span>
            </Button>
            <Button variant="outline" className="h-9 px-4 shadow-sm bg-white border-gray-200">
              <span className="text-gray-700">More Actions</span>
            </Button>
            */}
            <Button
              className="h-9 bg-[#009966] text-white hover:bg-[#007f55] shadow-sm px-4 ml-2"
              onClick={() => {
                setEditItem(null);
                setOpenForm(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Total Products</p>
              <Package className="text-emerald-500" size={16} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{totalProducts.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-400 mt-1">All Items</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Active Products</p>
              <Box className="text-blue-500" size={16} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{activeProducts.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-400 mt-1">{activePercentage}% of total</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Low Stock</p>
              <AlertCircle className="text-purple-500" size={16} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{lowStockItems.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Reorder soon</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Out of Stock</p>
              <AlertTriangle className="text-orange-500" size={16} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{outOfStockItems.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Needs attention</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Expired Items</p>
              <Clock className="text-teal-500" size={16} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{expiredItems.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Expired products</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Stock Value</p>
              <Banknote className="text-amber-500" size={16} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 truncate" title={`NPR ${totalStockValue.toLocaleString()}`}>NPR {totalStockValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Cost Price</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row gap-4 lg:items-end bg-gray-50/50">
            <div className="flex-1 max-w-sm lg:self-end mb-[1px]">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all shadow-sm"
                  placeholder="Search by product name, SKU, barcode..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
              <div className="w-36">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
                <Select
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    { label: "All Categories", value: "all" },
                    ...categories
                  ]}
                  className="w-full h-9"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>
              <div className="w-32">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Brand</label>
                <Select
                  value={brandFilter}
                  onChange={setBrandFilter}
                  options={[
                    { label: "All Brands", value: "all" },
                    ...brands
                  ]}
                  className="w-full h-9"
                  showSearch
                />
              </div>
              <div className="w-32">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { label: "All Status", value: "all" },
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                  ]}
                  className="w-full h-9"
                />
              </div>
              <div className="w-36">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Stock Status</label>
                <Select
                  value={stockStatusFilter}
                  onChange={setStockStatusFilter}
                  options={[
                    { label: "All", value: "all" },
                    { label: "In Stock", value: "in_stock" },
                    { label: "Low Stock", value: "low_stock" },
                    { label: "Out of Stock", value: "out_of_stock" },
                  ]}
                  className="w-full h-9"
                />
              </div>
              <div className="w-32">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Unit</label>
                <Select
                  value={unitFilter}
                  onChange={setUnitFilter}
                  options={[
                    { label: "All Units", value: "all" },
                    { label: "Tablet", value: "Tablet" },
                    { label: "Box", value: "Box" },
                    { label: "Strip", value: "Strip" },
                    { label: "Piece", value: "Piece" },
                    { label: "Bottle", value: "Bottle" },
                  ]}
                  className="w-full h-9"
                />
              </div>
              <div className="mt-5">
                <Button variant="outline" className="h-9 px-4 text-xs bg-white shadow-sm">
                  <Filter size={14} className="mr-2" /> Filters
                </Button>
              </div>
            </div>
          </div>

          <div className="p-0 border-t-0">
            <DataTable
              columns={columns}
              data={filteredData}
              loading={loading}
              emptyMessage="No products found."
              disableSearch
            />
          </div>
        </div>

        <ProductFormDrawer
          open={openForm}
          onClose={() => setOpenForm(false)}
          refresh={loadProducts}
          editData={editItem}
        />
      </div>
    </div>
  );
}
