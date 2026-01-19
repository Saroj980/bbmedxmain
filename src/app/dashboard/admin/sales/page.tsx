"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { DataTable } from "@/components/datatable/DataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import SaleForm from "@/components/sales/SaleForm";
import { salesColumns } from "./sales-columns";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { ADToBS } from "bikram-sambat-js";

/* ---------------- Helpers ---------------- */
const adToBs = (adDate?: string | null) => {
  if (!adDate) return null;
  return ADToBS(adDate); // returns "2076-05-08"
};

const disableFutureDates = (current: dayjs.Dayjs) => {
  return current && current > dayjs().endOf("day");
};

export default function SalesPage() {
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  /* ---------------- Filters ---------------- */
  const [filters, setFilters] = useState<{
    from: string | null;
    to: string | null;
  }>({
    from: null,
    to: null,
  });

  /* ---------------- Load Sales ---------------- */
  const loadSales = useCallback(
    async (page = 1, appliedFilters = filters) => {
      setLoading(true);
      try {
        const res = await api.get("/sales", {
          params: {
            page,
            ...appliedFilters,
          },
        });

        setData(res.data.data || []);
        setPagination({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          per_page: res.data.per_page,
          total: res.data.total,
        });
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  /* ---------------- Initial + Filter Reload ---------------- */
  useEffect(() => {
    loadSales(1);
  }, [loadSales]);

  /* ---------------- Columns ---------------- */
  const columns = useMemo(
    () => salesColumns(loadSales),
    [loadSales]
  );

  const bsFrom = adToBs(filters.from);
  const bsTo = adToBs(filters.to);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard/admin" },
            { label: "Accounting" },
            { label: "Sales" },
          ]}
        />

        <Button
          className="bg-[#009966] text-white"
          onClick={() => setOpenForm(true)}
        >
          <Plus size={16} className="mr-2" />
          New Sale
        </Button>
      </div>

      {/* ---------------- Date Filters ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* From Date */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            From Date (AD)
          </label>
          <DatePicker
            className="w-full"
            value={filters.from ? dayjs(filters.from) : null}
            onChange={(date) =>
              setFilters(prev => ({
                ...prev,
                from: date ? date.format("YYYY-MM-DD") : null,
              }))
            }
            format="YYYY-MM-DD"
            placeholder="Start date"
            disabledDate={disableFutureDates}
          />
          {bsFrom && (
            <p className="text-xs text-gray-500 mt-1">
              BS: {bsFrom}
            </p>
          )}
        </div>

        {/* To Date */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            To Date (AD)
          </label>
          <DatePicker
            className="w-full"
            value={filters.to ? dayjs(filters.to) : null}
            onChange={(date) =>
              setFilters(prev => ({
                ...prev,
                to: date ? date.format("YYYY-MM-DD") : null,
              }))
            }
            format="YYYY-MM-DD"
            placeholder="End date"
            disabledDate={disableFutureDates}
          />
          {bsTo && (
            <p className="text-xs text-gray-500 mt-1">
              BS: {bsTo}
            </p>
          )}
        </div>

        {/* Clear */}
        <div className="flex items-center">
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              setFilters({
                from: null,
                to: null,
              })
            }
          >
            Clear Dates
          </Button>
        </div>
      </div>

      {/* ---------------- Table ---------------- */}
      <DataTable
        title="Sales Invoices"
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No sales found."
        pagination={{
          currentPage: pagination?.current_page,
          pageSize: pagination?.per_page,
          total: pagination?.total,
          onPageChange: (page) => loadSales(page),
        }}
      />

      {/* ---------------- Sale Form ---------------- */}
      <SaleForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        refresh={() => loadSales(1)}
      />
    </div>
  );
}
