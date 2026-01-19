/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { Category } from "@/types/category";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  roots: Category[];
  search: string;
  expandAll: boolean;
  onAddChild: (cat: Category) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

export default function CategoryTree({
  roots,
  search,
  expandAll,
  onAddChild,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="space-y-2">
      {roots.map((root) => (
        <TreeNode
          key={root.id}
          node={root}
          level={0}
          search={search}
          expandAll={expandAll}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function TreeNode({
  node,
  level,
  search,
  expandAll,
  onAddChild,
  onEdit,
  onDelete,
}: any) {
  const [open, setOpen] = useState(expandAll);
  const [children, setChildren] = useState(node.children || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOpen(expandAll);
  }, [expandAll]);

  const loadChildren = useCallback(async () => {
    if (children !== null) return; // already loaded
    setLoading(true);
    const res = await api.get(`/categories/${node.id}`);
    setChildren(res.data.children || []);
    setLoading(false);
  }, [children, node.id]);

  const toggle = async () => {
    if (!open && children === null) await loadChildren();
    setOpen(!open);
  };

  const highlight = (name: string) => {
    if (!search) return name;
    return name.replace(
      new RegExp(`(${search})`, "gi"),
      `<mark class="bg-yellow-200">$1</mark>`
    );
  };

  return (
    <div
      className="rounded-md"
      style={{
        paddingLeft: `${level * 20}px`,
        borderLeft: level > 0 ? "3px solid #d1f2e1" : undefined,
      }}
    >
      <div className="flex items-center justify-between p-2 rounded-md bg-white shadow-sm hover:shadow-md transition group">

        {/* Left */}
        <div className="flex items-center gap-2">
          {children !== null || node.has_children ? (
            <button onClick={toggle} className="p-1 hover:bg-gray-100 rounded">
              {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : (
            <span className="w-5" />
          )}

          <span
            className="font-medium text-gray-800"
            dangerouslySetInnerHTML={{ __html: highlight(node.name) }}
          />

          {children?.length > 0 && (
            <span className="text-xs bg-gray-200 text-gray-700 px-2 rounded-full">
              {children.length}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onAddChild(node)}
            className="text-green-600 hover:text-green-800"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => onEdit(node)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(node)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Children */}
      {open && (
        <div className="ml-4 mt-1 space-y-1">
          {loading && <p className="text-sm text-gray-500">Loading…</p>}
          {!loading &&
            children?.map((c: Category) => (
              <TreeNode
                key={c.id}
                node={c}
                level={level + 1}
                search={search}
                expandAll={expandAll}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
        </div>
      )}
    </div>
  );
}
