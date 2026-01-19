"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { flattenAccounts, flattenCategories } from "@/lib/tree-flatten";
import { treeAccountColumns } from "./account-columns";
import type { Account } from "@/types/account";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AccountForm from "./AccountFormDrawer";

export default function AccountsPage() {
  const [rawTree, setRawTree] = useState<Account[]>([]);
  const [flat, setFlat] = useState<Account[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  const [openForm, setOpenForm] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [parentForNew, setParentForNew] = useState<Account | null>(null);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/account/tree");
      const tree = res.data;

      const expandAll: Record<number, boolean> = {};
      const markExpanded = (list: Account[]) => {
        list.forEach(a => {
          if (a.children?.length) {
            expandAll[a.id] = true;
            markExpanded(a.children);
          }
        });
      };

      markExpanded(tree);

      setExpanded(expandAll);
      setRawTree(tree);
      setFlat(flattenAccounts(tree));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const toggleRow = (id: number) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const visibleRows = flat;


  const columns = useMemo(
    () =>
      treeAccountColumns(
        toggleRow,
        expanded,
        (a) => {
          setParentForNew(a);
          setEditAccount(null);
          setOpenForm(true);
        },
        (a) => {
          setEditAccount(a);
          setOpenForm(true);
        }
      ),
    [expanded]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Accounting", href: "/dashboard/admin/accounting" },
            { label: "Accounts" },
          ]}
        />

        <Button
          className="bg-[#009966] text-white"
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

      <DataTable
        title="Chart of Accounts"
        columns={columns}
        data={visibleRows}
        loading={loading}
        disablePagination
        pageSize={10000}
        emptyMessage="No accounts found"
        
      />

      <AccountForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={loadAccounts}
        account={editAccount}
        parentForNew={parentForNew || undefined}
      />
    </div>
  );
}
