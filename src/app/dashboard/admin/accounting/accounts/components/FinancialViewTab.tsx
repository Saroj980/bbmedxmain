import React from "react";
import { DataTable } from "@/components/datatable/DataTable";

export default function FinancialViewTab({ accounts, loading }: { accounts: any[]; loading: boolean }) {
  // We want to group accounts by Type (Asset, Liability, Equity, Income, Expense)
  // And we only show LEAF accounts or Level 1 accounts in this view.
  // Actually, to make it exactly like the screenshot, we group by TYPE.
  
  const types = ["asset", "liability", "equity", "income", "expense"];
  
  const columns = [
    { header: "Account Code", accessorKey: "code" },
    { header: "Account Name", accessorKey: "name" },
    { 
      header: "Type", 
      accessorKey: "type",
      cell: ({ getValue }: any) => <span className="uppercase text-xs font-bold text-gray-500">{getValue() as string}</span>
    },
    { 
      header: "Category", 
      accessorKey: "category",
      cell: ({ getValue }: any) => <span className="text-gray-600 capitalize">{(getValue() as string) || '-'}</span>
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
      header: "Current Balance", 
      accessorKey: "closing_balance",
      cell: ({ getValue, row }: any) => {
        const v = getValue() as number;
        const r = row.original;
        return <div className="text-right"><span className={`font-bold ${r.type === 'asset' ? 'text-green-600' : r.type === 'liability' ? 'text-red-600' : 'text-gray-900'}`}>{Math.abs(v || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span></div>;
      }
    }
  ];

  return (
    <div className="p-3 space-y-4 text-xs">
      {types.map(type => {
        const typeAccounts = accounts.filter(a => a.type === type && !accounts.some(child => child.parent_id === a.id));
        if (typeAccounts.length === 0) return null;
        
        const typeTotal = typeAccounts.reduce((acc, curr) => acc + (Number(curr.closing_balance) || 0), 0);
        const typeName = type === 'asset' ? 'ASSETS' : 
                         type === 'liability' ? 'LIABILITIES' : 
                         type === 'equity' ? 'EQUITY' : 
                         type === 'income' ? 'INCOME' : 'EXPENSES';
                         
        const headerColor = type === 'asset' ? 'bg-green-50 text-green-800 border-green-100' :
                            type === 'liability' ? 'bg-red-50 text-red-800 border-red-100' :
                            type === 'equity' ? 'bg-purple-50 text-purple-800 border-purple-100' :
                            type === 'income' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                            'bg-orange-50 text-orange-800 border-orange-100';

        return (
          <div key={type} className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className={`px-3 py-2 border-b flex justify-between items-center ${headerColor}`}>
              <h3 className="font-bold tracking-wide flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                {typeName}
              </h3>
              <div className="font-bold text-xs">
                Total: {Math.abs(typeTotal).toLocaleString('en-IN', {minimumFractionDigits:2})}
              </div>
            </div>
            <div className="[&_.ant-table-cell]:py-1.5 [&_.ant-table-cell]:px-2 [&_.ant-table-cell]:text-xs">
              <DataTable 
                columns={columns} 
                data={typeAccounts} 
                loading={loading}
                disablePagination
                pageSize={1000}
                // Remove inner border
                className="border-0"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
