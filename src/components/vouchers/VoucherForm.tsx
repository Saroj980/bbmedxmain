/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X, AlertCircle, CheckCircle2 } from "lucide-react";
import dayjs from "dayjs";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, DatePicker, Divider, TreeSelect } from "antd";
import { toast } from "sonner";
import { formatNepaliCurrency } from "@/utils/formatNepaliCurrency";
import { toTitleCase } from "@/utils/toTitleCase";

interface Props {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
  type: string; // payment, receipt, journal, contra, debit-note, credit-note
}

export default function VoucherForm({ open, onClose, refresh, type }: Props) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  
  const [formData, setFormData] = useState<any>({
    journal_date: dayjs(),
    description: "",
  });

  const [entries, setEntries] = useState<any[]>([
    { type: 'dr', account_id: null, debit: 0, credit: 0, description: "" },
    { type: 'cr', account_id: null, debit: 0, credit: 0, description: "" },
  ]);

  /* ---------------- Load Accounts ---------------- */
  useEffect(() => {
    if (!open) return;
    api.get("/accounts").then((res) => setAccounts(res.data || []));
  }, [open]);

  /* ---------------- Smart Defaults ---------------- */
  useEffect(() => {
    if (!open || accounts.length === 0) return;

    // Apply smart defaults only once when form opens and accounts match
    if (type === 'payment') {
        // Payments usually involve Cr: Cash/Bank
        const liquidAcc = accounts.find(a => a.can_receive_payment || a.can_make_payment);
        if (liquidAcc) {
            setEntries([
                { type: 'dr', account_id: null, debit: 0, credit: 0, description: "" },
                { type: 'cr', account_id: liquidAcc.id, debit: 0, credit: 0, description: "" },
            ]);
        }
    } else if (type === 'receipt') {
        // Receipts usually involve Dr: Cash/Bank
        const liquidAcc = accounts.find(a => a.can_receive_payment || a.can_make_payment);
        if (liquidAcc) {
            setEntries([
                { type: 'dr', account_id: liquidAcc.id, debit: 0, credit: 0, description: "" },
                { type: 'cr', account_id: null, debit: 0, credit: 0, description: "" },
            ]);
        }
    }
  }, [open, type, accounts.length]);

  /* ---------------- Logic ---------------- */

  const accountTree = useMemo(() => {
    if (!accounts.length) return [];

    // 1. Filter accounts based on voucher type
    const baseAccounts = (() => {
      switch (type) {
        case 'contra':
          return accounts.filter(a => a.can_make_payment || a.can_receive_payment);
        case 'payment':
          return accounts.filter(a => ['expense', 'liability'].includes(a.type) || a.can_make_payment || a.can_receive_payment);
        case 'receipt':
          return accounts.filter(a => ['income', 'asset'].includes(a.type) || a.can_make_payment || a.can_receive_payment);
        case 'debit-note':
        case 'credit-note':
          return accounts.filter(a => ['asset', 'liability', 'income', 'expense'].includes(a.type));
        default:
          return accounts;
      }
    })();

    // 2. Build Tree Structure
    const map = new Map();
    baseAccounts.forEach(a => map.set(a.id, { ...a, key: a.id, value: a.id, title: `${a.name} (${a.code})`, children: [] }));
    
    const tree: any[] = [];
    map.forEach(node => {
      if (node.parent_id && map.has(node.parent_id)) {
        map.get(node.parent_id).children.push(node);
      } else {
        tree.push(node);
      }
    });

    return tree;
  }, [accounts, type]);

  const getFilteredAccountTree = (entryType: 'dr' | 'cr') => {
    if (showAllAccounts) return accountTree;

    // Further filter the already voucher-type-filtered tree based on row-level Dr/Cr
    const filterByEntryType = (nodes: any[]): any[] => {
        return nodes.map(node => {
            const isMatch = entryType === 'dr' 
                ? (['asset', 'expense'].includes(node.type) || node.can_make_payment || node.can_receive_payment)
                : (['liability', 'income'].includes(node.type) || node.can_make_payment || node.can_receive_payment);
            
            // If it's a leaf node, check if it matches
            if (node.children.length === 0) {
                return isMatch ? node : null;
            }

            // If it's a parent, filter its children
            const filteredChildren = filterByEntryType(node.children);
            
            // If it matches OR has matching children, keep it
            if (isMatch || filteredChildren.length > 0) {
                return { ...node, children: filteredChildren };
            }
            return null;
        }).filter(Boolean);
    };

    return filterByEntryType(accountTree);
  };

  const addRow = () => {
    setEntries([...entries, { type: 'dr', account_id: null, debit: 0, credit: 0, description: "" }]);
  };

  const insertRow = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 0, { type: 'dr', account_id: null, debit: 0, credit: 0, description: "" });
    setEntries(newEntries);
  };

  const removeRow = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;

    // Business Logic: Sync Type with values
    if (field === 'type') {
        if (value === 'dr') newEntries[index].credit = 0;
        else newEntries[index].debit = 0;
    }

    if (field === 'debit' && Number(value) > 0) {
        newEntries[index].credit = 0;
        newEntries[index].type = 'dr';
    } else if (field === 'credit' && Number(value) > 0) {
        newEntries[index].debit = 0;
        newEntries[index].type = 'cr';
    }

    setEntries(newEntries);
  };

  /* ---------------- Multi-Account Narration Logic ---------------- */
  useEffect(() => {
    if (type !== 'payment' && type !== 'receipt') return;

    // We only auto-generate if description is empty or looks like one of our generated strings
    const currentDesc = formData.description || "";
    const isAutoGenerated = currentDesc === "" || 
                            currentDesc.startsWith("Payment to ") || 
                            currentDesc.startsWith("Received from ");
    
    if (!isAutoGenerated) return;

    // Find accounts that are NOT cash/bank (liquid)
    const targetEntries = entries.filter(e => {
        if (!e.account_id) return false;
        const acc = accounts.find(a => a.id === e.account_id);
        if (!acc) return false;
        const isLiquid = acc.can_make_payment || acc.can_receive_payment;
        return !isLiquid;
    });

    if (targetEntries.length === 0) {
        // If no target accounts, maybe reset if it was previously auto-generated? 
        // Better to just leave it or set to empty if it was ours.
        if (currentDesc.startsWith("Payment to ") || currentDesc.startsWith("Received from ")) {
            setFormData((prev: any) => ({ ...prev, description: "" }));
        }
        return;
    }

    const accountNames = targetEntries.map(e => {
        const acc = accounts.find(a => a.id === e.account_id);
        return acc?.name || "";
    }).filter(Boolean);

    // Remove duplicates (e.g. if someone adds same account twice)
    const uniqueNames = Array.from(new Set(accountNames));
    const namesString = uniqueNames.join(", ");

    if (type === 'payment') {
        setFormData((prev: any) => ({ ...prev, description: `Payment to ${namesString}` }));
    } else if (type === 'receipt') {
        setFormData((prev: any) => ({ ...prev, description: `Received from ${namesString}` }));
    }

  }, [entries, type, accounts]);

  const totalDebit = useMemo(() => entries.reduce((s, e) => s + Number(e.debit || 0), 0), [entries]);
  const totalCredit = useMemo(() => entries.reduce((s, e) => s + Number(e.credit || 0), 0), [entries]);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  /* ---------------- Submit ---------------- */

  const submit = async () => {
    if (!isBalanced) {
      toast.error("Voucher is not balanced. Debit must equal Credit.");
      return;
    }

    const filteredEntries = entries.filter(e => e.account_id && (Number(e.debit) > 0 || Number(e.credit) > 0));
    if (filteredEntries.length < 2) {
        toast.error("Voucher must have at least 2 entries with accounts selected.");
        return;
    }

    try {
      setLoading(true);
      await api.post("/vouchers", {
        type: type,
        journal_date: formData.journal_date.format("YYYY-MM-DD"),
        description: formData.description,
        entries: filteredEntries,
      });

      toast.success(`${toTitleCase(type)} Voucher saved successfully`);
      refresh();
      onClose();
      // Reset form
      setEntries([
        { type: 'dr', account_id: null, debit: 0, credit: 0, description: "" },
        { type: 'cr', account_id: null, debit: 0, credit: 0, description: "" },
      ]);
      setFormData({ journal_date: dayjs(), description: "" });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save voucher");
    } finally {
      setLoading(false);
    }
  };

  const getVoucherDescription = () => {
    switch (type) {
      case "payment":
        return "Used for any cash or bank payments for expenses, purchases, or party settlements.";
      case "receipt":
        return "Used for recording cash or bank receipts from sales, customers, or other income.";
      case "journal":
        return "Used for non-cash/bank adjustments, depreciation, or correcting entries.";
      case "contra":
        return "Used only for internal fund transfers (e.g., depositing cash to bank or withdrawing cash).";
      case "debit-note":
        return "Used to record purchase returns or reduce the amount owed to a supplier.";
      case "credit-note":
        return "Used to record sales returns or reduce the amount a customer owes.";
      case "opening-balance":
        return "Used to record initial account balances at the start of a fiscal year or when setting up a new business.";
      default:
        return "Record a manual journal entry for accounting activity.";
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <aside className="fixed right-0 top-0 z-50 h-full w-full sm:w-[1100px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">New {toTitleCase(type)} Voucher</h3>
            <p className="text-xs text-[#009966] font-medium max-w-[600px] leading-relaxed">
                {getVoucherDescription()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-5 rounded-xl border">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase">Voucher Date</label>
              <DatePicker
                className="w-full h-10"
                value={formData.journal_date}
                onChange={(d) => setFormData({ ...formData, journal_date: d || dayjs() })}
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase">Narration / Remarks</label>
              <Input
                className="h-10 border-gray-300 focus:ring-[#009966]"
                placeholder="Brief description of the transaction..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Entry Details</h4>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowAllAccounts(!showAllAccounts)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold uppercase tracking-tighter ${
                            showAllAccounts 
                            ? 'bg-[#009966] text-white border-[#009966] shadow-sm' 
                            : 'bg-white text-gray-400 border-gray-200 hover:border-[#009966] hover:text-[#009966]'
                        }`}
                    >
                        {showAllAccounts ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {showAllAccounts ? "Showing All Accounts" : "Show All Accounts"}
                    </button>
                </div>
            </div>

            <div className="border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b text-gray-600 font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left w-[10%]">Type</th>
                    <th className="px-4 py-3 text-left w-[30%]">Account Head</th>
                    <th className="px-4 py-3 text-right w-[15%]">Debit (Dr.)</th>
                    <th className="px-4 py-3 text-right w-[15%]">Credit (Cr.)</th>
                    <th className="px-4 py-3 text-left w-[25%]">Description</th>
                    <th className="px-4 py-3 text-center w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {entries.map((entry, index) => (
                    <Fragment key={index}>
                      <tr className="hover:bg-gray-50 transition-colors group/row">
                        <td className="p-3">
                          <Select
                            className="w-full font-bold"
                            value={entry.type}
                            onChange={(v) => updateEntry(index, 'type', v)}
                            options={[
                                { label: 'Dr', value: 'dr' },
                                { label: 'Cr', value: 'cr' },
                            ]}
                          />
                        </td>
                        <td className="p-3">
                          <TreeSelect
                            showSearch
                            style={{ width: '100%' }}
                            styles={{ popup: { root: { maxHeight: 400, overflow: 'auto' } } }}
                            placeholder="Select account"
                            allowClear
                            treeDefaultExpandAll
                            value={entry.account_id}
                            onChange={(v) => updateEntry(index, 'account_id', v)}
                            treeData={getFilteredAccountTree(entry.type)}
                            treeNodeFilterProp="title"
                            className="custom-tree-select-transparent"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            className="text-right border-transparent hover:border-gray-300 focus:border-[#009966] bg-transparent disabled:bg-gray-100/50 disabled:cursor-not-allowed"
                            value={entry.debit || ""}
                            onChange={(e) => updateEntry(index, 'debit', e.target.value)}
                            disabled={entry.type === 'cr'}
                            placeholder={entry.type === 'cr' ? "—" : "0.00"}
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            className="text-right border-transparent hover:border-gray-300 focus:border-[#009966] bg-transparent disabled:bg-gray-100/50 disabled:cursor-not-allowed"
                            value={entry.credit || ""}
                            onChange={(e) => updateEntry(index, 'credit', e.target.value)}
                            disabled={entry.type === 'dr'}
                            placeholder={entry.type === 'dr' ? "—" : "0.00"}
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            className="border-transparent hover:border-gray-300 focus:border-[#009966] bg-transparent"
                            placeholder="Optional info..."
                            value={entry.description}
                            onChange={(e) => updateEntry(index, 'description', e.target.value)}
                          />
                        </td>
                        <td className="p-3 text-center">
                          {entries.length > 2 && (
                            <button onClick={() => removeRow(index)} className="text-gray-400 hover:text-red-500 p-1">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Inter-row Insert Trigger */}
                      {index < entries.length - 1 && (
                        <tr className="group/insert h-0">
                          <td colSpan={6} className="p-0 relative h-0">
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/insert:opacity-100 transition-all z-20 -top-3 bottom-auto h-6">
                               <div className="w-full border-t-2 border-dashed border-[#009966]/40 mx-10"></div>
                               <button 
                                 onClick={() => insertRow(index + 1)}
                                 title="Insert row here"
                                 className="absolute bg-[#009966] text-white rounded-full p-1.5 shadow-lg hover:scale-125 transition-transform border-2 border-white"
                               >
                                 <Plus size={10} strokeWidth={4} />
                               </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                  {/* Add Row Button at Bottom */}
                  <tr className="bg-gray-50/50">
                    <td colSpan={6} className="p-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={addRow} 
                        className="w-full h-9 border-dashed border-2 border-gray-200 hover:border-[#009966] hover:text-[#009966] hover:bg-white transition-all group"
                      >
                        <Plus size={16} className="mr-2 group-hover:scale-125 transition-transform" /> 
                        Click here to add another row
                      </Button>
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50 border-t font-black">
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-right">TOTAL</td>
                    <td className="px-4 py-4 text-right text-green-700">
                        {formatNepaliCurrency(totalDebit)}
                    </td>
                    <td className="px-4 py-4 text-right text-green-700">
                        {formatNepaliCurrency(totalCredit)}
                    </td>
                    <td colSpan={2} className="px-4 py-4">
                        {difference > 0 ? (
                            <div className="flex items-center gap-1.5 text-amber-600 text-xs justify-end">
                                <AlertCircle size={14} />
                                Diff: {formatNepaliCurrency(difference)}
                            </div>
                        ) : isBalanced ? (
                            <div className="flex items-center gap-1.5 text-green-600 text-xs justify-end">
                                <CheckCircle2 size={14} />
                                Balanced
                            </div>
                        ) : null}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-5 flex justify-between items-center bg-gray-50">
          <div className="text-xs text-gray-400 uppercase font-semibold">
              Secure Transaction Entry
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="px-8">
              Cancel
            </Button>
            <Button
              className="bg-[#009966] text-white px-10 hover:bg-[#007A52] shadow-lg shadow-green-100"
              onClick={submit}
              disabled={loading || !isBalanced}
            >
              {loading ? "Saving Voucher..." : "Commit Transaction"}
            </Button>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        .custom-tree-select-transparent .ant-select-selector,
        .custom-select-transparent .ant-select-selector {
            border-color: transparent !important;
            background-color: transparent !important;
            padding: 0 !important;
        }
        .custom-tree-select-transparent .ant-select-selector:hover,
        .custom-select-transparent .ant-select-selector:hover {
            border-color: #d9d9d9 !important;
        }
        .ant-select-focused.custom-tree-select-transparent .ant-select-selector,
        .ant-select-focused.custom-select-transparent .ant-select-selector {
            border-color: #009966 !important;
            box-shadow: none !important;
        }
      `}</style>
    </>
  );
}
