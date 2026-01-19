"use client";

import { Modal, Input, Form, Button } from "antd";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function CategoryForm({ open, onClose, refresh, editData }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editData) form.setFieldsValue(editData);
    else form.resetFields();
  }, [editData, open]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    try {
      if (editData) {
        await api.put(`/dictionary/categories/${editData.id}`, values);
        toast.success("Category updated");
      } else {
        await api.post("/dictionary/categories", values);
        toast.success("Category created");
      }

      refresh();
      onClose();
    } catch (err) {
      toast.error("Failed");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editData ? "Edit Category" : "New Category"}
      footer={null}
      destroyOnClose
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="label"
          label="Label"
          rules={[{ required: true, message: "Label required" }]}
        >
          <Input className="text-sm" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Key (unique identifier)"
          rules={[{ required: true, message: "Key required" }]}
        >
          <Input className="text-sm" />
        </Form.Item>

        <Button type="primary" onClick={handleSubmit} className="w-full">
          {editData ? "Update" : "Create"}
        </Button>
      </Form>
    </Modal>
  );
}
