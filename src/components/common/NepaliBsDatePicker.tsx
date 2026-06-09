"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { BSToAD } from "bikram-sambat-js";

const CSS_URL =
  "https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/css/nepali.datepicker.v5.0.6.min.css";
const JS_URL =
  "https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js";

let assetsReadyGlobal = false;
let assetsLoading: Promise<void> | null = null;

function loadPickerAssets(): Promise<void> {
  if (assetsReadyGlobal) return Promise.resolve();
  if (assetsLoading) return assetsLoading;

  assetsLoading = new Promise<void>((resolve) => {
    if (typeof document === "undefined") return resolve();

    if (!document.querySelector(`link[href="${CSS_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_URL;
      document.head.appendChild(link);
    }
    if (!document.querySelector(`script[src="${JS_URL}"]`)) {
      const script = document.createElement("script");
      script.src = JS_URL;
      script.onload = () => { assetsReadyGlobal = true; resolve(); };
      script.onerror = () => resolve();
      document.head.appendChild(script);
    } else {
      assetsReadyGlobal = true;
      resolve();
    }
  });

  return assetsLoading;
}

/** Convert a BS date string "YYYY-MM-DD" to AD "YYYY-MM-DD". Returns null on failure. */
function bsToAdString(bs: string | null | undefined): string | null {
  if (!bs) return null;
  try {
    // BSToAD accepts "YYYY-MM-DD" and returns "YYYY-MM-DD"
    return BSToAD(bs);
  } catch {
    return null;
  }
}

type Props = {
  /** BS date string (YYYY-MM-DD) to display, e.g. "2082-04-01" */
  value?: string | null;
  /** BS date string for min constraint, e.g. "2082-04-01" */
  minDate?: string | null;
  /** BS date string for max constraint, e.g. "2083-03-32" */
  maxDate?: string | null;
  /** Called with the corresponding AD date (YYYY-MM-DD) on selection */
  onChange: (adDate: string | null) => void;
};

export default function NepaliBsDatePicker({ value, minDate, maxDate, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [bsValue, setBsValue] = useState(value ?? "");
  const [ready, setReady] = useState(assetsReadyGlobal);

  // Ref so init() always reads the latest display value (avoids stale closure)
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const init = () => {
      setReady(true);
      if (!(el as any).nepaliDatePicker) return;
      try { (el as any).nepaliDatePicker("destroy"); } catch { /* ok */ }

      const opts: any = {
        dateFormat: "YYYY-MM-DD",
        language: "english",
        onSelect: ({ value: selectedBs }: any) => {
          setBsValue(selectedBs);
          onChange(bsToAdString(selectedBs)); // return AD to parent
        },
      };

      if (minDate) opts.minDate = minDate; // already BS — passed directly
      if (maxDate) opts.maxDate = maxDate; // already BS — passed directly

      (el as any).nepaliDatePicker(opts);

      // Set display from ref — always up-to-date, no stale closure
      const bsv = valueRef.current ?? "";
      setBsValue(bsv);
      if (inputRef.current) inputRef.current.value = bsv;
    };

    if (assetsReadyGlobal) {
      init();
    } else {
      loadPickerAssets().then(init);
    }

    return () => {
      try { (el as any).nepaliDatePicker("destroy"); } catch { /* ok */ }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDate, maxDate]);

  // Sync display when parent pushes a new BS value
  useEffect(() => {
    if (!ready) return;
    const bsv = value ?? "";
    setBsValue(bsv);
    if (inputRef.current) inputRef.current.value = bsv;
  }, [value, ready]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={bsValue}
      onChange={() => {}} // Controlled by nepaliDatePicker via ref
      placeholder="Date (BS)"
      readOnly
      style={{ fontSize: "12px" }}
      className="w-full px-3 py-2 border rounded-md text-xs cursor-pointer bg-white h-9"
    />
  );
}
