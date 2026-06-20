import React, { useState } from "react";
import { ChevronRight, ChevronDown, Plus, Edit2, MoreVertical, Search, FileText } from "lucide-react";
import { DataTable } from "@/components/datatable/DataTable";
import { Button } from "@/components/ui/button";

export default function TreeTab({ 
  accounts, 
  tree, 
  loading,
  onAddChild,
  onEdit 
}: { 
  accounts: any[]; 
  tree: any[]; 
  loading: boolean;
  onAddChild: (acc: any) => void;
  onEdit: (acc: any) => void;
}) {
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [search, setSearch] = useState("");

  const toggleNode = (id: number) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (nodes: any[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div 
          className={`flex items-center gap-1 py-1.5 px-2 rounded cursor-pointer text-sm ${selectedNode?.id === node.id ? 'bg-[#009966]/10 text-[#009966] font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => setSelectedNode(node)}
        >
          {node.children && node.children.length > 0 ? (
            <div onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }} className="p-0.5 hover:bg-gray-200 rounded">
              {expandedNodes[node.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          ) : (
            <div className="w-4" />
          )}
          <span className="truncate">{node.code} - {node.name}</span>
        </div>
        {expandedNodes[node.id] && node.children && node.children.length > 0 && (
          <div>{renderTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  const getVisibleAccounts = () => {
    if (!selectedNode) return accounts;
    if (selectedNode.children && selectedNode.children.length > 0) {
      return selectedNode.children;
    }
    return [selectedNode];
  };

  const visibleAccounts = getVisibleAccounts().filter((a: any) => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.code.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: "Account Code & Name",
      accessorKey: "name",
      cell: ({ row }: any) => {
        const record = row.original;
        return (
          <span className="font-medium text-gray-900 cursor-pointer" onClick={() => setSelectedNode(record)}>
            {record.code} - {record.name}
          </span>
        );
      }
    },
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
      header: "Current Balance",
      accessorKey: "closing_balance",
      cell: ({ getValue, row }: any) => {
        const v = getValue() as number;
        const r = row.original;
        const val = Math.abs(v || 0);
        const suffix = (r.type === 'asset' || r.type === 'expense') ? (v >= 0 ? 'DR' : 'CR') : (v >= 0 ? 'CR' : 'DR');
        return <div className="text-right"><span className={`font-medium ${r.type === 'asset' ? 'text-green-600' : r.type === 'liability' ? 'text-red-600' : 'text-gray-900'}`}>{val.toLocaleString('en-IN', {minimumFractionDigits:2})} {suffix}</span></div>;
      }
    },
    {
      header: "Opening Balance",
      accessorKey: "opening_balance",
      cell: ({ getValue }: any) => {
        const v = getValue() as number;
        return <div className="text-right"><span className="text-gray-500">{Math.abs(v || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span></div>;
      }
    },
    {
      header: "Txn Count",
      accessorKey: "tx_count",
      cell: ({ getValue }: any) => {
        const v = getValue() as number;
        return <div className="text-center"><span className="text-gray-500">{v || 0}</span></div>;
      }
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }: any) => {
        const record = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onAddChild(record); }}><Plus size={14} className="text-gray-500" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onEdit(record); }}><Edit2 size={14} className="text-gray-500" /></Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col md:flex-row h-[600px] border-t border-gray-100">
      {/* Pane 1: Tree */}
      <div className="w-full md:w-1/4 border-r border-gray-100 p-3 flex flex-col bg-gray-50/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 text-xs tracking-wide">ACCOUNT TREE</h3>
          <Button variant="ghost" size="icon" className="h-5 w-5 bg-white shadow-sm border border-gray-200" onClick={() => onAddChild(null)}>
            <Plus size={12} className="text-gray-600" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar text-xs">
          {renderTree(tree)}
        </div>
      </div>

      {/* Pane 2: Table */}
      <div className="w-full md:w-2/4 flex flex-col border-r border-gray-100 bg-white relative">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            <input 
              className="w-full pl-7 pr-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs outline-none focus:border-[#009966] transition-colors"
              placeholder="Search accounts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs text-gray-500">
            {selectedNode ? `Children of ${selectedNode.name}` : `All (${accounts.length})`}
          </div>
        </div>
        <div className="flex-1 overflow-auto text-xs [&_.ant-table-cell]:py-2 [&_.ant-table-cell]:px-3">
          <DataTable 
            columns={columns} 
            data={visibleAccounts} 
            loading={loading}
            disablePagination
            pageSize={10000}
          />
        </div>
      </div>

      {/* Pane 3: Details */}
      <div className="w-full md:w-1/4 bg-gray-50/30 p-4 flex flex-col overflow-y-auto text-xs">
        <h3 className="font-bold text-gray-800 text-xs tracking-wide mb-3">ACCOUNT DETAILS</h3>
        
        {selectedNode ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">{selectedNode.code} - {selectedNode.name}</h2>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                selectedNode.type === 'asset' ? 'bg-green-100 text-green-700' :
                selectedNode.type === 'liability' ? 'bg-red-100 text-red-700' :
                selectedNode.type === 'equity' ? 'bg-purple-100 text-purple-700' :
                selectedNode.type === 'income' ? 'bg-blue-100 text-blue-700' :
                'bg-orange-100 text-orange-700'
              }`}>{selectedNode.type}</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Status</span>
                <span className={selectedNode.is_active ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {selectedNode.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Transactions</span>
                <span className="font-medium">{selectedNode.tx_count || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Last Activity</span>
                <span className="font-medium">{selectedNode.last_activity || '-'}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm space-y-2">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-1.5 mb-1.5">Financial Summary</h4>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Opening Balance</span>
                <span className="font-medium">{Math.abs(selectedNode.opening_balance || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Period Debit</span>
                <span className="font-medium text-gray-900">{Math.abs(selectedNode.debit || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Period Credit</span>
                <span className="font-medium text-gray-900">{Math.abs(selectedNode.credit || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gray-50 font-bold">
                <span className="text-gray-800">Current Balance</span>
                <span className={selectedNode.type === 'asset' ? 'text-green-600' : 'text-gray-900'}>{Math.abs(selectedNode.closing_balance || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full text-[10px] h-7 bg-white" onClick={() => window.open(`/dashboard/admin/accounting/accounts/${selectedNode.id}/ledger`, '_blank')}>
                <FileText size={10} className="mr-1" /> View Ledger
              </Button>
              <Button variant="outline" className="w-full text-[10px] h-7 bg-white" onClick={() => onEdit(selectedNode)}>
                <Edit2 size={10} className="mr-1" /> Edit Account
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <Search size={18} className="text-gray-300" />
            </div>
            <p className="text-xs">Select an account to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
