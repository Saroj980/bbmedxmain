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
        });
      });
    }

    if (open && !editData) {
      setForm({
        name: "",
        is_supplier: false,
        is_customer: false,
        phone: "",
        email: "",
        address: "",
        opening_balance: 0,
        opening_balance_type: "receivable",
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

          {/* Party Type */}
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

          
          {/* Opening Balance */}
          {/* <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
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
          </div> */}
          {!editData && (
            <>
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
            </>
          )}

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
