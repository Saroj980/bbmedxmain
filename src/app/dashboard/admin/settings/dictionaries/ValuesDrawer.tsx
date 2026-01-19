"use client";

import { Drawer, Button, Input, Table } from "antd";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ValuesDrawer({ open, onClose, category }) {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newValue, setNewValue] = useState("");

  const loadValues = async () => {
    if (!category) return;

    setLoading(true);
    const res = await api.get(`/dictionary/values?category_id=${category.id}`);
    setValues(res.data);
    setLoading(false);
  };

  useEffect(() => {
    if (open) loadValues();
  }, [open]);

  const addValue = async () => {
    if (!newValue.trim()) return toast.error("Value required");

    await api.post("/dictionary/values", {
      category_id: category.id,
      value: newValue,
    });

    setNewValue("");
    loadValues();
  };

  const deleteValue = async (id) => {
    await api.delete(`/dictionary/values/${id}`);
    loadValues();
  };

  const columns = [
    { title: "Value", dataIndex: "value" },
    {
      title: "Actions",
      render: (_, row) => (
        <Button danger size="small" onClick={() => deleteValue(row.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={420}
      title={`Dictionary Values: ${category?.label || ""}`}
      destroyOnClose
    >
      <div className="space-y-4">
        <div>
          <Input
            placeholder="New value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <Button
            type="primary"
            className="mt-2 w-full"
            onClick={addValue}
          >
            Add Value
          </Button>
        </div>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={values}
          columns={columns}
        />
      </div>
    </Drawer>
  );
}
