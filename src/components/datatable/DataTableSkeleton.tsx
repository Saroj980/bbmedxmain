"use client";

export default function DataTableSkeleton() {
  return (
    <div className="animate-pulse border rounded-xl bg-white overflow-hidden">
      <div className="h-14 bg-gray-200" />

      <div className="space-y-2 p-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded" />
        ))}
      </div>
    </div>
  );
}
