/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Select, Input, Button, Divider } from "antd";
import { useState } from "react";
import { api } from "@/lib/api";
import { success, error, warn } from "@/utils/notify";

type Option = {
  label: string;
  value: string;
};

type Props = {
  value?: string;
  onChange: (v: string) => void;
  categoryId: number;
  options: Option[];
  setOptions: (opts: Option[]) => void;
};

export default function DictionarySelectOptimistic({
  value,
  onChange,
  categoryId,
  options,
  setOptions,
}: Props) {
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);

  const addValue = async () => {
    const val = newValue.trim();

    if (!val) {
      warn("Invalid input", "Please enter a value");
      return;
    }

    if (options.some(o => o.value.toLowerCase() === val.toLowerCase())) {
      warn("Duplicate value", "This value already exists");
      return;
    }

    // optimistic update
    const optimistic = { label: val, value: val };
    setOptions([...options, optimistic]);
    onChange(val);
    setNewValue("");

    try {
      setLoading(true);

      await api.post("/dictionary/values", {
        category_id: categoryId,
        value: val,
      });

      success("Saved", "Dictionary value added");
    } catch (e) {
      setOptions(options);
      onChange("");
      error("Failed", "Unable to save dictionary value");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      className="w-full text-sm"
      showSearch
      allowClear
      value={value ?? undefined}
      options={options}
      placeholder="Select or add value"

      /** 🔥 THIS IS THE FIX */
      onChange={(v) => onChange(v ?? "")}

      popupRender={(menu) => (
        <>
          {menu}
          <Divider className="my-2" />
          <div className="flex gap-2 px-2 pb-2">
            <Input
              size="small"
              placeholder="Add new value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addValue()}
            />
            <Button
              size="small"
              type="primary"
              loading={loading}
              onClick={addValue}
            >
              Add
            </Button>
          </div>
        </>
      )}
    />
  );
}
