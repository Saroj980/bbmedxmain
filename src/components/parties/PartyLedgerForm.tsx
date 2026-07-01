/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "antd";
import { toast } from "sonner";

export default function PartyLedgerForm({
  open,
  onClose,
  refresh,
  editData,
  defaultIsSupplier = false,
}: any) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<any>({
    name: "",
    is_supplier: false,
    is_customer: false,
    phone: "",
    email: "",
    address: "",
    opening_balance: 0,
    opening_balance_type: "receivable",
    is_active: true,
    pan_no: "",
    is_vat_registered: false,
  });

  /* ---------------- Load Edit Data ---------------- */
  useEffect(() => {
    if (open && editData?.id) {
      api.get(`/parties/${editData.id}`).then((res) => {
        const p = res.data.party;

        setForm({
          name: p.name,
          is_supplier: p.type === "supplier" || p.type === "both",
          is_customer: p.type === "customer" || p.type === "both",
          phone: p.phone ?? "",
          email: p.email ?? "",
          address: p.address ?? "",
          opening_balance: p.opening_balance ?? 0,
          opening_balance_type: p.opening_balance_type ?? "receivable",
          is_active: p.is_active ?? true,
          pan_no: p.pan_no ?? "",
          is_vat_registered: !!p.is_vat_registered,
        });
      });
    }

    if (open && !editData) {
      setForm({
        name: "",
        is_supplier: defaultIsSupplier,
        is_customer: !defaultIsSupplier,
        phone: "",
        email: "",
        address: "",
        opening_balance: 0,
        opening_balance_type: defaultIsSupplier ? "payable" : "receivable",
        is_active: true,
        pan_no: "",
        is_vat_registered: false,
      });
    }
  }, [open, editData]);

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Party name is required");
      return;
    }

    if (!form.is_supplier && !form.is_customer) {
      toast.error("Select Supplier, Customer, or Both");
      return;
    }

    // Derive party type
    let type: "supplier" | "customer" | "both" = "customer";

    if (form.is_supplier && form.is_customer) {
      type = "both";
    } else if (form.is_supplier) {
      type = "supplier";
    } else if (form.is_customer) {
      type = "customer";
    }

    const payload = {
      name: form.name,
      type, // THIS IS WHAT YOU WANT
      phone: form.phone,
      email: form.email,
      address: form.address,
      opening_balance: form.opening_balance,
      opening_balance_type: form.opening_balance_type,
      is_active: form.is_active,
      pan_no: form.pan_no,
      is_vat_registered: form.is_vat_registered,
    };

    try {
      setLoading(true);

      if (editData?.id) {
        await api.put(`/parties/${editData.id}`, payload);
        toast.success("Party updated");
      } else {
        await api.post(`/parties`, payload);
        toast.success("Party created");
      }

      refresh();
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
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 right-0 z-50 h-full w-full sm:w-[750px] bg-white 
          shadow-2xl transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold">
            {editData ? "Edit Party" : "Add Party"}
          </h3>
          <button
            className="p-2 hover:bg-gray-100 rounded"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm overflow-y-auto h-[calc(100%-140px)]">
          {/* Party Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Party Name
            </label>
            <Input
              className="mt-1"
              placeholder="e.g. ABC Medical Suppliers Pvt. Ltd."
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          {/* Party Type & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Party Type
              </label>
              <div className="flex gap-6 mt-2">
                <Checkbox
                  checked={form.is_supplier}
                  onChange={(e) =>
                    setForm({ ...form, is_supplier: e.target.checked })
                  }
                >
                  Supplier
                </Checkbox>
                <Checkbox
                  checked={form.is_customer}
                  onChange={(e) =>
                    setForm({ ...form, is_customer: e.target.checked })
                  }
                >
                  Customer
                </Checkbox>
              </div>
            </div>

            {/* Status Switch */}
            {editData && (
              <div>
                <label className="text-sm font-medium text-gray-700 block">
                  Status
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-sm ${form.is_active ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>Inactive</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.is_active}
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                    className={`
                      relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                      ${form.is_active ? 'bg-emerald-600' : 'bg-gray-200'}
                    `}
                  >
                    <span className="sr-only">Toggle active status</span>
                    <span
                      aria-hidden="true"
                      className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${form.is_active ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                  <span className={`text-sm ${form.is_active ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone
              </label>
              <Input
                className="mt-1"
                placeholder="e.g. +977 98XXXXXXXX"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                className="mt-1"
                placeholder="e.g. accounts@company.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Address
            </label>
            <Input
              className="mt-1"
              placeholder="Street, City, Province"
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />
          </div>

          {/* PAN & VAT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                PAN Number
              </label>
              <Input
                className="mt-1"
                placeholder="e.g. 123456789"
                value={form.pan_no}
                onChange={(e) =>
                  setForm({ ...form, pan_no: e.target.value })
                }
              />
            </div>

            <div className="flex items-end pb-2">
              <Checkbox
                checked={form.is_vat_registered}
                onChange={(e) =>
                  setForm({ ...form, is_vat_registered: e.target.checked })
                }
              >
                VAT Registered?
              </Checkbox>
            </div>
          </div>

          
          {/* Opening Balance */}

          {/* Opening Balance */}
          <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
                <p className="font-medium text-gray-700">
                  Opening Balance (Optional)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 50000"
                    value={form.opening_balance}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        opening_balance: Number(e.target.value),
                      })
                    }
                  />

                  <select
                    className="border rounded px-3 py-2"
                    value={form.opening_balance_type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        opening_balance_type: e.target.value,
                      })
                    }
                  >
                    <option value="receivable">
                      Receivable – customer owes you
                    </option>
                    <option value="payable">
                      Payable – you owe supplier
                    </option>
                  </select>
                </div>

                <p className="text-xs text-gray-500">
                  System will auto-post this as an opening journal entry.
                </p>

            </div>
          </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-4 flex justify-end gap-3 bg-white">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            className="bg-[#009966] text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving…" : "Save Party"}
          </Button>
        </div>
      </aside>
    </>
  );
}
