import React from "react";
import { DataTable } from "@/components/datatable/DataTable";
import { Scale } from "lucide-react";

export default function BalancesTab({ accounts, loading }: { accounts: any[]; loading: boolean }) {
  const leafAccounts = accounts.filter(a => !accounts.some(child => child.parent_id === a.id));

  const columns = [
    { header: "Account Code", accessorKey: "code" },
    { header: "Account Name", accessorKey: "name" },
    { 
      header: "Type", 
      accessorKey: "type",
      cell: ({ getValue }: any) => {
        const t = getValue() as string;
        return (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            t === 'asset' ? 'bg-green-100 text-green-700' :
            t === 'liability' ? 'bg-red-100 text-red-700' :
            t === 'equity' ? 'bg-purple-100 text-purple-700' :
            t === 'income' ? 'bg-blue-100 text-blue-700' :
            'bg-orange-100 text-orange-700'
          }`}>{t}</span>
        );
      }
    },
    { 
      header: "Opening Balance", 
      accessorKey: "opening_balance",
      cell: ({ getValue }: any) => <div className="text-right"><span className="text-gray-600">{Math.abs((getValue() as number) || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span></div>
    },
    { 
      header: "Debit", 
      accessorKey: "debit",
      cell: ({ getValue }: any) => <div className="text-right"><span className="text-gray-900">{Math.abs((getValue() as number) || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span></div>
    },
    { 
      header: "Credit", 
      accessorKey: "credit",
      cell: ({ getValue }: any) => <div className="text-right"><span className="text-gray-900">{Math.abs((getValue() as number) || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span></div>
    },
    { 
      header: "Closing Balance", 
      accessorKey: "closing_balance",
      cell: ({ getValue, row }: any) => {
        const v = getValue() as number;
        const r = row.original;
        return <div className="text-right"><span className={`font-bold ${r.type === 'asset' ? 'text-green-600' : r.type === 'liability' ? 'text-red-600' : 'text-gray-900'}`}>{Math.abs(v || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span></div>;
      }
    },
    {
      header: "Balance Type",
      id: "balanceType",
      cell: ({ row }: any) => {
        const r = row.original;
        const v = r.closing_balance || 0;
        if (v === 0) return <div className="text-center"><span className="text-gray-400 text-xs font-medium">Zero</span></div>;
        
        let type = '';
        if (r.type === 'asset' || r.type === 'expense') type = v >= 0 ? 'DR' : 'CR';
        else type = v >= 0 ? 'CR' : 'DR'; // Assuming backend handles negatives as opposites
        
        return <div className="text-center"><span className="text-gray-600 text-xs font-bold">{type}</span></div>;
      }
    }
  ];

  const typeTotal = (type: string) => leafAccounts.filter(a => a.type === type).reduce((acc, curr) => acc + (Number(curr.closing_balance) || 0), 0);
  
  const assets = typeTotal("asset");
  const liabilities = typeTotal("liability");
  const equity = typeTotal("equity");
  const income = typeTotal("income");
  const expenses = typeTotal("expense");
  const netProfit = income - expenses;

  const drSide = assets + expenses;
  const crSide = liabilities + equity + income;
  const diff = Math.abs(drSide - crSide);
  const isBalanced = diff < 1;

  const fmt = (val: number) => Math.abs(val).toLocaleString('en-IN', {minimumFractionDigits:2});

  return (
    <div className="flex flex-col lg:flex-row h-[700px] bg-gray-50/30 text-xs">
      <div className="w-full lg:w-3/4 p-3 border-r border-gray-100 overflow-auto [&_.ant-table-cell]:py-1.5 [&_.ant-table-cell]:px-2 [&_.ant-table-cell]:text-xs">
        <DataTable 
          columns={columns}
          data={leafAccounts}
          loading={loading}
          pageSize={20}
        />
      </div>
      <div className="w-full lg:w-1/4 p-4 bg-white overflow-auto">
        <h3 className="font-bold text-gray-800 text-xs tracking-wide mb-4 pb-2 border-b border-gray-100">BALANCE SUMMARY</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Assets</h4>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-green-700">Total Assets</span>
              <span className="font-bold text-green-700">{fmt(assets)} DR</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Liabilities</h4>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-red-700">Total Liabilities</span>
              <span className="font-bold text-red-700">{fmt(liabilities)} CR</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Equity</h4>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-purple-700">Total Equity</span>
              <span className="font-bold text-purple-700">{fmt(equity)} CR</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Income</h4>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-blue-700">Total Income</span>
              <span className="font-bold text-blue-700">{fmt(income)} CR</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expenses</h4>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-orange-700">Total Expenses</span>
              <span className="font-bold text-orange-700">{fmt(expenses)} DR</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs mb-3">
              <span className="font-bold text-[#009966]">Net Profit</span>
              <span className="font-bold text-[#009966]">{fmt(netProfit)} CR</span>
            </div>

            <div className={`p-3 rounded-lg border flex items-center justify-between ${isBalanced ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-center gap-1.5">
                <Scale size={14} className={isBalanced ? 'text-green-600' : 'text-red-600'} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>Trial Balance</span>
              </div>
              <span className={`font-bold text-xs ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                {isBalanced ? 'Balanced' : 'Diff: ' + fmt(diff)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
