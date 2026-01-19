import { Input } from "@/components/ui/input";

export function renderDynamicField(def, value, onChange) {
  const label = (
    <label className="text-sm font-medium text-gray-700">
      {def.label}
      {def.required ? <span className="text-red-600">*</span> : ""}
    </label>
  );

  switch (def.type) {
    case "text":
      return (
        <div>
          {label}
          <Input className="mt-2" value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );

    case "textarea":
      return (
        <div>
          {label}
          <textarea
            className="border rounded w-full p-2 mt-2"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case "number":
      return (
        <div>
          {label}
          <Input
            type="number"
            className="mt-2"
            value={value || ""}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      );

    case "date":
      return (
        <div>
          {label}
          <Input type="date" className="mt-2" value={value || ""} onChange={(e) => onChange(e.target.value)} />
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span>{def.label}</span>
        </div>
      );

    case "select":
      return (
        <div>
          {label}
          <select
            className="border rounded p-2 mt-2 w-full"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select...</option>
            {def.options?.map((o, i) => (
              <option key={i} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      );

    case "checkbox":
      return (
        <div>
          {label}
          <div className="mt-2 flex flex-wrap gap-4">
            {def.options?.map((o) => (
              <label key={o} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(value || []).includes(o)}
                  onChange={(e) => {
                    const arr = new Set(value || []);
                    e.target.checked ? arr.add(o) : arr.delete(o);
                    onChange([...arr]);
                  }}
                />
                {o}
              </label>
            ))}
          </div>
        </div>
      );

    case "radio":
      return (
        <div>
          {label}
          <div className="mt-2 flex gap-4">
            {def.options?.map((o) => (
              <label key={o} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={value === o}
                  onChange={() => onChange(o)}
                />
                {o}
              </label>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
