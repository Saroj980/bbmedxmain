"use client";

import { useMemo, useState } from "react";
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2 } from "lucide-react";
import type { Category } from "@/types/category";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Props {
  nodeList: Category[];
  search: string;
  onAdd: (parent: Category | null) => void;
  onEdit: (cat: Category) => void;
  refresh: () => Promise<void>;
}

/* Highlight matching text */
function highlight(text: string, search: string) {
  if (!search.trim()) return text;
  const regex = new RegExp(`(${search})`, "gi");
  return text.replace(regex, `<mark class="bg-yellow-300">$1</mark>`);
}

/* Filter the nested tree */
function filterTree(nodes: Category[], search: string): Category[] {
  if (!search.trim()) return nodes;

  const term = search.toLowerCase();

  const recurse = (node: Category): Category | null => {
    const match = node.name.toLowerCase().includes(term);

    const filteredChildren = (node.children || [])
      .map((c) => recurse(c))
      .filter(Boolean) as Category[];

    if (match || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }

    return null;
  };

  return nodes.map((n) => recurse(n)).filter(Boolean) as Category[];
}

export default function CategoryTreeTable({
  nodeList,
  search,
  onAdd,
  onEdit,
  refresh
}: Props) {
  const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>({});

  const filteredTree = useMemo(
    () => filterTree(nodeList, search),
    [nodeList, search]
  );

  const toggle = (id: number) =>
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete "${cat.name}"?`)) return;

    try {
      await api.delete(`/categories/${cat.id}`);
      toast.success("Category deleted");
      await refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="bg-white border shadow-sm rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-right pr-6">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredTree.length === 0 ? (
            <tr>
              <td colSpan={2} className="p-6 text-center text-gray-500">
                No matching categories found
              </td>
            </tr>
          ) : (
            filteredTree.map((root) => (
              <Row
                key={root.id}
                node={root}
                level={0}
                expandedMap={expandedMap}
                toggle={toggle}
                search={search}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Row({
  node,
  level,
  expandedMap,
  toggle,
  search,
  onAdd,
  onEdit,
  onDelete
}: {
  node: Category;
  level: number;
  expandedMap: Record<number, boolean>;
  toggle: (id: number) => void;
  search: string;
  onAdd: (parent: Category | null) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  const expanded = expandedMap[node.id] ?? true;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <tr className="border-b hover:bg-gray-50">
        <td className="p-3">
          <div
            className="flex items-center gap-3"
            style={{ marginLeft: level * 20 }}
          >
            {hasChildren ? (
              <button
                onClick={() => toggle(node.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span className="w-5" />
            )}

            <span
              className="font-medium"
              dangerouslySetInnerHTML={{
                __html: highlight(node.name, search)
              }}
            />
          </div>
        </td>

        <td className="p-3 pr-6 text-right">
          <div className="flex justify-end gap-3">
            <button
              className="text-green-600 hover:text-green-800"
              onClick={() => onAdd(node)}
            >
              <Plus size={16} />
            </button>

            <button
              className="text-blue-600 hover:text-blue-800"
              onClick={() => onEdit(node)}
            >
              <Pencil size={16} />
            </button>

            <button
              className="text-red-600 hover:text-red-800"
              onClick={() => onDelete(node)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>

      {hasChildren && expanded &&
        node.children!.map((c) => (
          <Row
            key={c.id}
            node={c}
            level={level + 1}
            expandedMap={expandedMap}
            toggle={toggle}
            search={search}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </>
  );
}
