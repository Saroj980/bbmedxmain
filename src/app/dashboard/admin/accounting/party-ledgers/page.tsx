"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Users, Truck, UserCircle, Activity, Download, Upload, Search, Filter } from "lucide-react";
import { partyColumns } from "./party-columns";
import PartyLedgerForm from "@/components/parties/PartyLedgerForm";
import { PartyLedger } from "@/types/party-ledger";
import { useRouter } from "next/navigation";
import { Select } from "antd";
import FiscalYearSelect from "@/components/common/FiscalYearSelect";

export default function PartyLedgersPage() {
  const [data, setData] = useState<PartyLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<PartyLedger | null>(null);
  const [fiscalYearId, setFiscalYearId] = useState<string | number | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadPartyLedgers = async () => {
    setLoading(true);
    try {
      // NOTE: Current balance logic on backend currently ignores FY, but we pass it anyway 
      // in case backend supports it in the future for date-ranged balances.
      const res = await api.get("/parties", { params: { fiscal_year_id: fiscalYearId } });
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartyLedgers();
  }, [fiscalYearId]);

  const router = useRouter();

  const columns = useMemo(
    () => partyColumns(router, setEditItem, setOpenForm, loadPartyLedgers),
    []
  );

  // Calculate KPIs
  const totalParties = data.length;
  const customers = data.filter(d => d.type === 'customer').length;
  const suppliers = data.filter(d => d.type === 'supplier').length;
  const walkins = data.filter(d => d.type === 'walkin').length;
  const activeParties = data.filter(d => d.is_active).length;

  const getPercent = (count: number) => {
    if (totalParties === 0) return "0.0%";
    return ((count / totalParties) * 100).toFixed(1) + "%";
  };

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const q = search.toLowerCase();
      const matchSearch = 
        (item.name?.toLowerCase().includes(q)) || 
        (item.code?.toLowerCase().includes(q)) || 
        (item.phone?.toLowerCase().includes(q)) || 
        (item.email?.toLowerCase().includes(q));
        
      const matchCat = categoryFilter === "all" || item.type === categoryFilter;
      const matchStatus = statusFilter === "all" 
        || (statusFilter === "active" && item.is_active) 
        || (statusFilter === "inactive" && !item.is_active);
        
      return matchSearch && matchCat && matchStatus;
    });
  }, [data, search, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Party Ledger</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all your customers, suppliers and walk-in parties in one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="h-9 bg-[#009966] text-white hover:bg-[#007f55] shadow-sm px-4"
            onClick={() => {
              setEditItem(null);
              setOpenForm(true);
            }}
          >
            <Plus className="mr-2" size={16} /> Add Party
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Parties</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">{totalParties}</h3>
            <p className="text-xs text-gray-500 mt-1.5">All Registered Parties</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
            <UserCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Customers</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">{customers}</h3>
            <p className="text-xs text-gray-500 mt-1.5">{getPercent(customers)} of total</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Suppliers</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">{suppliers}</h3>
            <p className="text-xs text-gray-500 mt-1.5">{getPercent(suppliers)} of total</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
            <UserCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Walk-ins</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">{walkins}</h3>
            <p className="text-xs text-gray-500 mt-1.5">{getPercent(walkins)} of total</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Active Parties</p>
            <h3 className="text-2xl font-bold text-gray-900 leading-none">{activeParties}</h3>
            <p className="text-xs text-gray-500 mt-1.5">{getPercent(activeParties)} active</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row gap-4 bg-gray-50/50">
          <div className="flex-1 max-w-md lg:self-end mb-[1px]">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all shadow-sm"
                placeholder="Search by name, code, phone or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
            <div className="w-40">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { label: "All Categories", value: "all" },
                  { label: "Customer", value: "customer" },
                  { label: "Supplier", value: "supplier" },
                  { label: "Walk-in", value: "walkin" },
                ]}
                className="w-full h-9"
              />
            </div>
            <div className="w-36">
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
          </div>
        </div>

        {/* Data Table */}
        <div className="[&_.ant-table-wrapper]:border-0">
          <DataTable
            columns={columns}
            data={filteredData}
            loading={loading}
            emptyMessage="No parties found matching your filters."
            pageSize={20}
            disableSearch={true}
          />
        </div>
      </div>

      <PartyLedgerForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={loadPartyLedgers}
        editData={editItem}
      />
    </div>
  );
}
