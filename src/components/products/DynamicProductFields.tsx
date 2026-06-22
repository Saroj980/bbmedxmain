/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Select, InputNumber, Switch, Input } from "antd";
import { api } from "@/lib/api";
import DictionarySelectOptimistic from "./DictionarySelectOptimistic";

type Props = {
  categoryId?: number | null;
  value: Record<string, any>;
  onChange: (val: Record<string, any>) => void;
};

export default function DynamicProductFields({
  categoryId,
  value,
  onChange,
}: Props) {
  const [fields, setFields] = useState<any[]>([]);
  const [dictValues, setDictValues] = useState<Record<number, any[]>>({});

  /* ---------------- SAFE UPDATE ---------------- */
 const update = (key: string, val: any) => {
  onChange((prev: Record<string, any>) => ({
    ...(prev && typeof prev === "object" && !Array.isArray(prev) ? prev : {}),
    [key]: val,
  }));
};


  /* ---------------- Load Field Definitions ---------------- */
  useEffect(() => {
    api.get("/product-fields").then((res) => {
      const list = res.data || [];

      const filtered = list.filter((f: any) => {
        if (!f.applies_to || f.applies_to.length === 0) return true;
        return categoryId ? f.applies_to.includes(categoryId) : false;
      });

      setFields(filtered);
    });
  }, [categoryId]);

  /* ---------------- Load Dictionary Values ---------------- */
  useEffect(() => {
    fields.forEach((f) => {
      if (f.type === "dictionary" && f.dictionary && !dictValues[f.dictionary]) {
        api
          .get(`/dictionary/values?category_id=${f.dictionary}`)
          .then((res) => {
            setDictValues((prev) => ({
              ...prev,
              [f.dictionary]: res.data || [],
            }));
          });
      }
    });
  }, [fields]);

  /* ---------------- Render ---------------- */
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field) => {
        const fieldValue =
          value && Object.prototype.hasOwnProperty.call(value, field.key)
            ? value[field.key]
            : undefined;

        if (field.type === "dictionary") {
          const options =
            dictValues[field.dictionary]?.map((v) => ({
              label: v.value,
              value: v.value,
            })) || [];

          return (
            <div key={field.id}>
              <label className="text-sm font-medium">{field.label}</label>
              <DictionarySelectOptimistic
                value={fieldValue}
                categoryId={field.dictionary}
                options={options}
                onChange={(v) => update(field.key, v)} 
                setOptions={(opts) =>
                  setDictValues((prev) => ({
                    ...prev,
                    [field.dictionary]: opts.map(o => ({ value: o.value })),
                  }))
                }
              />
            </div>
          );
        }

        if (field.type === "number") {
          return (
            <div key={field.id}>
              <label className="text-sm font-medium">{field.label}</label>
              <InputNumber
                className="w-full"
                value={fieldValue}
                onChange={(v) => update(field.key, v)}
              />
            </div>
          );
        }

        if (field.type === "textarea") {
          return (
            <div key={field.id}>
              <label className="text-sm font-medium">{field.label}</label>
              <textarea
                className="w-full p-2 border rounded"
                value={fieldValue ?? ""}
                onChange={(e) => update(field.key, e.target.value)}
              />
            </div>
          );
        }

        if (field.type === "boolean") {
          return (
            <div key={field.id} className="flex items-center gap-2">
              <Switch
                checked={!!fieldValue}
                onChange={(v) => update(field.key, v)}
              />
              <label>{field.label}</label>
            </div>
          );
        }

        return (
          <div key={field.id}>
            <label className="text-sm font-medium">{field.label}</label>
            <Input
              value={fieldValue ?? ""}
              onChange={(e) => update(field.key, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}
