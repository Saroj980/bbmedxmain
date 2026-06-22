import React from "react";
import { Folder, ArrowUpRight, ArrowDownRight, Briefcase, Scale, PieChart, Activity } from "lucide-react";

export default function TopKPIs({ accounts, fiscalYear }: { accounts: any[]; fiscalYear: any }) {
  const totalAccounts = accounts.length;

  const typeTotal = (type: string) => {
    return accounts
      .filter((a) => a.type === type && !a.children?.length) // wait, the flat list has closing_balances which is correct. Wait, we should sum leaf accounts, or sum level 1.
      // Wait, in standard accounting, parent balances are just sums of children.
      // If we sum all accounts, we will double count!
      // I should only sum LEAF accounts.
      .filter((a) => !accounts.some((child) => child.parent_id === a.id))
      .reduce((acc, curr) => acc + (Number(curr.closing_balance) || 0), 0);
  };

  const assets = typeTotal("asset");
  const liabilities = typeTotal("liability");
  const equity = typeTotal("equity");
  const income = typeTotal("income");
  const expenses = typeTotal("expense");

  const netProfit = income - expenses;
  
  // Trial balance: Assets + Expenses should equal Liabilities + Equity + Income
  const drSide = assets + expenses;
  const crSide = liabilities + equity + income;
  const diff = Math.abs(drSide - crSide);
  
  const isBalanced = diff < 1;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(val));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
          <Folder size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Accounts</p>
          <h3 className="text-lg font-bold text-gray-900">{totalAccounts}</h3>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
          <Briefcase size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Assets</p>
          <h3 className="text-sm font-bold text-gray-900">NPR {formatCurrency(assets)}</h3>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
          <Scale size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Liabilities</p>
          <h3 className="text-sm font-bold text-gray-900">NPR {formatCurrency(liabilities)}</h3>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
          <PieChart size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Equity</p>
          <h3 className="text-sm font-bold text-gray-900">NPR {formatCurrency(equity)}</h3>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
          <ArrowUpRight size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Income</p>
          <h3 className="text-sm font-bold text-gray-900">NPR {formatCurrency(income)}</h3>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
          <ArrowDownRight size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Expenses</p>
          <h3 className="text-sm font-bold text-gray-900">NPR {formatCurrency(expenses)}</h3>
        </div>
      </div>

      <div className="bg-[#009966]/5 p-3 rounded-xl border border-[#009966]/20 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#009966]/10 flex items-center justify-center text-[#009966] flex-shrink-0">
          <Activity size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-[#009966] uppercase tracking-wider mb-0.5">Net Profit</p>
          <h3 className="text-sm font-bold text-gray-900">NPR {formatCurrency(netProfit)}</h3>
        </div>
      </div>

      <div className={`p-3 rounded-xl border shadow-sm flex items-center gap-3 ${isBalanced ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isBalanced ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          <Scale size={18} />
        </div>
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>Trial Balance</p>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1">
            {isBalanced ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Balanced
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Diff: {formatCurrency(diff)}
              </>
            )}
          </h3>
        </div>
      </div>
    </div>
  );
}
