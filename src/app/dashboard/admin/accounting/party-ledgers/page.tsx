"use client";

import { useEffect, useState, useMemo } from "react";

import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { partyColumns } from "./party-columns";
import PartyLedgerForm from "@/components/parties/PartyLedgerForm";
import { PartyLedger } from "@/types/party-ledger";
import { useRouter } from "next/navigation";

export default function PartyLedgersPage() {
  const [data, setData] = useState<PartyLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<PartyLedger | null>(null);

  const loadPartyLedgers = async () => {
    setLoading(true);
    try{
      const res = await api.get("/parties");
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartyLedgers();
  }, []);

  const router = useRouter();

  const columns = useMemo(
    () => partyColumns(router, setEditItem, setOpenForm, loadPartyLedgers),
    []
  );

  

  return (
    <div className="space-y-6">
     

      <div className="flex justify-between items-center">
         <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard/admin" },
          { label: "Parties" },
        ]}
      />

        <Button
          className="bg-[#009966] text-white"
          onClick={() => {
            setEditItem(null);
            setOpenForm(true);
          }}
        >
          <Plus className="mr-2" size={16} /> Add Party Ledger
        </Button>
      </div>

      <DataTable
        title="Party Ledger List"
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No party ledgers found."
        pageSize={9999}
        disablePagination
      />

      <PartyLedgerForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={loadPartyLedgers}
        editData={editItem}
      />
    </div>
  );
}
