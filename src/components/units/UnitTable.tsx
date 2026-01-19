"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash } from "lucide-react";
import type { Unit } from "@/types/unit";

interface Props {
  units: Unit[];
  onEdit: (unit: Unit) => void;
  onDelete: () => void;
}

export default function UnitTable({ units, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  // 🔍 Filter
  const filtered = useMemo(() => {
    return units.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.short_code?.toLowerCase().includes(search.toLowerCase())
    );
  }, [units, search]);

  // 📄 Pagination
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="space-y-4">

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search units..."
        className="border p-2 rounded-md w-full"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1); // reset page on search
        }}
      />

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Short Code</th>
              <th className="p-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-5 text-center text-gray-500">
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginated.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.short_code}</td>
                  <td className="p-3 text-right space-x-3">
                    <button
                      onClick={() => onEdit(u)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={onDelete}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-3">
        <p className="text-sm text-gray-600">
          Showing {paginated.length} of {filtered.length}
        </p>

        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
