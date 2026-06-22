"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Table, InputNumber, Select, message } from "antd";
import { Save, Search, CheckCircle2, AlertCircle, Hash, Calculator, FileText, Download, Upload, Filter, Wallet, Activity } from "lucide-react";
import { buildTree } from "../accounts/utils/treeHelpers";
import FiscalYearSelect from "@/components/common/FiscalYearSelect";

export default function OpeningBalancesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flatAccounts, setFlatAccounts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [fiscalYearId, setFiscalYearId] = useState<string | number | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/accounts", { params: { active: 1 } });
      const data = res.data || [];
      const initialized = data.map((acc: any) => ({
        ...acc,
        opening_balance: acc.opening_balance ? Number(acc.opening_balance) : 0,
        opening_balance_type: acc.opening_balance_type || "dr",
      }));
      setFlatAccounts(initialized);
    } catch (err) {
      console.error(err);
      message.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceChange = (id: number, val: number | null) => {
    setFlatAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, opening_balance: val || 0 } : acc
      )
    );
  };

  const handleTypeChange = (id: number, val: string) => {
    setFlatAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, opening_balance_type: val } : acc
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        accounts: flatAccounts.map((acc) => ({
          id: acc.id,
          opening_balance: acc.opening_balance,
          opening_balance_type: acc.opening_balance_type,
        })),
      };

      await api.post("/accounts/opening-balances", payload);
      message.success("Opening balances updated successfully");
      loadAccounts();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || "Failed to update balances");
    } finally {
      setSaving(false);
    }
  };

  const leafAccounts = useMemo(() => {
    return flatAccounts.filter(a => !flatAccounts.some(child => child.parent_id === a.id));
  }, [flatAccounts]);

  const totalDebit = useMemo(() => {
    return leafAccounts
      .filter(a => a.opening_balance_type === 'dr')
      .reduce((acc, curr) => acc + (curr.opening_balance || 0), 0);
  }, [leafAccounts]);

  const totalCredit = useMemo(() => {
    return leafAccounts
      .filter(a => a.opening_balance_type === 'cr')
      .reduce((acc, curr) => acc + (curr.opening_balance || 0), 0);
  }, [leafAccounts]);

  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01;

  const filteredData = useMemo(() => {
    let filtered = flatAccounts;
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }

    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        a => (a.name && a.name.toLowerCase().includes(lower)) || 
             (a.code && a.code.toLowerCase().includes(lower))
      );
      // For searching, flat list is usually better
      return filtered; 
    }
    
    // Only build tree if not searching
    return buildTree(filtered, null);
  }, [flatAccounts, search, typeFilter]);

  const fmt = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(val));
  };

  const typeData = useMemo(() => {
    const types = ['asset', 'liability', 'equity', 'income', 'expense'];
    return types.map(t => {
      const total = leafAccounts.filter(a => a.type === t).reduce((acc, curr) => acc + (curr.opening_balance || 0), 0);
      return { type: t, total };
    });
  }, [leafAccounts]);

  const totalSum = typeData.reduce((acc, curr) => acc + curr.total, 0) || 1;

  const columns = [
    {
      title: "Account Code",
      dataIndex: "code",
      key: "code",
      width: 140,
      render: (code: string, record: any) => {
        const hasChildren = flatAccounts.some(child => child.parent_id === record.id);
        return (
          <div className="flex items-center gap-2">
            <Wallet size={14} className={hasChildren ? "text-gray-400" : "text-[#009966]"} />
            <span className={hasChildren ? "font-bold text-gray-700" : "font-medium"}>{code}</span>
          </div>
        );
      }
    },
    {
      title: "Account Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => {
        const hasChildren = flatAccounts.some(child => child.parent_id === record.id);
        return <span className={hasChildren ? "font-bold text-gray-800" : "text-gray-700"}>{name}</span>;
      }
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => {
        const colors: Record<string, string> = {
          asset: 'text-green-600',
          liability: 'text-red-600',
          equity: 'text-purple-600',
          income: 'text-blue-600',
          expense: 'text-orange-600'
        };
        return <span className={`capitalize font-medium text-xs ${colors[type] || 'text-gray-500'}`}>{type}</span>;
      },
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (c: string) => <span className="capitalize text-xs text-gray-500">{c || "—"}</span>,
    },
    {
      title: "Opening Balance",
      key: "opening_balance",
      align: "right" as const,
      width: 160,
      render: (_: any, record: any) => {
        const hasChildren = flatAccounts.some(child => child.parent_id === record.id);
        if (hasChildren) {
          return <span className="text-gray-300 font-medium">—</span>;
        }
        return (
          <InputNumber
            min={0}
            value={record.opening_balance}
            onChange={(val) => handleBalanceChange(record.id, val)}
            className="w-full text-right text-xs"
            size="small"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
          />
        );
      },
    },
    {
      title: "Dr/Cr",
      key: "opening_balance_type",
      width: 80,
      render: (_: any, record: any) => {
        const hasChildren = flatAccounts.some(child => child.parent_id === record.id);
        if (hasChildren) {
          return <span className="text-gray-300 font-medium">—</span>;
        }
        return (
          <Select
            value={record.opening_balance_type}
            onChange={(val) => handleTypeChange(record.id, val)}
            options={[
              { label: "Dr", value: "dr" },
              { label: "Cr", value: "cr" },
            ]}
            className="w-full text-xs"
            size="small"
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Opening Balances</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update opening balances for all active accounts. Any changes made will automatically generate adjustment journal entries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-40">
            <FiscalYearSelect 
              value={fiscalYearId} 
              onChange={setFiscalYearId} 
            />
          </div>
          <Button
            className="h-9 text-xs bg-[#009966] text-white hover:bg-[#007f55] shadow-sm"
            onClick={handleSave}
            disabled={loading || saving}
          >
            {saving ? "Saving..." : <><Save size={14} className="mr-2" /> Save Changes</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#009966]/10 flex items-center justify-center text-[#009966] flex-shrink-0">
            <Hash size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Accounts</p>
            <h3 className="text-xl font-bold text-gray-900">{flatAccounts.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Debits (Dr)</p>
            <h3 className="text-lg font-bold text-gray-900">NPR {fmt(totalDebit)}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
            <Calculator size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Credits (Cr)</p>
            <h3 className="text-lg font-bold text-gray-900">NPR {fmt(totalCredit)}</h3>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-3">
          <h3 className="font-bold text-gray-800 text-sm tracking-wide">OPENING BALANCE SUMMARY</h3>
          <div className={`px-4 py-1.5 rounded-lg border text-sm flex items-center gap-2 font-bold ${isBalanced ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {isBalanced ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            Difference: NPR {fmt(difference)}
          </div>
        </div>
        
        <div className="w-full flex h-3 rounded-full overflow-hidden mb-3 bg-gray-100">
          {typeData.map(d => {
            const pct = totalSum > 1 ? (d.total / totalSum) * 100 : 0;
            if (pct === 0) return null;
            const colors: Record<string, string> = {
              asset: 'bg-green-500', liability: 'bg-red-500', equity: 'bg-purple-500', income: 'bg-blue-500', expense: 'bg-orange-500'
            };
            return <div key={d.type} style={{width: `${pct}%`}} className={colors[d.type]} title={`${d.type}: ${pct.toFixed(1)}%`} />
          })}
        </div>
        
        <div className="flex flex-wrap gap-4 text-xs">
          {typeData.map(d => {
            const pct = totalSum > 1 ? (d.total / totalSum) * 100 : 0;
            const colors: Record<string, string> = {
              asset: 'bg-green-500', liability: 'bg-red-500', equity: 'bg-purple-500', income: 'bg-blue-500', expense: 'bg-orange-500'
            };
            return (
              <div key={d.type} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${colors[d.type]}`}></span>
                <span className="capitalize font-medium text-gray-700">{d.type}</span>
                <span className="text-gray-500">NPR {fmt(d.total)} ({pct.toFixed(1)}%)</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-4 h-[calc(100vh-320px)]">
        <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex gap-3 bg-gray-50/50">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-[#009966] transition-colors shadow-sm"
                placeholder="Search account by code or name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { label: "All Types", value: "all" },
                  { label: "Asset", value: "asset" },
                  { label: "Liability", value: "liability" },
                  { label: "Equity", value: "equity" },
                  { label: "Income", value: "income" },
                  { label: "Expense", value: "expense" },
                ]}
                className="w-full"
              />
            </div>
            <Button variant="outline" className="h-8 px-3 text-xs">
              <Filter size={14} className="mr-2" /> Filters
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto p-3 [&_.ant-table-cell]:py-2 [&_.ant-table-cell]:px-3 [&_.ant-table-cell]:text-xs">
            <Table
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              pagination={false}
              size="small"
              className="border-0"
              expandable={{
                defaultExpandAllRows: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
