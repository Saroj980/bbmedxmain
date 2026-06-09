"use client";

import React, { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import NepaliDatePickerBoth from "@/components/common/NepaliDatePickerBoth";

export default function FiscalYearPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    bs_start: "",
    bs_end: "",
    ad_start: "",
    ad_end: "",
    is_locked: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/fiscal-years");
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load fiscal years");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        bs_start: editData.bs_start,
        bs_end: editData.bs_end,
        ad_start: editData.ad_start?.split('T')[0] || "",
        ad_end: editData.ad_end?.split('T')[0] || "",
        is_locked: !!editData.is_locked,
      });
    } else {
      setForm({
        name: "",
        bs_start: "",
        bs_end: "",
        ad_start: "",
        ad_end: "",
        is_locked: false,
      });
    }
  }, [editData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editData) {
        await api.put(`/fiscal-years/${editData.id}`, form);
        toast.success("Fiscal year updated");
      } else {
        await api.post("/fiscal-years", form);
        toast.success("Fiscal year created");
      }
      setOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      await api.post(`/fiscal-years/${id}/set-active`);
      toast.success("Active fiscal year changed");
      loadData();
    } catch (err) {
      toast.error("Failed to set active fiscal year");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this fiscal year?")) return;
    try {
      await api.delete(`/fiscal-years/${id}`);
      toast.success("Fiscal year deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <>
      <div className="p-6 space-y-6 animate-fadeIn pb-12">
        <div className="flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Settings", href: "/dashboard/admin/settings" },
            { label: "Fiscal Years" },
          ]}
        />
        <Button onClick={() => { setEditData(null); setOpen(true); }} className="bg-[#009966] text-white shadow-lg transition-transform hover:scale-105">
          <Plus className="mr-2" size={16} /> Add Fiscal Year
        </Button>
      </div>

      <header>
        <h1 className="text-3xl font-heading font-semibold text-[#2F3E46]">Fiscal Years</h1>
        <p className="text-gray-500 mt-1">Manage system fiscal years and their date ranges.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading fiscal years...</div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-gray-400 border border-dashed rounded-xl bg-white">No fiscal years found.</div>
        ) : (
          <Card className="border-none shadow-sm overflow-hidden bg-white/80 backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-[#2F3E46] border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-sm">Name</th>
                    <th className="px-6 py-4 font-semibold text-sm">BS Range</th>
                    <th className="px-6 py-4 font-semibold text-sm">AD Range</th>
                    <th className="px-6 py-4 font-semibold text-sm">Status</th>
                    <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {data.map((fy) => (
                    <tr key={fy.id} className="hover:bg-white transition-colors group">
                      <td className="px-6 py-4 font-bold text-[#2F3E46]">{fy.name}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="bg-[#E9FFF5] text-[#009966] px-2 py-0.5 rounded text-[10px] font-black mr-2 tracking-widest uppercase">BS</span>
                        <span className="font-medium">{fy.bs_start} — {fy.bs_end}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                         <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black mr-2 tracking-widest uppercase">AD</span>
                        {fy.ad_start?.split('T')[0]} to {fy.ad_end?.split('T')[0]}
                      </td>
                      <td className="px-6 py-4">
                        {fy.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#E9FFF5] text-[#009966] border border-[#d1fae5]">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleSetActive(fy.id)}
                            className="text-[10px] font-black tracking-widest uppercase text-gray-300 hover:text-[#009966] transition"
                          >
                            Set Active
                          </button>
                        )}
                        {fy.is_locked && (
                          <span className="ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-gray-100 text-gray-500 border border-gray-200">
                             Locked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                             onClick={() => { setEditData(fy); setOpen(true); }}
                             className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                             title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          {!fy.is_active && !fy.is_locked && (
                            <button 
                              onClick={() => handleDelete(fy.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>

      {/* Drawer Overlay & Sidebar */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity" onClick={() => setOpen(false)} />
          <aside className="fixed top-0 right-0 z-50 h-full w-full sm:w-[600px] bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b bg-gray-50/50">
          <div>
            <h3 className="text-xl font-heading font-bold text-[#2F3E46]">
              {editData ? "Edit Fiscal Year" : "Add New Fiscal Year"}
            </h3>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black">Configuration Panel</p>
          </div>
          <button className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition" onClick={() => setOpen(false)}>
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-8 overflow-y-auto">
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#009966]">Basic Information</h4>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider opacity-60">Fiscal Year Name</Label>
              <Input 
                id="name" placeholder="e.g. 2080/81" 
                className="bg-gray-50/50 border-gray-200 focus:bg-white transition"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">BS Date Range (Traditional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Start Date (BS)</Label>
                <NepaliDatePickerBoth
                  key={`bs_start-${open}-${editData?.id ?? 'new'}`}
                  bsValue={form.bs_start}
                  placeholder="BS Start Date"
                  onChange={(bs, ad) => setForm(prev => ({ ...prev, bs_start: bs, ad_start: ad }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider opacity-60">End Date (BS)</Label>
                <NepaliDatePickerBoth
                  key={`bs_end-${open}-${editData?.id ?? 'new'}`}
                  bsValue={form.bs_end}
                  placeholder="BS End Date"
                  onChange={(bs, ad) => setForm(prev => ({ ...prev, bs_end: bs, ad_end: ad }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-600">AD Date Range (Auto-filled)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ad_start" className="text-xs font-bold uppercase tracking-wider opacity-60">Start Date (AD)</Label>
                <Input 
                  id="ad_start" type="text" readOnly
                  className="bg-gray-50/50 border-gray-200 text-sm cursor-not-allowed"
                  placeholder="Auto-filled from BS date"
                  value={form.ad_start}
                  onChange={(e) => setForm({ ...form, ad_start: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad_end" className="text-xs font-bold uppercase tracking-wider opacity-60">End Date (AD)</Label>
                <Input 
                  id="ad_end" type="text" readOnly
                  className="bg-gray-50/50 border-gray-200 text-sm cursor-not-allowed"
                  placeholder="Auto-filled from BS date"
                  value={form.ad_end}
                  onChange={(e) => setForm({ ...form, ad_end: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#009966]/30 transition">
               <input 
                 type="checkbox" id="is_locked" 
                 className="w-5 h-5 accent-[#009966] cursor-pointer"
                 checked={form.is_locked} onChange={(e) => setForm({ ...form, is_locked: e.target.checked })}
               />
               <div className="flex-1 cursor-pointer" onClick={() => setForm(prev => ({ ...prev, is_locked: !prev.is_locked }))}>
                 <Label htmlFor="is_locked" className="font-bold text-sm text-[#2F3E46] block cursor-pointer">Lock Fiscal Year</Label>
                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.05em]">Prevents accidental deletion of records</span>
               </div>
            </div>
          </div>

          <div className="pt-8 flex gap-4">
             <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[#2F3E46] border-gray-200" type="button" onClick={() => setOpen(false)}>Cancel</Button>
             <Button className="flex-1 h-12 bg-[#009966] hover:bg-[#008456] text-white rounded-xl shadow-lg transition-transform hover:scale-105 font-bold uppercase tracking-widest" disabled={saving}>
               {saving ? "Processing..." : editData ? "Apply Changes" : "Save Year"}
             </Button>
          </div>
        </form>
      </aside>
      </>
      )}
    </>
  );
}
