/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  refresh: () => Promise<void>;
  editData?: any | null;
}

export default function DictionaryForm({
  open,
  onClose,
  refresh,
  editData,
}: Props) {
  const isEdit = Boolean(editData);

  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [values, setValues] = useState<{ id: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto-generate key from name
  const generateKey = (v: string) =>
    v.trim().toLowerCase().replace(/\s+/g, "_");

  useEffect(() => {
    if (open && editData) {
      setName(editData.name);
      setLabel(editData.label);
      setValues(
        editData.values.map((v: any) => ({
          id: String(v.id),
          value: v.value,
        }))
      );
    } else if (open) {
      setName("");
      setLabel("");
      setValues([]);
    }
  }, [open, editData]);

  /* Add new value */
  const addValue = () =>
    setValues((s) => [...s, { id: Math.random().toString(36), value: "" }]);

  const removeValue = (id: string) =>
    setValues((s) => s.filter((v) => v.id !== id));

  const handleSubmit = async () => {
    if (!label.trim()) return toast.error("Label is required");
    if (!name.trim()) return toast.error("Key is required");

    const payload = {
      name,
      label,
      values: values.filter((v) => v.value.trim()),
    };

    try {
      setLoading(true);

      if (isEdit) {
        await api.put(`/dictionary/categories/${editData.id}`, payload);
        toast.success("Category updated");
      } else {
        await api.post("/dictionary/categories", payload);
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
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[600px] bg-white shadow-xl transition-transform flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit Dictionary Category" : "New Dictionary Category"}
          </h3>

          <button className="p-2" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div>
            <label className="text-sm font-medium">Label (Display Name)</label>
            <Input
              className="mt-2 text-sm"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (!isEdit) setName(generateKey(e.target.value));
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Key / Slug</label>
            <Input
              className="mt-2 text-sm"
              value={name}
              onChange={(e) => setName(generateKey(e.target.value))}
            />
          </div>

         
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="bg-[#009966] text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving…" : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </aside>
    </>
  );
}
