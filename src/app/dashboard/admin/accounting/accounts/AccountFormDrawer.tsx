"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, Checkbox } from "antd";
import { toast } from "sonner";
import type { Account } from "@/types/account";

type Props = {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
  account?: Account | null;
  parentForNew?: Account | null;
};

export default function AccountFormDrawer({
  open,
  onClose,
  refresh,
  account,
  parentForNew,
}: Props) {
  /* ---------------- Mapper ---------------- */
  const mapAccountToForm = useMemo(
    () => (account?: Account | null) => ({
      code: account?.code ?? "",
      name: account?.name ?? "",
      type: account?.type ?? "asset",
      category: account?.category ?? "",
      parent_id: account?.parent_id ?? undefined,
      is_active: account?.is_active ?? true,
      can_receive_payment: account?.can_receive_payment ?? false,
      can_make_payment: account?.can_make_payment ?? false,
      opening_balance: account?.opening_balance ?? 0,
      opening_balance_type: account?.opening_balance_type ?? "dr",
    }),
    []
  );

  /* ---------------- State ---------------- */
  const [form, setForm] = useState(() => mapAccountToForm(account));
  const [parents, setParents] = useState<Account[]>([]);

  /* ---------------- Load parent accounts ---------------- */
  useEffect(() => {
    api.get("/accounts").then(res => {
      setParents(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  /* ---------------- Reset form on open / account change ---------------- */
  useEffect(() => {
    if (!open) return;

    if (account) {
      setForm({
        code: account.code ?? "",
        name: account.name ?? "",
        type: account.type ?? "asset",
        category: account.category ?? "",
        parent_id: account.parent_id ?? undefined,
        is_active: account.is_active ?? true,
        can_receive_payment: account.can_receive_payment ?? false,
        can_make_payment: account.can_make_payment ?? false,
        opening_balance: account?.opening_balance ?? 0,
        opening_balance_type: account?.opening_balance_type ?? "dr",
      });
    } else {
      // New account → reset form
      setForm({
        code: "",
        name: "",
        type: "asset",
        category: "",
        parent_id: parentForNew?.id ?? undefined,
        is_active: true,
        can_receive_payment: false,
        can_make_payment: false,
        opening_balance: parentForNew?.opening_balance ?? 0,
        opening_balance_type: parentForNew?.opening_balance_type ?? "dr",
      });
    }
  }, [open, account, parentForNew]);


  /* ---------------- Save ---------------- */
  const save = async () => {
    console.log("Save account", form);
    try {
      if (account?.id) {
        await api.put(`/accounts/${account.id}`, form);
        toast.success("Account updated");
      } else {
        await api.post("/accounts", form);
        toast.success("Account created");
      }

      refresh();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  /* ---------------- Render guard ---------------- */
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      <aside className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl z-50">
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">
            {account ? "Edit Account" : "New Account"}
          </h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 pt-4">
          {/* <div>
            <label className="text-sm font-medium text-gray-700">
              Account Code
            </label>
            <Input
              placeholder="Account Code"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value })}
            />
          </div> */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Account Name
            </label>
            <Input
              placeholder="Account Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Account Type
            </label>
            <Select
              className="w-full"
              value={form.type}
              onChange={v => setForm({ ...form, type: v })}
              options={[
                { value: "asset", label: "Asset" },
                { value: "liability", label: "Liability" },
                { value: "income", label: "Income" },
                { value: "expense", label: "Expense" },
                { value: "equity", label: "Equity" },
              ]}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Account Category
            </label>
            <Select
              className="w-full"
              value={form.category}
              placeholder="Select Category (optional)"
              onChange={v => setForm({ ...form, category: v })}
              options={[
                // { value: "", label: "Select Category" },
                { value: "cash", label: "Cash" },
                { value: "bank", label: "Bank" },
                { value: "wallet", label: "Wallet" },
                { value: "account_receivable", label: "Account Receivable" },
                { value: "account_payable", label: "Account Payable" },
                { value: "tax", label: "Tax" },
              ]}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Parent Account
            </label>
            <Select
              className="w-full"
              placeholder="Select Parent Account (optional)"
              allowClear
              value={form.parent_id}   // number | undefined
              onChange={(v) =>
                setForm({ ...form, parent_id: v ?? undefined })
              }
              options={parents
                .filter(p => p.id !== account?.id) // prevent self-parent (ERP rule)
                .map(p => ({
                  value: p.id,          // number
                  label: `${p.code} - ${p.name}`,
                }))}
            />

          </div>

          {/* Opening Balance */}
          {!account && ["asset", "liability", "equity"].includes(form.type) && (
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Opening Balance
                </label>
                <Input
                  type="number"
                  min={0}
                  value={form.opening_balance}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      opening_balance: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Dr / Cr
                </label>
                <Select
                  className="w-full"
                  value={form.opening_balance_type}
                  onChange={(v) =>
                    setForm({ ...form, opening_balance_type: v })
                  }
                  options={[
                    { value: "dr", label: "Dr" },
                    { value: "cr", label: "Cr" },
                  ]}
                />
              </div>
            </div>
          )}


          <div className="space-y-2 pt-2">
            <Checkbox
              checked={form.can_receive_payment}
              onChange={e =>
                setForm({ ...form, can_receive_payment: e.target.checked })
              }
            >
              Can receive payments
            </Checkbox>

            <Checkbox
              checked={form.can_make_payment}
              onChange={e =>
                setForm({ ...form, can_make_payment: e.target.checked })
              }
            >
              Can make payments
            </Checkbox>
          </div>

          <div className="space-y-2 pt-2">
            <Checkbox
              checked={form.is_active}
              onChange={e =>
                setForm({ ...form, is_active: e.target.checked })
              }
            >
              Active
            </Checkbox>
          </div>
          
          
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-[#009966] text-white" onClick={save}>
            Save Account
          </Button>
        </div>
      </aside>
    </>
  );
}
