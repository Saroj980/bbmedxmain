"use client";

import { Select } from "antd";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export default function DictionarySelect({
  categoryId,
  value,
  onChange,
  placeholder = "Select value",
}) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!categoryId) return;

    api.get(`/dictionary/values?category_id=${categoryId}`)
      .then((res) => setItems(res.data ?? []));
  }, [categoryId]);

  return (
    <Select
      showSearch
      allowClear
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      optionFilterProp="label"
      options={items.map((v) => ({ label: v.value, value: v.value }))}
      className="w-full"
    />
  );
}
