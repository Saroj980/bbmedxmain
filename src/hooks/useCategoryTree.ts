/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export type TreeNode = {
  title: string;
  value: number;
  key: number;
  children?: TreeNode[];
};

export function useCategoryTree() {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    try{    
      api
      .get("/categories/tree")
      .then((res) => {
        if (cancelled) return;
        const list = res.data || [];
        setTreeData(buildTree(list));
      })
      .catch(() => setTreeData([]))
      .finally(() => !cancelled && setLoading(false));
    } finally {
      cancelled = false;
      setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return { treeData, loading };
}

function buildTree(items: any[]): TreeNode[] {
  return items.map((c) => ({
    title: c.name,
    value: c.id,
    key: c.id,
    children: c.children?.length ? buildTree(c.children) : undefined,
  }));
}
