"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Download, Plus, Search } from "lucide-react";
import { Select } from "antd";
import AccountForm from "./AccountFormDrawer";
import { buildTree } from "./utils/treeHelpers";
import TopKPIs from "./components/TopKPIs";
import TreeTab from "./components/TreeTab";
import FinancialViewTab from "./components/FinancialViewTab";
import BalancesTab from "./components/BalancesTab";
import ActivityTab from "./components/ActivityTab";

const { Option } = Select;

export default function ChartOfAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [selectedFyId, setSelectedFyId] = useState<number | null>(null);
  
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fiscalYear, setFiscalYear] = useState<any>(null);

  const [openForm, setOpenForm] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [parentForNew, setParentForNew] = useState<any>(null);

  const [activeTab, setActiveTab] = useState("tree");

  const loadFiscalYears = async () => {
    try {
      const res = await api.get("/fiscal-years");
      setFiscalYears(res.data);
      const active = res.data.find((f: any) => f.is_active);
      if (active) setSelectedFyId(active.id);
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async (fyId: number | null) => {
    setLoading(true);
    try {
      const params = fyId ? { fiscal_year_id: fyId } : {};
      const res = await api.get("/account/coa-data", { params });
      setAccounts(res.data.accounts);
      setFiscalYear(res.data.fiscal_year);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiscalYears();
  }, []);

  useEffect(() => {
    if (selectedFyId) {
      loadData(selectedFyId);
    }
  }, [selectedFyId]);

  const tree = useMemo(() => buildTree(accounts), [accounts]);

  const handleAddChild = (parentAcc: any) => {
    setEditAccount(null);
    setParentForNew(parentAcc);
    setOpenForm(true);
  };

  const handleEdit = (acc: any) => {
    setEditAccount(acc);
    setParentForNew(null);
    setOpenForm(true);
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard/admin" },
              { label: "Accounting", href: "/dashboard/admin/accounting" },
              { label: "Accounts" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-800 mt-1">Chart of Accounts</h1>
        </div>

        <div className="flex items-center gap-3">
          <Select
            className="w-40"
            value={selectedFyId}
            onChange={setSelectedFyId}
            placeholder="Fiscal Year"
          >
            {fiscalYears.map(fy => (
              <Option key={fy.id} value={fy.id}>
                {fy.name}
              </Option>
            ))}
          </Select>

          <Button variant="outline" className="h-9 px-3 border-gray-200">
            <Download size={16} className="mr-2" />
            Export
          </Button>

          <Button
            className="bg-[#009966] hover:bg-[#008855] text-white h-9 px-4"
            onClick={() => {
              setEditAccount(null);
              setParentForNew(null);
              setOpenForm(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <TopKPIs accounts={accounts} fiscalYear={fiscalYear} />

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
        <div className="flex items-center border-b border-gray-100 overflow-x-auto">
          {["tree", "financial", "balances", "activity"].map(tab => (
            <button
              key={tab}
              className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${
                activeTab === tab ? "text-[#009966]" : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "tree" && "Tree View"}
              {tab === "financial" && "Financial View"}
              {tab === "balances" && "Balances"}
              {tab === "activity" && "Activity"}
              
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#009966]" />
              )}
            </button>
          ))}
        </div>

        <div className="p-0">
          {activeTab === "tree" && (
            <TreeTab 
              accounts={accounts} 
              tree={tree} 
              loading={loading}
              onAddChild={handleAddChild}
              onEdit={handleEdit}
            />
          )}
          {activeTab === "financial" && (
            <FinancialViewTab accounts={accounts} loading={loading} />
          )}
          {activeTab === "balances" && (
            <BalancesTab accounts={accounts} loading={loading} />
          )}
          {activeTab === "activity" && (
            <ActivityTab fiscalYear={fiscalYear} />
          )}
        </div>
      </div>

      <AccountForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={() => loadData(selectedFyId)}
        account={editAccount}
        parentForNew={parentForNew || undefined}
      />
    </div>
  );
}
