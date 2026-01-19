"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Location } from "@/types/location";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
  editData: Location | null;
  parentForNew: Location | null;
}

export default function LocationForm({ open, onClose, refresh, editData, parentForNew }: Props) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [list, setList] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all locations for dropdown
  useEffect(() => {
    api.get("/locations").then((res) => {
      setList(res.data);
    });

    if (open) {
      if (editData) {
        setName(editData.name);
        setParentId(editData.parent_id);
        setIsActive(editData.is_active);
      } else {
        setName("");
        // setParentId(null);
        setParentId(parentForNew ? parentForNew.id : null);
        setIsActive(true);
      }
    }
  }, [open, editData, parentForNew]);

  // ESC = close, ENTER = submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") handleSubmit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, name, parentId, isActive]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Name is required!");
    setLoading(true);

    try {
      if (editData) {
        await api.put(`/locations/${editData.id}`, {
          name,
          parent_id: parentId,
          is_active: isActive,
        });
        toast.success("Location updated");
      } else {
        await api.post("/save-location", {
          name,
          parent_id: parentId,
          is_active: isActive,
        });
        toast.success("Location created");
      }

      refresh();
      onClose();
    } catch {
      toast.error("Failed to save");
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
        fixed top-0 right-0 w-full sm:w-[420px] h-full bg-white z-[100]
        shadow-2xl transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-heading font-semibold">
            {editData ? "Edit Location" : "Add Location"}
          </h2>
          <button className="p-2 hover:bg-gray-200 rounded-full" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="font-medium text-sm">Location Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Parent */}
          <div>
            <label className="font-medium text-sm">Parent Location</label>
            <select
              value={parentId ?? ""}
              onChange={(e) =>
                setParentId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full p-2 border rounded-lg mt-1"
            >
              <option value="">None (Top Level)</option>
              {list
                .filter((loc) => loc.id !== editData?.id)
                .map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label className="text-sm font-medium">Active</label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-[#009966] text-white hover:bg-[#008456]"
              onClick={handleSubmit}
            >
              {loading ? "Saving..." : editData ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
