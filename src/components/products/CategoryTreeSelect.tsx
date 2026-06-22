/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { TreeSelect } from "antd";
import type { TreeSelectProps } from "antd/es/tree-select";
import { api } from "@/lib/api";
import type { Category } from "@/types/product";

interface Props extends Omit<TreeSelectProps, "treeData"> {
  value?: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
}

function toTreeData(list: Category[]): any {
  return list.map((c) => ({
    title: c.name,
    value: c.id,
    key: c.id,
    children: c.children && c.children.length ? toTreeData(c.children) : undefined,
  }));
}

export default function CategoryTreeSelect({ value, onChange, placeholder = "Select category", ...rest }: Props) {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    try {
       api.get("/categories/tree")
      .then((res) => {
        if (cancelled) return;
        const data = Array.isArray(res.data) ? res.data : res.data.categories ?? [];
        setTreeData(toTreeData(data));
      })
      .catch(() => setTreeData([]))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
    } catch (error) {
      console.log(error)
    }
  }, []);

  return (
    <TreeSelect
      style={{ width: "100%" }}
      value={value ?? undefined}
      treeData={treeData}
      placeholder={placeholder}
      allowClear
      showSearch
      filterTreeNode={(input, treeNode) =>
        (treeNode.title as string).toLowerCase().includes(String(input).toLowerCase())
      }
      loading={loading}
      onChange={(v) => onChange(v as number | null)}
      {...rest}
    />
  );
}
