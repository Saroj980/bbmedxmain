/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { X, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
// import  "@lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, TreeSelect, Tag, InputNumber, Switch, AutoComplete } from "antd";
import type { SelectProps } from "antd";
import type { ProductFieldDefinition } from "@/types/product-field";
import type { Category } from "@/types/category";
import { toTitleCase, generateKeyFromLabel } from "@/lib/utils";


interface Props {
  open: boolean;
  onClose: () => void;
  refresh: () => Promise<void>;
  editData?: ProductFieldDefinition | null;
}

type OptionItem = { id: string; label: string; value: string };

const FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "select",
  "radio",
  "checkbox",
  "date",
  "boolean",
  'dictionary'
] as const;

export default function FieldForm({ open, onClose, refresh, editData }: Props) {
  const isEdit = Boolean(editData);

  // core
  const [label, setLabel] = useState("");
  const [keyName, setKeyName] = useState("");
  const [type, setType] = useState<string>("text");
  const [required, setRequired] = useState<boolean>(false);
  const [order, setOrder] = useState<number | null>(0);

  // manual options
  const [options, setOptions] = useState<OptionItem[]>([]);

  // dictionary
  const [useDictionary, setUseDictionary] = useState(false);
  const [dictionaryCategories, setDictionaryCategories] = useState<{ id: number; name: string, label: string }[]>([]);
  const [dictionaryCategoryId, setDictionaryCategoryId] = useState<number | null>(null);
  const [dictionaryValues, setDictionaryValues] = useState<{ id: number; value: string }[]>([]);

  // validation
  const [validation, setValidation] = useState<any>({ numeric: false });

  // applies to (categories)
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [appliesTo, setAppliesTo] = useState<number[] | null>(null);
  const [catTreeData, setCatTreeData] = useState<any[]>([]);

  // autocomplete input (for text fields)
  const [textAutoValue, setTextAutoValue] = useState<string>("");
  const [autoOptions, setAutoOptions] = useState<{ value: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const [hasTypedKey, setHasTypedKey] = useState(false);


  const genId = useCallback(() => `opt_${Math.random().toString(36).slice(2, 9)}`, []);

  /* -------------------- load initial lists -------------------- */
  useEffect(() => {
    let cancelled = false;

    api.get("/categories")
      .then((res) => {
        if (cancelled) return;
        const list: Category[] = res.data.categories || res.data.data || res.data || [];
        setAllCategories(list);

        // build simple flat->tree (works with flat parent references)
        const nodesById: Record<number, any> = {};
        list.forEach((c) => {
          nodesById[c.id] = { title: c.name, value: c.id, key: c.id, children: [] };
        });
        const roots: any[] = [];
        list.forEach((c) => {
          if (c.parent_id && nodesById[c.parent_id]) {
            nodesById[c.parent_id].children.push(nodesById[c.id]);
          } else {
            roots.push(nodesById[c.id]);
          }
        });
        setCatTreeData(roots);
      })
      .catch(() => setAllCategories([]));

    api.get("/dictionary/categories")
      .then((res) => {
        if (cancelled) return;
        setDictionaryCategories(Array.isArray(res.data) ? res.data : res.data.categories || []);
      })
      .catch(() => setDictionaryCategories([]));

    return () => {
      cancelled = true;
    };
  }, []);

  // load dictionary values when dictionary category changes
  useEffect(() => {
    let cancelled = false;
    if (!dictionaryCategoryId) {
      setDictionaryValues([]);
      return;
    }
    api.get(`/dictionary/values?category_id=${dictionaryCategoryId}`)
      .then((res) => {
        if (cancelled) return;
        setDictionaryValues(Array.isArray(res.data) ? res.data : res.data.values || []);
      })
      .catch(() => setDictionaryValues([]));
    return () => { cancelled = true; };
  }, [dictionaryCategoryId]);

  /* -------------------- populate when editing/opening -------------------- */
  useEffect(() => {
    if (open && editData) {
      setLabel(editData.label ?? "");
      setKeyName(editData.key ?? "");
      setType(editData.type ?? "text");
      setRequired(Boolean(editData.required));
      setOrder(editData.order ?? 0);

      const ops: OptionItem[] = Array.isArray(editData.options)
        ? (editData.options as string[]).map((s, idx) => ({ id: `${idx}`, label: String(s), value: String(s) }))
        : [];
      setOptions(ops);
      setValidation(editData.validation ?? { numeric: false });
      setAppliesTo(editData.applies_to ?? null);

      if ((editData as any).dictionary) {
        setUseDictionary(true);
        setDictionaryCategoryId(Number((editData as any).dictionary));
      } else {
        setUseDictionary(false);
        setDictionaryCategoryId(null);
      }
    } else if (open && !editData) {
      setLabel("");
      setKeyName("");
      setType("text");
      setRequired(false);
      setOptions([]);
      setValidation({ numeric: false });
      setAppliesTo(null);
      setOrder(0);
      setUseDictionary(false);
      setDictionaryCategoryId(null);
    }
  }, [open, editData]);

  /* -------------------- keyboard shortcuts -------------------- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, label, keyName, type, options, validation, appliesTo, required, order, dictionaryCategoryId, useDictionary]);

  /* -------------------- option helpers -------------------- */
  const addOption = () => setOptions((s) => [...s, { id: genId(), label: "New option", value: "" }]);
  const updateOption = (id: string, patch: Partial<OptionItem>) => setOptions((s) => s.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const removeOption = (id: string) => setOptions((s) => s.filter((o) => o.id !== id));
  const moveOption = (from: number, to: number) =>
    setOptions((s) => {
      const copy = [...s];
      const [m] = copy.splice(from, 1);
      copy.splice(to, 0, m);
      return copy;
    });

  /* -------------------- merged options: manual + dictionary -------------------- */
  const mergedOptions = useMemo(() => {
    const manual = options.map((o) => ({ label: o.label, value: o.value || o.label }));
    const dict = dictionaryValues.map((d) => ({ label: d.value, value: d.value }));
    const seen = new Set<string>();
    const combined: { label: string; value: string }[] = [];
    manual.concat(dict).forEach((it) => {
      if (!seen.has(it.value)) {
        seen.add(it.value);
        combined.push(it);
      }
    });
    return combined;
  }, [options, dictionaryValues]);

  /* -------------------- helpers for "save new dictionary values" -------------------- */
  const getNewValuesNotInDictionary = (currentValues: string[]) => {
    const existing = new Set(dictionaryValues.map((d) => d.value));
    return currentValues.filter((v) => !existing.has(v) && v.trim() !== "");
  };

  const saveNewValuesToDictionary = async (values: string[]) => {
    if (!dictionaryCategoryId) {
      toast.error("Choose a dictionary category first");
      return;
    }
    const toCreate = getNewValuesNotInDictionary(values);
    if (!toCreate.length) {
      toast.info("No new values to add");
      return;
    }

    try {
      setLoading(true);
      // assume API accepts array or single; create sequentially for compatibility
      for (const v of toCreate) {
        await api.post("/dictionary/values", { category_id: dictionaryCategoryId, value: v });
      }
      // refresh dictionary values
      const res = await api.get(`/dictionary/values?category_id=${dictionaryCategoryId}`);
      setDictionaryValues(Array.isArray(res.data) ? res.data : res.data.values || []);
      toast.success(`${toCreate.length} value(s) added to dictionary`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save dictionary values");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- text-field autocomplete handlers -------------------- */
  useEffect(() => {
    // fill autocomplete options from dictionaryValues (if chosen) + manual options
    const setFrom = () => {
      const list = [
        ...new Set([
          ...dictionaryValues.map((d) => d.value),
          ...options.map((o) => o.value || o.label),
        ]),
      ];
      setAutoOptions(list.map((v) => ({ value: v })));
    };
    setFrom();
  }, [dictionaryValues, options]);

  const handleTextAutoSelect = (val: string) => {
    setTextAutoValue(val);
  };

  /* -------------------- submit handler -------------------- */
  const handleSubmit = async () => {
    if (!label.trim()) {
      toast.error("Label is required");
      return;
    }
    if (!keyName.trim()) {
      toast.error("Key is required");
      return;
    }
    if (!/^[a-z0-9_]+$/i.test(keyName)) {
      toast.error("Key must be alphanumeric or underscore (no spaces)");
      return;
    }

    const payload: Partial<ProductFieldDefinition> = {
      label: label.trim(),
      key: keyName.trim(),
      type,
      required,
      order,
      options:
        type === "select" || type === "radio" || type === "checkbox"
          ? mergedOptions.map((o) => o.value)
          : null,
      validation,
      applies_to: appliesTo ?? null,
      dictionary: type === "dictionary" && dictionaryCategoryId ? String(dictionaryCategoryId) : null,
    };

    try {
      setLoading(true);
      if (isEdit && editData?.id) {
        await api.put(`/product-fields/${editData.id}`, payload);
        toast.success("Field updated");
      } else {
        await api.post("/product-fields", payload);
        toast.success("Field created");
      }
      await refresh();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI render -------------------- */
  const treeSelectProps = {
    showSearch: true,
    treeCheckable: true,
    placeholder: "Select categories (optional)",
    allowClear: true,
    treeDefaultExpandAll: true,
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[720px] bg-white shadow-2xl transition-transform flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h3 className="text-lg font-semibold text-[#2F3E46]">
              {isEdit ? "Edit Field Definition" : "New Field Definition"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Use Ctrl+Enter to save. Inputs use text-sm.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 rounded border text-sm"
              onClick={() => {
                setKeyName((p) => `${p}_copy`);
                setLabel((p) => `${p} copy`);
              }}
            >
              Duplicate
            </button>

            <button className="p-2 rounded hover:bg-gray-100" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Label</label>
              <Input value={label}   onChange={(e) => {
                    const newLabel = e.target.value;
                    setLabel(newLabel);

                    // Auto update key only if user didn’t manually change it
                    if (!hasTypedKey) {
                      setKeyName(generateKeyFromLabel(newLabel));
                    }
                  }} 
                  className="mt-2 text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Key</label>
              <Input
                value={keyName}
                onChange={(e) => {
                  setHasTypedKey(true);        // user has overridden auto mode
                  setKeyName(e.target.value);
                }}
                className="mt-2 text-sm"
                placeholder="expiry_date or batch_no"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <Select
                className="w-full text-sm mt-1"
                placeholder="Select field type"
                value={type}
                onChange={(value) => setType(value)}
                showSearch={{
                  optionFilterProp: "label",
                }}
                options={FIELD_TYPES.map((t) => ({
                  label: toTitleCase(t),
                  value: t,
                }))}
                allowClear={false}
              />

            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Required</label>
              <div className="mt-2 flex items-center gap-3">
                <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
                <span className="text-sm text-gray-600">Make this field required</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Order</label>
              <div className="mt-2 flex items-center gap-3">
              <InputNumber
                value={order ?? 0}
                onChange={(v) => setOrder(Number(v) || 0)}
                className="w-full mt-2 text-sm"
              />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Applies to (Categories)</label>
              <div className="mt-2">
                <TreeSelect
                  className="w-full text-sm"
                  treeData={catTreeData}
                  value={appliesTo ?? []}
                  onChange={(vals: any) =>
                    setAppliesTo(Array.isArray(vals) ? vals.map(Number) : vals ? [Number(vals)] : null)
                  }
                  {...treeSelectProps}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {appliesTo && appliesTo.length > 0 ? (
                    ''
                  ) : (
                    <span className="text-xs text-gray-400 italic">Applies to all</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- DICTIONARY TYPE UI - ONLY SHOWS WHEN type === 'dictionary' ---------------- */}
          {type === "dictionary" && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-3">
              <label className="text-sm font-medium text-gray-700">Dictionary Category</label>

             <Select
              className="w-full text-sm mt-1"
              placeholder="Choose dictionary category"
              showSearch={{
                optionFilterProp: "label",
              }}
              value={dictionaryCategoryId ?? undefined}
              onChange={(v) => setDictionaryCategoryId(Number(v))}
              options={dictionaryCategories.map((d) => ({
                label: d.label,
                value: d.id,
              }))}
              allowClear
            />


              <p className="text-xs text-gray-500">
                This field will load values dynamically from the selected dictionary category.
              </p>
            </div>
          )}

          {/* Options builder for select/radio/checkbox */}
          {(type === "select" || type === "radio" || type === "checkbox") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Options</h4>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Switch checked={useDictionary} onChange={(v) => setUseDictionary(Boolean(v))} /> <span>Use dictionary</span>
                  </div>

                  <Button variant="outline" onClick={() => addOption()}>
                    <Plus size={14} /> Add option
                  </Button>
                </div>
              </div>

              {useDictionary && (
                <div className="grid grid-cols-2 gap-3 items-start">
                  <div>
                    <label className="text-sm">Dictionary Category</label>
                    <div className="mt-2">
                    <Select
                      className="w-full text-sm mt-1"
                      placeholder="Choose dictionary category"
                      showSearch={{
                        optionFilterProp: "label",
                      }}
                      value={dictionaryCategoryId ?? undefined}
                      onChange={(v) => setDictionaryCategoryId(Number(v))}
                      options={dictionaryCategories.map((d) => ({
                        label: d.label,
                        value: d.id,
                      }))}
                      allowClear
                    />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm">Merged options (editable tags)</label>
                    <div className="mt-2">
                      <Select
                        mode="tags"
                        className="w-full text-sm"
                        placeholder="Type and press enter to add option"
                        value={mergedOptions.map((o) => o.value)}
                        onChange={(vals: any) => {
                          const arr: string[] = Array.isArray(vals) ? vals.map(String) : [];
                          const dictSet = new Set(dictionaryValues.map((d) => d.value));
                          const newManualValues = arr.filter((v) => !dictSet.has(v));
                          const newManualOpts = newManualValues.map((v, idx) => ({ id: `m_${idx}_${v}`, label: v, value: v }));
                          setOptions(newManualOpts);
                        }}
                        options={mergedOptions.map((o) => ({ label: o.label, value: o.value }))}
                        // onSearch={() => {}}
                        tokenSeparators={[","]}
                      />


                    </div>
                  </div>
                </div>
              )}

              {/* Manual options editor */}
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <button
                        className="p-1 rounded border text-sm hover:bg-gray-100"
                        onClick={() => idx > 0 && moveOption(idx, idx - 1)}
                        title="Move up"
                        disabled={idx === 0}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        className="p-1 rounded border text-sm hover:bg-gray-100"
                        onClick={() => idx < options.length - 1 && moveOption(idx, idx + 1)}
                        title="Move down"
                        disabled={idx === options.length - 1}
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <Input
                      value={opt.label}
                      onChange={(e) => updateOption(opt.id, { label: e.target.value })}
                      className="flex-1 text-sm"
                      placeholder="Label"
                    />
                    <Input
                      value={opt.value}
                      onChange={(e) => updateOption(opt.id, { value: e.target.value })}
                      className="w-48 text-sm"
                      placeholder="Value (optional)"
                    />
                    <button className="p-2 text-red-600" onClick={() => removeOption(opt.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {options.length === 0 && <div className="text-sm text-gray-500">No manual options yet.</div>}
              </div>

              <div>
                <label className="text-sm font-medium">Merged options preview</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mergedOptions.length === 0 ? (
                    <span className="text-sm text-gray-500">No options</span>
                  ) : (
                    mergedOptions.map((o) => (
                      <Tag key={o.value} className="text-sm">
                        {o.label}
                      </Tag>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Validation */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Validation</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Min (numeric)</label>
                <Input
                  type="number"
                  value={validation.min ?? ""}
                  placeholder="Enter minimum value"
                  onChange={(e) => setValidation((v: any) => ({ ...v, min: e.target.value ? Number(e.target.value) : null }))}
                  className="mt-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm">Max (numeric)</label>
                <Input
                  type="number"
                  value={validation.max ?? ""}
                  placeholder="Enter maximum value"
                  onChange={(e) => setValidation((v: any) => ({ ...v, max: e.target.value ? Number(e.target.value) : null }))}
                  className="mt-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm">Min length</label>
                <Input
                  type="number"
                  value={validation.minLength ?? ""}
                  placeholder="Enter minimum length"
                  onChange={(e) => setValidation((v: any) => ({ ...v, minLength: e.target.value ? Number(e.target.value) : null }))}
                  className="mt-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm">Max length</label>
                <Input
                  type="number"
                  value={validation.maxLength ?? ""}
                  placeholder="Enter maximum value"
                  onChange={(e) => setValidation((v: any) => ({ ...v, maxLength: e.target.value ? Number(e.target.value) : null }))}
                  className="mt-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm">Regex / Pattern</label>
                <Input
                  value={validation.regex ?? ""}
                  onChange={(e) => setValidation((v: any) => ({ ...v, regex: e.target.value || null }))}
                  className="mt-2 text-sm"
                  placeholder="e.g., ^[A-Z0-9\-]+$"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" checked={!!validation.numeric} onChange={(e) => setValidation((v: any) => ({ ...v, numeric: e.target.checked }))} />
              <span className="text-sm">Numeric only</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="bg-[#009966] text-white" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update Field" : "Create Field"}
          </Button>
        </div>
      </aside>
    </>
  );
}