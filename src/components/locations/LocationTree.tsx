/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { Location } from "@/types/location";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface LocationTreeProps {
  roots: Location[];
  search?: string;
  expandAll?: boolean;
  onAddChild?: (loc: Location) => void;
  onEdit?: (loc: Location) => void;
  onDelete?: (loc: Location) => void;
}

export default function LocationTree({
  roots = [],
  search = "",
  expandAll = false,
  onAddChild = () => {},
  onEdit = () => {},
  onDelete = () => {},
}: LocationTreeProps) {
  return (
    <div className="space-y-2">
      {roots.length === 0 ? (
        <div className="p-6 text-gray-500">No locations found</div>
      ) : (
        roots.map((root) => (
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
        ))
      )}
    </div>
  );
}

function TreeNode({
  node,
  level = 0,
  search = "",
  expandAll,
  onAddChild,
  onEdit,
  onDelete,
}: any) {
  const [open, setOpen] = useState<boolean>(!!expandAll);
  const [children, setChildren] = useState<Location[] | null>(
    Array.isArray(node.children) ? node.children : null
  );
  const [loading, setLoading] = useState<boolean>(false);

  const mayHaveChildren =
    (node as any).has_children ??
    (children ? children.length > 0 : true);

  useEffect(() => {
    setOpen(expandAll);
    if (expandAll) loadChildren();
  }, [expandAll]);

  const loadChildren = useCallback(async () => {
    if (children !== null) return;

    setLoading(true);
    try {
      const res = await api.get(`/locations/${node.id}/children`);
      const list = Array.isArray(res.data)
        ? res.data
        : res.data.children ?? [];
      setChildren(list);
    } finally {
      setLoading(false);
    }
  }, [children, node.id]);

  const toggle = async () => {
    if (!open && children === null) await loadChildren();
    setOpen((v) => !v);
  };

  const highlight = () => {
    if (!search) return node.name;
    const regex = new RegExp(`(${search})`, "ig");
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: node.name.replace(
            regex,
            `<mark class='bg-yellow-200'>$1</mark>`
          ),
        }}
      />
    );
  };

  const childCount = Array.isArray(children) ? children.length : undefined;

  return (
    <div className="rounded-md">
      {/* Card container */}
      <div
        className="flex items-center justify-between p-2 rounded-lg shadow-sm border hover:shadow-md transition group"
        style={{
          marginLeft: level * 16,
          borderLeft: `4px solid hsl(${130 + level * 8}, 40%, 70%)`,
        }}
      >
        {/* Left: icon + name */}
        <div className="flex items-center gap-2">
          {mayHaveChildren ? (
            <button
              onClick={toggle}
              className="p-1 rounded hover:bg-gray-100 transition"
            >
              {open ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          <span className="font-medium text-gray-900">{highlight()}</span>

          {node.parent_name && (
            <span className="text-xs text-gray-500">
              ({node.parent_name})
            </span>
          )}

          {typeof childCount === "number" && (
            <span className="text-xs bg-gray-200 px-2 rounded-full">
              {childCount}
            </span>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onAddChild(node)}
            className="text-green-600 hover:text-green-800 p-1"
          >
            <Plus size={14} />
          </button>

          <button
            onClick={() => onEdit(node)}
            className="text-blue-600 hover:text-blue-800 p-1"
          >
            <Pencil size={14} />
          </button>

          <button
            onClick={() => onDelete(node)}
            className="text-red-600 hover:text-red-800 p-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Children section */}
      {open && (
        <div className="ml-4 space-y-1">
          {loading && (
            <p className="text-sm text-gray-500 ml-8">Loading…</p>
          )}

          {!loading && children?.length === 0 && (
            <p className="text-sm text-gray-400 ml-8">No child locations</p>
          )}


          {!loading &&
            children?.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
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

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
