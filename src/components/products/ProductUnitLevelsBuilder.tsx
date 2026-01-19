"use client";

import React from "react";
import {
  Card,
  Row,
  Col,
  Button,
  InputNumber,
  Typography,
  Divider,
} from "antd";
import UnitSelector from "@/components/products/UnitSelector";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface UnitLevel {
  id?: number;
  unit_id: number | null;
  level: number;
  conversion_factor: number;
}

interface Props {
  productId?: number | null;
  value: UnitLevel[];
  onChange: (v: UnitLevel[]) => void;
}

export default function ProductUnitLevelsBuilder({ value, onChange }: Props) {
  const addLevel = () => {
    const nextLevel = value.length
      ? Math.max(...value.map((v) => v.level)) + 1
      : 1;

    onChange([
      ...value,
      {
        level: nextLevel,
        unit_id: null,
        conversion_factor: 1,
      },
    ]);
  };

  const update = (idx: number, changes: Partial<UnitLevel>) => {
    const copy = [...value];
    copy[idx] = { ...copy[idx], ...changes };
    onChange(copy);
  };

  const remove = (idx: number) => {
    const updated = [...value];
    updated.splice(idx, 1);

    const reordered = updated.map((u, i) => ({
      ...u,
      level: i + 1,
    }));

    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      {value.map((lvl, idx) => (
        <div key={idx} className="relative">
          {/* vertical connector line */}
          {idx > 0 && (
            <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-gray-300 rounded-full" />
          )}

          {/* card */}
          <Card
            size="small"
            className="shadow-sm border rounded-xl border shadow-sm my-2 transition"
            title={
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm text-gray-700">
                  Level {lvl.level} Unit
                </span>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => remove(idx)}
                />
              </div>
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary" className="text-sm block mb-1">
                  Select Unit
                </Text>

                <UnitSelector
                  value={lvl.unit_id}
                  onChange={(u) => update(idx, { unit_id: u })}
                  placeholder="Choose a unit"
                  style={{ width: "100%" }}
                />
              </Col>

              {lvl.level > 1 && (
                <Col span={12}>
                  <Text type="secondary" className="text-sm block mb-1">
                    Conversion Factor{" "}
                    <Text strong>
                      (L{lvl.level - 1} → L{lvl.level})
                    </Text>
                  </Text>

                  <InputNumber
                    min={1}
                    step={1}
                    value={lvl.conversion_factor}
                    onChange={(v) =>
                      update(idx, { conversion_factor: Number(v) })
                    }
                    style={{ width: "100%" }}
                  />
                </Col>
              )}
            </Row>
          </Card>
        </div>
      ))}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addLevel}
        style={{ width: "100%", height: 32, fontWeight: 500, fontSize: '12px' }}
      >
        Add Unit Level
      </Button>
    </div>
  );
}
