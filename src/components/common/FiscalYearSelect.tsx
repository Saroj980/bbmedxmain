"use client";

import { useEffect, useState } from "react";
import { Select } from "antd";
import { api } from "@/lib/api";

interface Props {
  value: string | number | null;
  onChange: (value: any, fy?: any) => void;
  onSelectObject?: (fy: any) => void;
  placeholder?: string;
  className?: string;
}

export default function FiscalYearSelect({ value, onChange, onSelectObject, placeholder = "Select Fiscal Year", className }: Props) {
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get("/fiscal-years")
      .then((res) => {
        setFiscalYears(res.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (val: any) => {
    const fy = fiscalYears.find(f => String(f.id) === String(val));
    onChange(val, fy);
    if (onSelectObject) {
        onSelectObject(fy);
    }
  };

  return (
    <Select
      loading={loading}
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={handleSelect}
      options={fiscalYears.map((fy) => ({
        label: `${fy.name} (${fy.bs_start} - ${fy.bs_end})`,
        value: fy.id,
      }))}
      style={{ width: '100%' }}
    />
  );
}
