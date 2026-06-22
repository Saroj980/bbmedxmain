"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string | number;
}

interface SelectSearchProps {
  options: Option[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  placeholder?: string;
}

export function SelectSearch({
  options,
  value,
  onChange,
  placeholder = "Select...",
}: SelectSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm shadow-sm hover:bg-gray-50"
      >
        <span className={cn(selectedLabel ? "text-gray-900" : "text-gray-400")}>
          {selectedLabel || placeholder}
        </span>

        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-xl animate-fadeIn">
          {/* Search Box */}
          <div className="p-2 border-b">
            <input
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-[#009966]"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Options */}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-gray-100",
                    value === opt.value && "bg-gray-50"
                  )}
                >
                  <span>{opt.label}</span>

                  {value === opt.value && (
                    <Check className="h-4 w-4 text-[#009966]" />
                  )}
                </div>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-gray-500">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
