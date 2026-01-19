"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Unit } from "@/types/unit";

interface UnitFormProps {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
  editData: Unit | null;
}

export default function UnitForm({
  open,
  onClose,
  refresh,
  editData,
}: UnitFormProps) {
  const [name, setName] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [loading, setLoading] = useState(false);

  // RESET or FILL FORM when drawer opens
  useEffect(() => {
    if (open) {
      if (editData) {
        setName(editData.name);
        setShortCode(editData.short_code || "");
      } else {
        setName("");
        setShortCode("");
      }
    }
  }, [open, editData]);

  // ESC to close & ENTER to save
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      // ENTER key submits ONLY when inputs are focused
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, name, shortCode, editData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Unit name is required.");
      return;
    }

    setLoading(true);

    try {
      if (editData) {
        await api.put(`/units/${editData.id}`, {
          name,
          short_code: shortCode,
        });
        toast.success("Unit updated successfully");
      } else {
        await api.post("/save-unit", {
          name,
          short_code: shortCode,
        });
        toast.success("Unit added successfully");
      }

      refresh();
      onClose();
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-[420px]
          bg-white shadow-2xl z-[100]
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-semibold text-[#2F3E46] font-heading">
            {editData ? "Edit Unit" : "Add New Unit"}
          </h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200/40 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="p-6 space-y-5">
          {/* Unit Name */}
          <div>
            <label className="text-sm font-medium text-[#2F3E46]">
              Unit Name <span className="text-red-600">*</span>
            </label>
            <Input
              placeholder="e.g., Tablet, Strip, Box"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="mt-1"
            />
          </div>

          {/* Short Code */}
          <div>
            <label className="text-sm font-medium text-[#2F3E46]">
              Short Code
            </label>
            <Input
              placeholder="TAB, STR, BOX"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel (Esc)
            </Button>

            <Button
              className="bg-[#009966] text-white hover:bg-[#008456]"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save (Enter)"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
