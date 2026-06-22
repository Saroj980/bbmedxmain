"use client";

import React, { useEffect, useState } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd/es/select";
import { api } from "@/lib/api";
import type { Unit } from "@/types/product";

interface Props extends Omit<SelectProps, "options"> {
  value?: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
}

export default function UnitSelector({ value, onChange, placeholder = "Select unit", ...rest }: Props) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    try {
    api.get("/units")
      .then((res) => {
        if (cancelled) return;
        const data = res.data.units || res.data.data || res.data || [];
        setUnits(data);
      })
      .catch(() => setUnits([]))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
    } finally {
      console.log('Done');
    }
  }, []);


  return (
    <Select
      showSearch
      placeholder={placeholder}
      value={value ?? undefined}
      loading={loading}
      optionFilterProp="label"
      onChange={(v) => onChange(v as number | null)}
      options={units.map(u => ({ label: `${u.name}${u.short_code ? ` (${u.short_code})` : ""}`, value: u.id }))}
      {...rest}
    />
  );
}
