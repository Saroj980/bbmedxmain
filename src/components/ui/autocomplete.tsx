/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface Option {
  label: string;
  value: number;
}

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
  options: Option[];
  placeholder?: string;
}

export default function AutoCompleteInput({
  value,
  onChange,
  options,
  placeholder = "Search..."
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    try{
    const selected = options.find((o) => o.value === value);
    const label = selected?.label || "";
    setInputValue(label);
    } catch (error) {
      console.error("Error setting input value:", error);
    }
  }, [value, options]);

  const filtered = useMemo(() => {
    if (!inputValue) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [inputValue, options]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
        const selected = filtered[highlightedIndex];
        setInputValue(selected.label);
        setOpen(false);
        onChange(selected.value);
      }
    }

    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="relative">
      <Input
        className="mt-1"
        placeholder={placeholder}
        value={inputValue}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setInputValue(e.target.value);
          setOpen(true);
          setHighlightedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <div className="absolute w-full bg-white border shadow-lg rounded-lg max-h-52 overflow-auto z-50">
          {filtered.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No results</div>
          ) : (
            filtered.map((opt, idx) => (
              <div
                key={opt.value}
                className={cn(
                  "px-3 py-2 cursor-pointer",
                  idx === highlightedIndex ? "bg-gray-200" : "hover:bg-gray-100"
                )}
                onMouseDown={() => {
                  setInputValue(opt.label);
                  setOpen(false);
                  onChange(opt.value);
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
