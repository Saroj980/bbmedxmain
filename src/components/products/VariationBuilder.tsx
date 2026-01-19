"use client";

import React from "react";
import { Button, InputNumber } from "antd";
import UnitSelector from "@/components/products/UnitSelector";
import type { VariationLevel, Unit } from "@/types/product";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { api } from "@/lib/api";

interface Props {
  value?: VariationLevel[];
  onChange: (v: VariationLevel[]) => void;
  className?: string;
}

export default function VariationBuilder({ value = [], onChange, className }: Props) {
  const addLevel = () => {
    const nextLevel = (value.length ? Math.max(...value.map(v => v.level)) + 1 : 0);
    onChange([...value, { level: nextLevel, unit_id: null, ratioToParent: 1 }]);
  };

  const updateAt = (idx: number, patch: Partial<VariationLevel>) => {
    const copy = [...value];
    copy[idx] = { ...copy[idx], ...patch };
    onChange(copy);
  };

  const removeAt = (idx: number) => {
    const copy = [...value];
    copy.splice(idx, 1);
    onChange(copy);
  };

  // compute human readable conversions to top-level
  const computeRelative = (idx: number) => {
    let acc = 1;
    for (let i = 1; i <= idx; i++) {
      acc = acc * (value[i].ratioToParent ?? 1);
    }
    return acc;
  };

  return (
    <div className={className}>
      <div className="space-y-3">
        {value.map((lvl, idx) => (
          <div key={lvl.level} className="flex items-center gap-3">
            <div className="w-12 text-sm text-gray-600">Level {idx + 1}</div>

            <div className="flex-1">
              <UnitSelector
                value={lvl.unit_id ?? null}
                onChange={(id) => updateAt(idx, { unit_id: id })}
                placeholder="Select unit for this level"
              />
            </div>

            {idx > 0 && (
              <div className="w-44">
                <div className="text-xs text-gray-500 mb-1">Ratio: 1 parent =</div>
                <InputNumber
                  min={0.0001}
                  step={0.1}
                  value={lvl.ratioToParent}
                  onChange={(v) => updateAt(idx, { ratioToParent: Number(v) })}
                  style={{ width: "100%" }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  (relative to level {idx})
                </div>
              </div>
            )}

            <div>
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeAt(idx)} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <Button type="dashed" onClick={addLevel} icon={<PlusOutlined />}>Add Level</Button>
      </div>
    </div>
  );
}
